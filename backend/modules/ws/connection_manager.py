import asyncio

from fastapi import WebSocket


class ConnectionManager:
    """Tracks each user's active WebSocket connections and pushes messages to them.

    The rest of the app (message_service, in particular) is entirely synchronous — it runs
    in FastAPI's request threadpool, not on the event loop the WebSocket lives on. send_to_user
    is therefore a plain sync method: it hands the actual send off to that loop with
    run_coroutine_threadsafe instead of requiring every caller up the stack to become async.
    """

    def __init__(self):
        self._connections: dict[int, list[WebSocket]] = {}
        self._loop: asyncio.AbstractEventLoop | None = None

    async def connect(self, user_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self._loop = asyncio.get_running_loop()
        self._connections.setdefault(user_id, []).append(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket) -> None:
        connections = self._connections.get(user_id)
        if not connections:
            return
        if websocket in connections:
            connections.remove(websocket)
        if not connections:
            self._connections.pop(user_id, None)

    def send_to_user(self, user_id: int, payload: dict) -> None:
        if self._loop is None:
            return
        for websocket in list(self._connections.get(user_id, [])):
            asyncio.run_coroutine_threadsafe(websocket.send_json(payload), self._loop)


connection_manager = ConnectionManager()
