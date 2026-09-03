from sqlmodel import Session, select

from message.message import Message
from room.room import Room, RoomReadDTO
from room_user.room_user_service import room_user_service
from utils.app_errors import NotFoundError
from ws.connection_manager import connection_manager


class RoomService:

    def get_room_list_by_user(self, user_id: int, session: Session):
        return room_user_service.get_room_list_by_user(user_id, session)

    def add_room(self, room: Room, user_list, session: Session):
        room.is_active = True
        session.add(room)
        session.commit()  # INSERT
        session.refresh(room)
        room_user_service.add_user_list_to_room(room.id, user_list, session)
        self._sync_presence_for_new_room(user_list)
        return RoomReadDTO(id=room.id, name=room.name, user_list=user_list)

    def _sync_presence_for_new_room(self, user_list) -> None:
        """A brand-new room's members were never each other's "contacts" before now, so
        neither one's earlier connect-time presence broadcast (ws_router.py) ever reached
        the other. Tell each member about every already-online member, right now."""
        for user in user_list:
            for other in user_list:
                if other.id != user.id and connection_manager.is_online(other.id):
                    connection_manager.send_to_user(user.id, {"type": "presence", "user_id": other.id, "online": True})

    def leave_room(self, room_id: int, user_id: int, session: Session):
        room = session.get(Room, room_id)
        if room is None:
            raise NotFoundError(f"room {room_id} not found")
        room_dto = RoomReadDTO(
            id=room.id,
            name=room.name,
            user_list=room_user_service.get_user_list_by_room(room_id, session),
        )

        room_user_service.remove_user_from_room(room_id, user_id, session)

        remaining_users = room_user_service.get_user_list_by_room(room_id, session)
        if not remaining_users:
            message_list = session.exec(select(Message).where(Message.room_id == room_id)).all()
            for message in message_list:
                session.delete(message)
            session.delete(room)
            session.commit()

        return room_dto

room_service = RoomService()