import {createStore} from "redux";
import {Room, RoomPreview} from "../models/room";

/* Redux קלאסי, בתבנית docs/front-example/src/state/course-state.ts. */

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
    Reset = "Reset",
}

// Step 3
export interface RoomAction {
    type: RoomActionType,
    payload: Room[] | Room | RoomPreview | number | null,
}

// Step 4
export function roomReducer(roomState: RoomState = new RoomState(), action: RoomAction): RoomState {

    /* מערך חדש בכל פעולה. בלעדיו React מקבל את אותה הפניה ולא מרנדר מחדש. */
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
                /* מופע חדש ולא spread — כדי שה-getter displayName יישאר */
                newState.roomList[indexToUpdate] = new Room(
                    room.id,
                    room.name,
                    room.unread,
                    room.otherUserId,
                    room.metaName,
                    preview.lastMessage,
                    preview.lastAt
                );
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
