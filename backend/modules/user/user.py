from sqlmodel import SQLModel, Field

from utils.dto_mixin import DTOMixin


class User(DTOMixin, SQLModel, table=True):
    __tablename__ = "user"

    id: int | None = Field(default=None, primary_key=True)
    first_name: str = Field(nullable=False)
    last_name: str = Field(nullable=False)
    phone_number: str = Field(nullable=False)

class UserCreateDTO(SQLModel):
  first_name: str
  last_name: str
  phone_number: str


class UserReadDTO(SQLModel):
  id: int
  first_name: str
  last_name: str
  phone_number: str

