from pydantic import field_validator
from sqlmodel import SQLModel, Field

from utils.dto_mixin import DTOMixin
from utils.validators import valid_name, valid_phone_number


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

  _validate_first_name = field_validator("first_name")(valid_name)
  _validate_last_name = field_validator("last_name")(valid_name)
  _validate_phone_number = field_validator("phone_number")(valid_phone_number)


class UserLoginDTO(SQLModel):
  phone_number: str

  _validate_phone_number = field_validator("phone_number")(valid_phone_number)


class UserReadDTO(SQLModel):
  id: int
  first_name: str
  last_name: str
  phone_number: str


# Response of POST /api/user/ — just the JWT. It already carries the full user record
# (see auth/token_service.py), so there's no need to also return a separate user object.
class AuthResponseDTO(SQLModel):
  token: str

