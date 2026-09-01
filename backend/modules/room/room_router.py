from typing import List
from fastapi import APIRouter
from fastapi.params import Depends
from sqlmodel import Session

from app_config.database import get_session
from room.room_service import room_service

from room.room import RoomReadDTO, RoomCreateDTO, Room

router = APIRouter(
    prefix="/api/room",
)

@router.get("/user/{user_id}", response_model=List[RoomReadDTO])
def get_room_list_by_user(user_id: int, session: Session = Depends(get_session)):
    return room_service.get_room_list_by_user(user_id, session)

@router.post("/", response_model=RoomReadDTO)
def add_room(room_create_dto: RoomCreateDTO, session: Session = Depends(get_session)):
    room = Room.from_dto(room_create_dto) # dto to entity
    return room_service.add_room(room, room_create_dto.user_list, session)

@router.delete("/{room_id}/user/{user_id}", response_model=RoomReadDTO)
def leave_room(room_id: int, user_id: int, session: Session = Depends(get_session)):
    return room_service.leave_room(room_id, user_id, session)
