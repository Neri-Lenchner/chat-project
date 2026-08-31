
import {createStore} from "redux";
import {User} from "../models/user";

export class UserState {
    userList: User[] = [];
}

// Step 2
export enum UserActionType {
    GetUserList = "GetUserList",
    AddUser = "AddUser",
}

// Step 3
export interface UserAction {
    type: UserActionType,
    payload: any,
}


// Step 4
export function userReducer(userState: UserState = new UserState(), action: UserAction): UserState {

    const newState: UserState = {...userState};

    newState.userList = [...newState.userList];

    switch (action.type) {
        case UserActionType.GetUserList:
            newState.userList = action.payload;
            break;
        case UserActionType.AddUser:
            newState.userList.push(action.payload);
            break;
    }

    return newState;
}

// Step 5
export const userStore = createStore(userReducer);
