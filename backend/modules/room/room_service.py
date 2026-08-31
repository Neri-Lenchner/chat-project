from sqlmodel import Session, select

from room.room import Room
from room_user.room_user_service import room_user_service


class RoomService:

    def add_room(self, room: Room, user_list, session: Session):
        room.is_active = True
        session.add(room)
        session.commit()  # INSERT
        session.refresh(room)
        room_user_service.add_user_list_to_room(room.id, user_list, session)
        return room

room_service = RoomService()