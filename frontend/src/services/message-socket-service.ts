import {socketService} from "./socket-service";
import {roomService} from "./room-service";
import {MessageDTO} from "../models/message";
import {RoomPreview} from "../models/room";
import {toMessage} from "../utils/mappers";
import {MessageActionType, messageStore} from "../state/message-state";
import {RoomActionType, roomStore} from "../state/room-state";
import {userStore} from "../state/user-state";

/* Following the docs/front-example *-socket-service.ts split — one domain-specific listener
   per real-time concern, on top of the shared socketService.

   Payload shape and the "message" type come from backend/modules/message/message_service.py
   #_broadcast_new_message: {"type": "message", "message": MessageDTO}. The server already
   excludes the sender from the broadcast (it pushes to every other room member only), so
   there's no need to filter out this client's own messages here. */

class MessageSocketService {

    private listening: boolean = false;

    public listenForNewMessages(): void {
        if (this.listening) return;
        this.listening = true;

        socketService.on(async payload => {
            if (payload.type !== "message") return;

            const currentUser = userStore.getState().user;
            if (!currentUser) return;

            const dto = payload.message as MessageDTO;

            /* The very first message in a room this client has never seen (the other side just
               started the conversation) — UpdateRoomPreview/PromoteRoom below are silent no-ops
               for a room id that isn't in roomStore yet, so the room needs to be fetched in
               first, the same way it would show up after a manual refresh. */
            const roomExists = roomStore.getState().roomList.some(room => room.id === dto.room_id);
            if (!roomExists) {
                try {
                    await roomService.getRoomList(true);
                } catch {
                    return;
                }
            }

            const message = toMessage(dto, currentUser.id);
            messageStore.dispatch({
                type: MessageActionType.AddMessage,
                payload: {roomId: dto.room_id, message},
            });

            /* Same two dispatches as a locally-sent message (message-service.ts#deliver) —
               the preview and MRU order need to update for an incoming message too. */
            roomStore.dispatch({
                type: RoomActionType.UpdateRoomPreview,
                payload: new RoomPreview(dto.room_id, message.content, message.at),
            });
            roomStore.dispatch({type: RoomActionType.PromoteRoom, payload: dto.room_id});
        });
    }
}

export const messageSocketService = new MessageSocketService();
