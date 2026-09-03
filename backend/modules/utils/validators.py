import re

# Same pattern as PHONE_PATTERN in frontend/src/component/auth/register/Register.tsx —
# applied after stripping spaces and hyphens, so validation stays identical client and server side.
PHONE_PATTERN = re.compile(r"^0(5\d|[2-4]|[8-9]|7\d)\d{7}$")


def not_blank(value: str) -> str:
    if value is None or not value.strip():
        raise ValueError("field is required and cannot be blank")
    return value.strip()


def not_empty_list(value: list) -> list:
    if not value:
        raise ValueError("field is required and cannot be empty")
    return value


def positive_int(value: int) -> int:
    if value is None or value <= 0:
        raise ValueError("field must be a positive integer")
    return value


def valid_name(value: str) -> str:
    value = not_blank(value)
    if len(value) < 2:
        raise ValueError("field must be at least 2 characters")
    return value


def valid_phone_number(value: str) -> str:
    value = not_blank(value).replace(" ", "").replace("-", "")
    if not PHONE_PATTERN.match(value):
        raise ValueError("field is not a valid phone number")
    return value
