import {createStore} from "redux";

/* Classic Redux, following the message-state.ts / room-state.ts pattern.
   typingUntilByRoom holds an expiry timestamp (Date.now() + TTL), not a plain boolean — a
   dropped "stopped typing" event (closed tab, lost connection) would otherwise leave the
   indicator stuck forever. Readers (ChatHead.tsx) compare the stored value to Date.now(). */

// Step 1
export class TypingState {

    typingUntilByRoom: Record<number, number> = {};
}

// Step 2
export enum TypingActionType {
    SetTyping = "SetTyping",
    ClearTyping = "ClearTyping",
    Reset = "Reset",
}

// Step 3
export interface TypingAction {
    type: TypingActionType,
    payload: { roomId: number; until: number } | number | null,
}

// Step 4
export function typingReducer(typingState: TypingState = new TypingState(), action: TypingAction): TypingState {

    const newState: TypingState = {...typingState};
    newState.typingUntilByRoom = {...newState.typingUntilByRoom};

    switch (action.type) {
        case TypingActionType.SetTyping: {
            const {roomId, until} = action.payload as { roomId: number; until: number };
            newState.typingUntilByRoom[roomId] = until;
            break;
        }

        case TypingActionType.ClearTyping: {
            const roomId = action.payload as number;
            delete newState.typingUntilByRoom[roomId];
            break;
        }

        case TypingActionType.Reset:
            newState.typingUntilByRoom = {};
            break;
    }

    return newState;
}

// Step 5
export const typingStore = createStore(typingReducer);
