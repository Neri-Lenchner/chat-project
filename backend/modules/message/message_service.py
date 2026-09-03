from sqlmodel import Session, select

from message.message import Message, MessageReadDTO
from room.room import Room
from room.room_service import room_service
from room_user.room_user_service import room_user_service
from user.user import User
from utils.app_errors import NotFoundError
from ws.connection_manager import connection_manager


class MessageService:

    def add_massage(self, message: Message, user_id: int, other_user_id: int, session: Session):
        # Get 2 params - userId and the other userId.
        user = User()
        user.id = user_id
        other_user = User()
        other_user.id = other_user_id
        if message.room_id is None:
            room = Room()
            room.is_active = True
            room.name = ""
            room_from_db = room_service.add_room(room, [user, other_user], session)
            message.room_id = room_from_db.id
        elif session.get(Room, message.room_id) is None:
            raise NotFoundError(f"room {message.room_id} not found")
        message.user_id = user_id
        message.is_read = False
        session.add(message)
        session.commit()  # INSERT
        session.refresh(message)

        room = session.get(Room, message.room_id)
        room.last_message_id = message.id
        session.add(room)
        session.commit()

        self._broadcast_new_message(message, session)

        return message

    def _broadcast_new_message(self, message: Message, session: Session) -> None:
        message_dto = MessageReadDTO(
            id=message.id,
            content=message.content,
            room_id=message.room_id,
            user_id=message.user_id,
            is_read=message.is_read,
            date_time=message.date_time,
        )
        # mode="json" — date_time must serialize to a JSON-safe ISO string, not a raw
        # datetime object, since this dict goes straight to websocket.send_json.
        payload = {"type": "message", "message": message_dto.model_dump(mode="json")}
        for member in room_user_service.get_user_list_by_room(message.room_id, session):
            if member.id != message.user_id:
                connection_manager.send_to_user(member.id, payload)

    def get_message_list_by_room(self, room_id: int, session: Session):
        # room = project_service.get_project_by_id(project_id, session)
        # if not user:
        #     return None
        message_list = session.exec(select(Message).where(Message.room_id == room_id)).all()
        return message_list

    def mark_room_read(self, room_id: int, reader_id: int, session: Session) -> None:
        """Marks every message in room_id NOT sent by reader_id as read — i.e. reader_id
        just read everything the other side(s) sent them — and tells those senders."""
        room_messages = session.exec(select(Message).where(Message.room_id == room_id)).all()
        unread = [message for message in room_messages if message.user_id != reader_id and not message.is_read]
        if not unread:
            return

        for message in unread:
            message.is_read = True
            session.add(message)
        session.commit()

        payload = {"type": "read", "room_id": room_id, "reader_id": reader_id}
        sender_ids = {message.user_id for message in unread}
        for sender_id in sender_ids:
            connection_manager.send_to_user(sender_id, payload)


message_service = MessageService()

