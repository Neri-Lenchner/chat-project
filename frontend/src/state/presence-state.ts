import {createStore} from "redux";

/* Classic Redux, following the message-state.ts / room-state.ts pattern.
   Tracks which of the current user's contacts are currently online — populated from
   presence-socket-service.ts (presence_snapshot on connect, presence on every change). */

// Step 1
export class PresenceState {

    onlineUserIds: Record<number, boolean> = {};
}

// Step 2
export enum PresenceActionType {
    SetSnapshot = "SetSnapshot",
    SetOnline = "SetOnline",
    SetOffline = "SetOffline",
    Reset = "Reset",
}

// Step 3
export interface PresenceAction {
    type: PresenceActionType,
    payload: number[] | number | null,
}

// Step 4
export function presenceReducer(presenceState: PresenceState = new PresenceState(), action: PresenceAction): PresenceState {

    const newState: PresenceState = {...presenceState};
    newState.onlineUserIds = {...newState.onlineUserIds};

    switch (action.type) {
        case PresenceActionType.SetSnapshot: {
            const userIds = action.payload as number[];
            newState.onlineUserIds = {};
            userIds.forEach(userId => {
                newState.onlineUserIds[userId] = true;
            });
            break;
        }

        case PresenceActionType.SetOnline:
            newState.onlineUserIds[action.payload as number] = true;
            break;

        case PresenceActionType.SetOffline:
            delete newState.onlineUserIds[action.payload as number];
            break;

        case PresenceActionType.Reset:
            newState.onlineUserIds = {};
            break;
    }

    return newState;
}

// Step 5
export const presenceStore = createStore(presenceReducer);
