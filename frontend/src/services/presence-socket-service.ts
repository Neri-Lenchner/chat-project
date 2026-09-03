import {socketService} from "./socket-service";
import {presenceStore, PresenceActionType} from "../state/presence-state";

/* Following the message-socket-service.ts split — one domain-specific listener per real-time
   concern, on top of the shared socketService. Payload shapes come from
   backend/modules/ws/ws_router.py: {"type": "presence_snapshot", "online_user_ids": [...]}
   sent once right after connecting, and {"type": "presence", "user_id", "online"} on every
   change after that. */

class PresenceSocketService {

    private listening: boolean = false;

    public listenForPresenceChanges(): void {
        if (this.listening) return;
        this.listening = true;

        socketService.on(payload => {
            if (payload.type === "presence_snapshot") {
                presenceStore.dispatch({
                    type: PresenceActionType.SetSnapshot,
                    payload: payload.online_user_ids as number[],
                });
                return;
            }

            if (payload.type !== "presence") return;
            const userId = payload.user_id as number;
            presenceStore.dispatch({
                type: payload.online ? PresenceActionType.SetOnline : PresenceActionType.SetOffline,
                payload: userId,
            });
        });
    }
}

export const presenceSocketService = new PresenceSocketService();
