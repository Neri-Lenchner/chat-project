from fastapi import APIRouter
from fastapi.params import Depends
from sqlmodel import Session

from app_config.database import get_session
from user.user import UserReadDTO, UserCreateDTO, User
from user.user_service import user_service

router = APIRouter(
    prefix="/api/user",
)

@router.post("/", response_model=UserReadDTO)
def add_person(user_create_dto: UserCreateDTO, session: Session = Depends(get_session)):
    user = User.from_dto(user_create_dto)
    return user_service.add_user(user, session)