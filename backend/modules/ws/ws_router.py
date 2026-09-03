import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from sqlmodel import Session

from app_config.database import engine
from auth.token_service import token_service
from room_user.room_user_service import room_user_service
from ws.connection_manager import connection_manager

router = APIRouter(
    prefix="/api/ws",
)


def _broadcast_presence(user_id: int, online: bool) -> None:
    with Session(engine) as session:
        contact_ids = room_user_service.get_contact_ids(user_id, session)
    payload = {"type": "presence", "user_id": user_id, "online": online}
    for contact_id in contact_ids:
        connection_manager.send_to_user(contact_id, payload)


async def _handle_client_event(user_id: int, data: dict) -> None:
    if not isinstance(data, dict) or data.get("type") != "typing":
        return
    room_id = data.get("room_id")
    if not isinstance(room_id, int):
        return
    is_typing = bool(data.get("is_typing", True))

    with Session(engine) as session:
        members = room_user_service.get_user_list_by_room(room_id, session)

    payload = {"type": "typing", "room_id": room_id, "user_id": user_id, "is_typing": is_typing}
    for member in members:
        if member.id != user_id:
            connection_manager.send_to_user(member.id, payload)


@router.websocket("/")
async def connect(websocket: WebSocket, token: str):
    try:
        payload = token_service.decode_access_token(token)
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError, TypeError):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await connection_manager.connect(user_id, websocket)

    # Tell the newly-connected client who among their contacts is already online, and
    # tell those contacts that this user just came online — both directions are needed
    # since neither side otherwise learns the other's current state.
    with Session(engine) as session:
        contact_ids = room_user_service.get_contact_ids(user_id, session)
    online_contact_ids = [contact_id for contact_id in contact_ids if connection_manager.is_online(contact_id)]
    connection_manager.send_to_user(user_id, {"type": "presence_snapshot", "online_user_ids": online_contact_ids})
    _broadcast_presence(user_id, online=True)

    try:
        while True:
            try:
                data = await websocket.receive_json()
            except ValueError:
                # Malformed JSON from the client — ignore this message, keep listening.
                continue
            await _handle_client_event(user_id, data)
    except WebSocketDisconnect:
        was_last_connection = connection_manager.disconnect(user_id, websocket)
        if was_last_connection:
            _broadcast_presence(user_id, online=False)
