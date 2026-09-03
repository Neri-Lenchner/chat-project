import {socketService} from "./socket-service";
import {MessageActionType, messageStore} from "../state/message-state";

/* Following the message-socket-service.ts split. Payload shape comes from
   backend/modules/message/message_service.py#mark_room_read:
   {"type": "read", "room_id", "reader_id"} — pushed to the sender(s) of the messages that
   were just marked read, so their own MessageItem ticks can flip to "read" live. */

class ReadSocketService {

    private listening: boolean = false;

    public listenForReadReceipts(): void {
        if (this.listening) return;
        this.listening = true;

        socketService.on(payload => {
            if (payload.type !== "read") return;
            messageStore.dispatch({
                type: MessageActionType.MarkMessagesReadByOther,
                payload: payload.room_id as number,
            });
        });
    }
}

export const readSocketService = new ReadSocketService();
