import {io, Socket} from "socket.io-client";
import {appConfig} from "../utils/app-config";
import {authStore} from "../state/auth-state";

class SocketService {

    private _socket: Socket = null!;

    public connect(callback?: (data: number) => void): void {
        let counter = 0;
        if (!this._socket) {
            this._socket = io(appConfig.serverAddress, {
                query: {
                    firstName: authStore.getState().user?.firstName,
                },
                auth: {
                    token: authStore.getState().token,
                }
            });
        }
        this._socket.on("randomNumber", (data) => {
            callback!(data);
        });
    }

    public get socket() {
        return this._socket;
    }

}

export const socketService = new SocketService();
