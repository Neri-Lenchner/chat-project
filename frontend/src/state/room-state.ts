import {createStore} from "redux";
import {Room, RoomPreview} from "../models/room";

/* Classic Redux, following the docs/front-example/src/state/course-state.ts pattern. */

// Step 1
export class RoomState {

    roomList: Room[] = [];
}

// Step 2
export enum RoomActionType {
    GetRoomList = "GetRoomList",
    AddRoom = "AddRoom",
    RemoveRoom = "RemoveRoom",
    UpdateRoomPreview = "UpdateRoomPreview",
    PromoteRoom = "PromoteRoom",
    Reset = "Reset",
}

// Step 3
export interface RoomAction {
    type: RoomActionType,
    payload: Room[] | Room | RoomPreview | number | null,
}

// Step 4
export function roomReducer(roomState: RoomState = new RoomState(), action: RoomAction): RoomState {

    /* A new array on every action. Without it, React gets the same reference and doesn't re-render. */
    const newState: RoomState = {...roomState};
    newState.roomList = [...newState.roomList];

    switch (action.type) {
        case RoomActionType.GetRoomList:
            newState.roomList = action.payload as Room[];
            break;

        case RoomActionType.AddRoom:
            newState.roomList.push(action.payload as Room);
            break;

        case RoomActionType.RemoveRoom: {
            const roomId = action.payload as number;
            newState.roomList = newState.roomList.filter(room => room.id !== roomId);
            break;
        }

        case RoomActionType.UpdateRoomPreview: {
            const preview = action.payload as RoomPreview;
            const indexToUpdate = newState.roomList.findIndex(room => room.id === preview.roomId);
            if (indexToUpdate !== -1) {
                const room = newState.roomList[indexToUpdate];
                /* New instance, not spread — so the displayName getter survives */
                newState.roomList[indexToUpdate] = new Room(
                    room.id,
                    room.name,
                    room.unread,
                    room.userList,
                    room.other,
                    preview.lastMessage,
                    preview.lastAt
                );
            }
            break;
        }

        case RoomActionType.PromoteRoom: {
            /* Moves a room to the top of the list — only on an actual send
               (message-service.ts), not on merely entering/viewing a room. */
            const roomId = action.payload as number;
            const indexToPromote = newState.roomList.findIndex(room => room.id === roomId);
            if (indexToPromote > 0) {
                const [room] = newState.roomList.splice(indexToPromote, 1);
                newState.roomList.unshift(room);
            }
            break;
        }

        case RoomActionType.Reset:
            newState.roomList = [];
            break;
    }

    return newState;
}

// Step 5
export const roomStore = createStore(roomReducer);
