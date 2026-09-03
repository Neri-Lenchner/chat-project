from fastapi import APIRouter
from fastapi.params import Depends
from sqlmodel import Session

from app_config.database import get_session
from user.user import AuthResponseDTO, UserCreateDTO, UserLoginDTO, UserReadDTO, User
from user.user_service import user_service

router = APIRouter(
    prefix="/api/user",
)

@router.post("/", response_model=AuthResponseDTO)
def register(user_create_dto: UserCreateDTO, session: Session = Depends(get_session)):
    user = User.from_dto(user_create_dto)
    return user_service.register(user, session)

@router.post("/login", response_model=AuthResponseDTO)
def login(user_login_dto: UserLoginDTO, session: Session = Depends(get_session)):
    return user_service.login(user_login_dto.phone_number, session)

@router.get("/phone/{phone_number}", response_model=UserReadDTO)
def get_by_phone(phone_number: str, session: Session = Depends(get_session)):
    return user_service.get_by_phone(phone_number, session)