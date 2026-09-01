import {createStore} from "redux";
import {Message} from "../models/message";

/* Classic Redux, following the docs/front-example/src/state/course-state.ts pattern.
   Messages are organized by room, with a separate loading flag per room — a one-time load
   per room, not for the whole app (unlike the single isFetched flag in roomService). */

// Step 1
export class MessageState {

    messagesByRoom: Record<number, Message[]> = {};
    loadedRooms: Record<number, boolean> = {};
}

// Step 2
export enum MessageActionType {
    GetMessages = "GetMessages",
    AddMessage = "AddMessage",
    ReplaceMessage = "ReplaceMessage",
    ClearRoom = "ClearRoom",
    Reset = "Reset",
}

// Step 3
export interface MessageAction {
    type: MessageActionType,
    payload: { roomId: number; messages: Message[] }
        | { roomId: number; message: Message }
        | { roomId: number; messageId: number; message: Message }
        | number
        | null,
}

// Step 4
export function messageReducer(messageState: MessageState = new MessageState(), action: MessageAction): MessageState {

    /* A new object and a new array on every action. Without them, React gets the same
       reference and doesn't re-render. */
    const newState: MessageState = {...messageState};
    newState.messagesByRoom = {...newState.messagesByRoom};
    newState.loadedRooms = {...newState.loadedRooms};

    switch (action.type) {
        case MessageActionType.GetMessages: {
            const {roomId, messages} = action.payload as { roomId: number; messages: Message[] };
            newState.messagesByRoom[roomId] = messages;
            newState.loadedRooms[roomId] = true;
            break;
        }

        case MessageActionType.AddMessage: {
            const {roomId, message} = action.payload as { roomId: number; message: Message };
            const existing = newState.messagesByRoom[roomId] ?? [];
            newState.messagesByRoom[roomId] = [...existing, message];
            break;
        }

        case MessageActionType.ReplaceMessage: {
            /* Replaces an existing message (by id) with a new object — used to move a message
               between pending/failed/confirmed-by-server (section 21 of the spec). */
            const {roomId, messageId, message} = action.payload as { roomId: number; messageId: number; message: Message };
            const existing = newState.messagesByRoom[roomId] ?? [];
            newState.messagesByRoom[roomId] = existing.map(current => current.id === messageId ? message : current);
            break;
        }

        case MessageActionType.ClearRoom: {
            const roomId = action.payload as number;
            delete newState.messagesByRoom[roomId];
            delete newState.loadedRooms[roomId];
            break;
        }

        case MessageActionType.Reset:
            newState.messagesByRoom = {};
            newState.loadedRooms = {};
            break;
    }

    return newState;
}

// Step 5
export const messageStore = createStore(messageReducer);
