import {appConfig} from "../utils/app-config";
import {userStore} from "../state/user-state";

/* GET /api/ws/?token=<jwt> — a native WebSocket (backend/modules/ws/ws_router.py), not
   socket.io. Push-only: the server never expects anything back, it just sends a JSON payload
   per event — see message-socket-service.ts for the "message" shape. The server closes the
   connection if the token is missing or invalid (WS_1008_POLICY_VIOLATION), so this only opens
   once a token exists, and reopens whenever it changes (login/register/logout). */

export interface SocketPayload {
    type: string;
    message: unknown;
}

type SocketListener = (payload: SocketPayload) => void;

function toWebSocketUrl(token: string): string {
    const url = new URL(appConfig.apiAddress + "ws/", window.location.href);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.searchParams.set("token", token);
    return url.toString();
}

class SocketService {

    private _socket: WebSocket | null = null;
    private lastToken: string | null = null;
    private readonly listeners: SocketListener[] = [];

    constructor() {
        userStore.subscribe(() => this.syncConnection());
        this.syncConnection();
    }

    private syncConnection(): void {
        const token = userStore.getState().token;
        if (token === this.lastToken) return;
        this.lastToken = token;

        this._socket?.close();
        this._socket = null;
        if (!token) return;

        const socket = new WebSocket(toWebSocketUrl(token));
        socket.onmessage = event => {
            const payload = JSON.parse(event.data) as SocketPayload;
            this.listeners.forEach(listener => listener(payload));
        };
        this._socket = socket;
    }

    /* Registered once per domain-specific *-socket-service.ts (e.g. message-socket-service.ts) —
       every listener sees every payload and filters by payload.type itself. */
    public on(listener: SocketListener): void {
        this.listeners.push(listener);
    }
}

export const socketService = new SocketService();
