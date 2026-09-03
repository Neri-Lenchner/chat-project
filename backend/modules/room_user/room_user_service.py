from sqlmodel import Session, select

from room.room import Room, RoomReadDTO
from room_user.room_user import RoomUser
from user.user import User


class RoomUserService:

    def get_room_list_by_user(self, user_id: int, session: Session):
        room_user_list = session.exec(
            select(RoomUser)
            .join(Room)
            .where(RoomUser.user_id == user_id)
            .order_by(Room.last_message_id.desc(), Room.id.desc())
        ).all()
        room_list = list(map(lambda room_user: room_user.room, room_user_list))
        users_by_room = self.get_user_list_by_rooms([room.id for room in room_list], session)
        return [
            RoomReadDTO(id=room.id, name=room.name, user_list=users_by_room.get(room.id, []))
            for room in room_list
        ]

    def get_user_list_by_room(self, room_id: int, session: Session):
        return session.exec(
            select(User).join(RoomUser, RoomUser.user_id == User.id).where(RoomUser.room_id == room_id)
        ).all()

    def get_contact_ids(self, user_id: int, session: Session) -> list[int]:
        """Every other user who shares at least one room with user_id — used for presence
        broadcasts (ws_router), not for anything message/room related."""
        room_ids = session.exec(select(RoomUser.room_id).where(RoomUser.user_id == user_id)).all()
        if not room_ids:
            return []
        other_user_ids = session.exec(
            select(RoomUser.user_id)
            .where(RoomUser.room_id.in_(room_ids), RoomUser.user_id != user_id)
            .distinct()
        ).all()
        return list(other_user_ids)

    def get_user_list_by_rooms(self, room_ids: list[int], session: Session):
        if not room_ids:
            return {}
        rows = session.exec(
            select(RoomUser.room_id, User)
            .join(User, RoomUser.user_id == User.id)
            .where(RoomUser.room_id.in_(room_ids))
        ).all()
        users_by_room = {}
        for room_id, user in rows:
            users_by_room.setdefault(room_id, []).append(user)
        return users_by_room

    def remove_user_from_room(self, room_id: int, user_id: int, session: Session):
        room_user = session.exec(
            select(RoomUser).where(RoomUser.room_id == room_id, RoomUser.user_id == user_id)
        ).first()
        if room_user is None:
            return
        session.delete(room_user)
        session.commit()

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

