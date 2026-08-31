import axios, {AxiosError} from "axios";
import {appConfig} from "../utils/app-config";
import {User} from "../models/user";
import {AuthActionType, authStore} from "../state/auth-state";
import {Credentials} from "../models/credentials";

class AuthService {

    public async register(user: User): Promise<void> {
        try {
            user.roleId = +user.roleId;
            await axios.post(appConfig.apiAddress + "register", user);
        } catch (err) {
            const myErr = err as AxiosError;
            const data = myErr.response?.data as {error: string};
            console.log(myErr);
            throw err;
        }
    }

    public async login(credentials: Credentials): Promise<void>  {
        try {
            const response = await axios.post(appConfig.apiAddress + "login", credentials);
            authStore.dispatch({type: AuthActionType.Login, payload: response.data.token});
        } catch (err) {
            const myErr = err as AxiosError;
            const data = myErr.response?.data as {error: string};
            console.log(myErr);
            throw err;
        }
    }

}

export const authService = new AuthService();
