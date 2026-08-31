from sqlmodel import Session, select

from message.message import Message
from room.room import Room
from room.room_service import room_service
from user.user import User


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
        message.user_id = user_id
        message.is_read = False
        session.add(message)
        session.commit()  # INSERT
        session.refresh(message)
        return message

    def get_message_list_by_room(self, room_id: int, session: Session):
        # room = project_service.get_project_by_id(project_id, session)
        # if not user:
        #     return None
        message_list = session.exec(select(Message).where(Message.room_id == room_id)).all()
        return message_list


message_service = MessageService()

