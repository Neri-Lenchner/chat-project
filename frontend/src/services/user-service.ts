import {AxiosError} from "axios";
import {http} from "../utils/http";
import {AuthResponseDTO, AuthResult, Credentials, NewUser, User, UserDTO} from "../models/user";
import {toAuthResult, toLoginDTO, toNewUserDTO, toUser} from "../utils/mappers";

class UserService {

    /* POST /api/user/ — note the "/" at the end.
       Without it, the server returns a 307 Temporary Redirect, which is a wasted call.
       The response is just a JWT; toAuthResult decodes the user out of its payload. */
    public async register(newUser: NewUser): Promise<AuthResult> {
        try {
            const response = await http.post<AuthResponseDTO>("user/", toNewUserDTO(newUser));
            return toAuthResult(response.data);
        } catch (err) {
            console.error("Error from register");
            throw err;
        }
    }

    /* POST /api/user/login — 404 if no user is registered with that phone number. */
    public async login(credentials: Credentials): Promise<AuthResult> {
        try {
            const response = await http.post<AuthResponseDTO>("user/login", toLoginDTO(credentials));
            return toAuthResult(response.data);
        } catch (err) {
            console.error("Error from login");
            throw err;
        }
    }

    /* GET /api/user/phone/{phone_number} — used by the "new chat" search (NewChatDialog.tsx)
       to find a user to start a room with. null on 404 (no account with that number); anything
       else is rethrown, same as every other method here. */
    public async findByPhone(phoneNumber: string): Promise<User | null> {
        try {
            const response = await http.get<UserDTO>("user/phone/" + phoneNumber);
            return toUser(response.data);
        } catch (err) {
            if ((err as AxiosError).response?.status === 404) {
                return null;
            }
            console.error("Error from findByPhone");
            throw err;
        }
    }
}

export const userService = new UserService();
