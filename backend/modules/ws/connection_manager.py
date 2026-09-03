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

    def disconnect(self, user_id: int, websocket: WebSocket) -> bool:
        """Returns True when this was the user's last open connection (i.e. they just went
        fully offline) — the caller uses that to decide whether to broadcast presence."""
        connections = self._connections.get(user_id)
        if not connections:
            return False
        if websocket in connections:
            connections.remove(websocket)
        if not connections:
            self._connections.pop(user_id, None)
            return True
        return False

    def is_online(self, user_id: int) -> bool:
        return bool(self._connections.get(user_id))

    def send_to_user(self, user_id: int, payload: dict) -> None:
        if self._loop is None:
            return
        for websocket in list(self._connections.get(user_id, [])):
            future = asyncio.run_coroutine_threadsafe(websocket.send_json(payload), self._loop)
            # A connection that died without a clean close handshake (sleep/wake, network
            # drop, killed tab) lingers here until something tries to write to it — prune it
            # then instead of leaving it to accumulate and get retried on every future send.
            future.add_done_callback(lambda f, ws=websocket: self.disconnect(user_id, ws) if f.exception() else None)


connection_manager = ConnectionManager()
