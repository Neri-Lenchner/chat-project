from datetime import datetime, timezone

from pydantic import field_validator
from sqlmodel import SQLModel, Field

from utils.dto_mixin import DTOMixin
from utils.validators import not_blank, positive_int


def _now_utc() -> datetime:
    # Naive, but always the UTC wall-clock value — MySQL's DATETIME has no tz of its own,
    # and driver round-trips drop tzinfo anyway. The client normalizes this back to a proper
    # UTC ISO string (see frontend/src/utils/mappers.ts#toMessage).
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Message(DTOMixin, SQLModel, table=True):
    __tablename__ = "message"
    id: int | None = Field(default=None, primary_key=True)
    content: str = Field(nullable=False)
    # Nullable: existing rows from before this column existed have no value. New rows always
    # get one via default_factory — see ADD COLUMN migration note in ARCHITECTURE-DECISIONS.md.
    date_time: datetime | None = Field(default_factory=_now_utc)
    room_id: int = Field(nullable=False)
    user_id: int = Field(nullable=False)
    is_read: bool = Field(default=False, nullable=False)

class MessageCreateDTO(SQLModel):
    content: str
    room_id: int

    _validate_content = field_validator("content")(not_blank)
    _validate_room_id = field_validator("room_id")(positive_int)


class MessageReadDTO(SQLModel):
    id: int
    content: str
    room_id: int
    user_id: int
    is_read: bool
    date_time: datetime | None = None
