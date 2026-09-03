import os
from datetime import datetime, timedelta, timezone

import jwt

from user.user import User

# override locally with the JWT_SECRET environment variable
jwt_secret = os.getenv("JWT_SECRET", "dev-secret-change-me")

JWT_ALGORITHM = "HS256"
TOKEN_LIFETIME = timedelta(days=30)


class TokenService:
    """Creates and verifies the JWT issued to a user after register/login."""

    def create_access_token(self, user: User) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            "sub": str(user.id),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone_number": user.phone_number,
            "iat": now,
            "exp": now + TOKEN_LIFETIME,
        }
        return jwt.encode(payload, jwt_secret, algorithm=JWT_ALGORITHM)

    def decode_access_token(self, token: str) -> dict:
        """Raises jwt.PyJWTError (expired, malformed, bad signature, ...) on an invalid token."""
        return jwt.decode(token, jwt_secret, algorithms=[JWT_ALGORITHM])


token_service = TokenService()
