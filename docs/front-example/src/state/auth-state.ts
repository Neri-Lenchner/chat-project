import {User} from "../models/user";
import {jwtDecode} from "jwt-decode";
import {createStore} from "redux";
import {UserWrapper} from "../models/user-wrapper";
import {courseService} from "../services/course-service";

export class AuthState {
    user: User | null = null;
    token: string | null = null;

    constructor() {
        const tokenFromLocalStorage = localStorage.getItem("token");
        if (tokenFromLocalStorage) {
            this.token = tokenFromLocalStorage;
            const userWrapper: UserWrapper = jwtDecode(tokenFromLocalStorage);
            this.user = userWrapper.user;
        }
    }

}

export enum AuthActionType {
    Register = "Register",
    Login = "Login",
    Logout = "Logout",
}

export interface AuthAction {
    type: AuthActionType,
    payload: any;
}

export function authReducer(authState: AuthState = new AuthState(), action: AuthAction): AuthState {

    const newState = {...authState}

    switch (action.type) {
        case AuthActionType.Login:
            const token = action.payload;
            newState.token = token;
            const userWrapper: UserWrapper = jwtDecode(token);
            newState.user = userWrapper.user;
            localStorage.setItem("token", token);
            break;
        case AuthActionType.Logout:
            localStorage.removeItem("token");
            newState.token = null;
            newState.user = null;
            courseService.isFetched = false;
            break;
    }

    return newState;
}

export const authStore = createStore(authReducer);
