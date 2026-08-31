import {createStore} from "redux";
import {User} from "../models/user";
import {session} from "../utils/storage";
import {roomService} from "../services/room-service";

/* Redux קלאסי, בתבנית docs/front-example/src/state/auth-state.ts.
   אין Redux Toolkit ואין react-redux — רכיבים מתחברים ב-store.subscribe(). */

// Step 1
export class UserState {

    user: User | null = null;

    /* סעיף 4 באפיון: משתמש שנשמר ב-localStorage נטען אוטומטית
       בפתיחת האפליקציה, כך שרענון דף לא מנתק. */
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
            /* סעיף 21 באפיון — איפוס מלא. אחרת המשתמש הבא יראה
               את השיחות של הקודם, ו-isFetched ימנע טעינה מחדש. */
            roomService.reset();
            /* TODO: להשלים בשלב 19 — איפוס messageStore ו-messageService. */
            break;
    }

    return newState;
}

// Step 5
export const userStore = createStore(userReducer);
