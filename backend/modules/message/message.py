from sqlmodel import SQLModel, Field

from utils.dto_mixin import DTOMixin


class Message(DTOMixin, SQLModel, table=True):
    __tablename__ = "message"
    id: int | None = Field(default=None, primary_key=True)
    content: str = Field(nullable=False)
    # date_time: datetime = Field(default_factory=datetime.now, nullable=False)
    room_id: int | None = Field(default=None, nullable=False)
    user_id: int = Field(nullable=False)
    is_read: bool = Field(default=False, nullable=False)

class MessageCreateDTO(SQLModel):
    content: str
    room_id: int | None = None


class MessageReadDTO(SQLModel):
    id: int
    content: str
    room_id: int
    user_id: int
    is_read: bool
