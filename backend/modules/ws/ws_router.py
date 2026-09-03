import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status

from auth.token_service import token_service
from ws.connection_manager import connection_manager

router = APIRouter(
    prefix="/api/ws",
)


@router.websocket("/")
async def connect(websocket: WebSocket, token: str):
    try:
        payload = token_service.decode_access_token(token)
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError, TypeError):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await connection_manager.connect(user_id, websocket)
    try:
        while True:
            # push-only channel — nothing is expected from the client; this just
            # blocks until the connection closes so disconnects are noticed.
            await websocket.receive_text()
    except WebSocketDisconnect:
        connection_manager.disconnect(user_id, websocket)
