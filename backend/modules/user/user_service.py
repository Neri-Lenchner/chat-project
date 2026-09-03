from sqlmodel import Session, select

from auth.token_service import token_service
from user.user import AuthResponseDTO, User
from utils.app_errors import ConflictError, NotFoundError


class UserService:

    def register(self, user: User, session: Session) -> AuthResponseDTO:
        existing = session.exec(select(User).where(User.phone_number == user.phone_number)).first()
        if existing is not None:
            raise ConflictError(f"phone number {user.phone_number} is already registered")

        session.add(user)
        session.commit()  # INSERT
        session.refresh(user)

        token = token_service.create_access_token(user)
        return AuthResponseDTO(token=token)

    def login(self, phone_number: str, session: Session) -> AuthResponseDTO:
        user = session.exec(select(User).where(User.phone_number == phone_number)).first()
        if user is None:
            raise NotFoundError(f"no user registered with phone number {phone_number}")

        token = token_service.create_access_token(user)
        return AuthResponseDTO(token=token)

    def get_by_phone(self, phone_number: str, session: Session) -> User:
        user = session.exec(select(User).where(User.phone_number == phone_number)).first()
        if user is None:
            raise NotFoundError(f"no user registered with phone number {phone_number}")
        return user

user_service = UserService()
