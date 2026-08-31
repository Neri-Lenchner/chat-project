from fastapi import Depends, APIRouter
from sqlmodel import Session

from app_config.database import get_session
from message.message import MessageCreateDTO, MessageReadDTO
from message.message import Message
from message.message_service import message_service


router = APIRouter(
    prefix="/api/message",
)


@router.post("/user/{user_id}/other/{other_user_id}", response_model=MessageReadDTO)
def add_message(message_create_dto: MessageCreateDTO, user_id : int, other_user_id: int, session: Session = Depends(get_session)):
    message = Message.from_dto(message_create_dto)
    return message_service.add_massage(message, user_id, other_user_id, session)


@router.get("/room/{room_id}", response_model=list[MessageReadDTO])
def get_message_list_by_room(room_id : int, session: Session = Depends(get_session)):
    return message_service.get_message_list_by_room(room_id, session)