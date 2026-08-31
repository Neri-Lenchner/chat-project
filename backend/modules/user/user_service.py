from sqlalchemy.orm import session
from sqlmodel import Session, select
from user.user import User


class UserService:

    def add_user(self, user: User, session: Session):
        session.add(user)
        session.commit()  # INSERT
        session.refresh(user)
        return user

user_service = UserService()
