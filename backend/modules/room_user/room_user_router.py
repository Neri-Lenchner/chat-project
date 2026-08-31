from fastapi import APIRouter, Depends
from sqlmodel import Session

from app_config.database import get_session
from room.room import RoomReadDTO
from room_user.room_user_service import room_user_service

router = APIRouter(
    prefix="/api/room-user",
)

@router.get("/room/{user_id}", response_model=list[RoomReadDTO])
def get_room_list_by_user(user_id: int, session: Session = Depends(get_session)):
    room_list = room_user_service.get_room_list_by_user(user_id, session)
    return room_list

