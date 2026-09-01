import {createStore} from "redux";
import {User} from "../models/user";
import {session} from "../utils/storage";
import {roomService} from "../services/room-service";
import {messageService} from "../services/message-service";

/* Classic Redux, following the docs/front-example/src/state/auth-state.ts pattern.
   No Redux Toolkit and no react-redux — components connect via store.subscribe(). */

// Step 1
export class UserState {

    user: User | null = null;

    /* Section 4 of the spec: a user saved in localStorage is loaded automatically
       when the app opens, so a page refresh doesn't log them out. */
    constructor() {
        this.user = session.get();
    }
}

// Step 2
export enum UserActionType {
    Register = "Register",
    Login = "Login",
    Logout = "Logout",
}

// Step 3
export interface UserAction {
    type: UserActionType,
    payload: User | null,
}

// Step 4
export function userReducer(userState: UserState = new UserState(), action: UserAction): UserState {

    const newState: UserState = {...userState};

    switch (action.type) {
        case UserActionType.Register:
        case UserActionType.Login:
            newState.user = action.payload;
            if (action.payload) {
                session.set(action.payload);
            }
            break;
        case UserActionType.Logout:
            session.clear();
            newState.user = null;
            /* Section 21 of the spec — a full reset. Otherwise the next user would see
               the previous user's conversations, and isFetched/loadedRooms would prevent reloading. */
            roomService.reset();
            messageService.reset();
            break;
    }

    return newState;
}

// Step 5
export const userStore = createStore(userReducer);
