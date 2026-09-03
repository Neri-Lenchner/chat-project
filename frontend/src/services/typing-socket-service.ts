import {socketService} from "./socket-service";
import {typingStore, TypingActionType} from "../state/typing-state";

/* Following the message-socket-service.ts split. Payload shape comes from
   backend/modules/ws/ws_router.py#_handle_client_event:
   {"type": "typing", "room_id", "user_id", "is_typing"} — user_id isn't used here since a
   1:1 room only ever has one "other" side to begin with (same limitation Composer.tsx
   already has for sending). */

const TYPING_TTL_MS = 4000;

class TypingSocketService {

    private listening: boolean = false;

    public listenForTyping(): void {
        if (this.listening) return;
        this.listening = true;

        socketService.on(payload => {
            if (payload.type !== "typing") return;
            const roomId = payload.room_id as number;

            if (payload.is_typing) {
                typingStore.dispatch({
                    type: TypingActionType.SetTyping,
                    payload: {roomId, until: Date.now() + TYPING_TTL_MS},
                });
            } else {
                typingStore.dispatch({type: TypingActionType.ClearTyping, payload: roomId});
            }
        });
    }
}

export const typingSocketService = new TypingSocketService();
