import {http} from "../utils/http";
import {Message, MessageDTO} from "../models/message";
import {RoomPreview} from "../models/room";
import {toMessage, toMessageCreateDTO} from "../utils/mappers";
import {MessageActionType, messageStore} from "../state/message-state";
import {RoomActionType, roomStore} from "../state/room-state";
import {userStore} from "../state/user-state";

/* Following the docs/front-example/src/services/course-service.ts pattern.
   One-time load — not for the whole app like roomService.isFetched, but
   per room individually (messageStore.loadedRooms[roomId]), because rooms are loaded
   on demand when entered. */

class MessageService {

    /* Temporary ids for pending/failed messages, before the server assigns a real id.
       Negative so they don't collide with real ids from the server. */
    private nextTempId: number = -1;

    public async getMessagesByRoom(roomId: number, force: boolean = false): Promise<Message[]> {
        if (!messageStore.getState().loadedRooms[roomId] || force) {
            const currentUser = userStore.getState().user;
            if (!currentUser) {
                return messageStore.getState().messagesByRoom[roomId] ?? [];
            }
            try {
                const response = await http.get<MessageDTO[]>("message/room/" + roomId);

                /* The actual order is by ascending id; sorted anyway just to be safe (API SPEC §3.4). */
                const sortedDtoList = [...response.data].sort((a, b) => a.id - b.id);

                const messages = sortedDtoList.map(dto => toMessage(dto, currentUser.id));

                messageStore.dispatch({
                    type: MessageActionType.GetMessages,
                    payload: {roomId, messages},
                });
            } catch (err) {
                console.error("Error from getMessagesByRoom");
                throw err;
            }
        }
        return messageStore.getState().messagesByRoom[roomId] ?? [];
    }

    /* Section 21 of the spec. The message appears in pending state immediately (temp id), and after
       the server responds it's replaced by the final object — .msg--pending/.msg--failed
       in MessageItem are derived directly from status, so Thread renders everything
       without knowing about pending at all. There's no GET after sending — the message that comes back
       from the server goes straight into the Store. */
    public async sendMessage(roomId: number, otherUserId: number, content: string): Promise<void> {
        const currentUser = userStore.getState().user;
        if (!currentUser) {
            throw new Error("אין משתמש מחובר");
        }

        const tempId = this.nextTempId--;
        const pending = new Message(tempId, content, roomId, currentUser.id, false, true, undefined, "pending");
        messageStore.dispatch({type: MessageActionType.AddMessage, payload: {roomId, message: pending}});

        await this.deliver(roomId, otherUserId, tempId, content, currentUser.id);
    }

    /* Retry send (.msg__retry) — the same id stays, so the bubble in place
       goes failed → pending → confirmed without moving in the list. */
    public async retryMessage(roomId: number, otherUserId: number, message: Message): Promise<void> {
        const currentUser = userStore.getState().user;
        if (!currentUser) {
            throw new Error("אין משתמש מחובר");
        }

        const pending = new Message(message.id, message.content, roomId, currentUser.id, false, true, undefined, "pending");
        messageStore.dispatch({
            type: MessageActionType.ReplaceMessage,
            payload: {roomId, messageId: message.id, message: pending},
        });

        await this.deliver(roomId, otherUserId, message.id, message.content, currentUser.id);
    }

    private async deliver(roomId: number, otherUserId: number, messageId: number, content: string, currentUserId: number): Promise<void> {
        try {
            /* room_id is always sent — sending null creates a new room on every call
               (API SPEC §3.5). Every room already exists by the time we get here (step 18). */
            const response = await http.post<MessageDTO>(
                `message/user/${currentUserId}/other/${otherUserId}`,
                toMessageCreateDTO(content, roomId)
            );

            const message = toMessage(response.data, currentUserId);
            messageStore.dispatch({
                type: MessageActionType.ReplaceMessage,
                payload: {roomId, messageId, message},
            });

            /* TODO-3: this is the only way (together with Thread.tsx) a last message
               appears in the conversation list. See TASKS-FRONT.md §4 */
            roomStore.dispatch({
                type: RoomActionType.UpdateRoomPreview,
                payload: new RoomPreview(roomId, message.content, message.at),
            });

            /* A room jumps to the top of the list only once a message was actually
               sent from here — not on merely entering/viewing it (Thread.tsx never
               dispatches PromoteRoom). */
            roomStore.dispatch({type: RoomActionType.PromoteRoom, payload: roomId});
        } catch (err) {
            console.error("Error from sendMessage");
            const failed = new Message(messageId, content, roomId, currentUserId, false, true, undefined, "failed");
            messageStore.dispatch({
                type: MessageActionType.ReplaceMessage,
                payload: {roomId, messageId, message: failed},
            });
            throw err;
        }
    }

    /* Called from Thread.tsx whenever the room has an unread received message in view.
       Best-effort: a failure here shouldn't surface as a UI error, it just means the
       tick doesn't update this time — the next call (next message/re-render) retries it. */
    public async markRoomRead(roomId: number): Promise<void> {
        const currentUser = userStore.getState().user;
        if (!currentUser) return;
        try {
            await http.post(`message/room/${roomId}/user/${currentUser.id}/read`);
            messageStore.dispatch({type: MessageActionType.MarkRoomRead, payload: roomId});
        } catch {
            console.error("Error from markRoomRead");
        }
    }

    /* Called from roomService.deleteRoom — a deleted room shouldn't keep
       loaded messages in the Store. */
    public clearRoom(roomId: number): void {
        messageStore.dispatch({type: MessageActionType.ClearRoom, payload: roomId});
    }

    /* Section 21 of the spec — a full reset on logout. */
    public reset(): void {
        messageStore.dispatch({type: MessageActionType.Reset, payload: null});
    }
}

export const messageService = new MessageService();
