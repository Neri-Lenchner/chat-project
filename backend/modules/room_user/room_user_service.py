from sqlmodel import Session, select

from room_user.room_user import RoomUser
from user.user import User


class RoomUserService:

    def get_room_list_by_user(self, user_id: int, session: Session):
        # user = project_service.get_project_by_id(project_id, session)
        # if not user:
        #     return None
        room_user_list = session.exec(select(RoomUser).where(RoomUser.user_id == user_id)).all()
        room_list = list(map(lambda room_user: room_user.room, room_user_list))
        return room_list

    def add_user_list_to_room(self, roomId: int, user_list: list[User], session: Session):
        # person = person_service.get_person_by_id(person_id, session)
        # if person is None:
        #     return None
        # project = project_service.get_project_by_id(project_id, session)
        # if project is None:
        #     return None
        for user in user_list:
            room_user = RoomUser(user_id=user.id, room_id=roomId)
            session.add(room_user)
            session.commit()  # INSERT
            session.refresh(room_user)
        return

room_user_service = RoomUserService()

