from pydantic import field_validator
from sqlmodel import SQLModel, Field

from user.user import User, UserReadDTO
from utils.dto_mixin import DTOMixin
from utils.validators import not_blank, not_empty_list


class Room(DTOMixin, SQLModel, table=True):
    __tablename__ = "room"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    is_active: bool = Field(default=False, nullable=False)
    last_message_id: int | None = Field(default=None, nullable=True)

class RoomCreateDTO(SQLModel):
  name: str
  user_list: list[UserReadDTO]

  _validate_name = field_validator("name")(not_blank)
  _validate_user_list = field_validator("user_list")(not_empty_list)


class RoomReadDTO(SQLModel):
  id: int
  name: str
  user_list: list[UserReadDTO] = Field(default_factory=list)

