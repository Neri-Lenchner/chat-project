from sqlmodel import SQLModel, Field, Relationship

from room.room import Room
from user.user import UserReadDTO
from utils.dto_mixin import DTOMixin


class RoomUser(DTOMixin, SQLModel, table=True):
    __tablename__ = "room_user"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(default=None, foreign_key="user.id")
    room_id: int = Field(default=None, foreign_key="room.id")
    room: Room = Relationship(sa_relationship_kwargs={"lazy": "joined"})


class RoomUserCreateDTO(SQLModel):
    user_list: list[UserReadDTO]
    room_id: int


# class PersonProjectReadDTO(SQLModel):
#     project: ProjectReadDTO
