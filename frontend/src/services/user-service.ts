import {http} from "../utils/http";
import {NewUser, User, UserDTO} from "../models/user";
import {toNewUserDTO, toUser} from "../utils/mappers";

/* TODO-1: there is no login endpoint on the server. See TASKS-FRONT.md §4
   The login screen is fully built visually, and on submit shows an error banner with a link to register. */

class UserService {

    /* POST /api/user/ — note the "/" at the end.
       Without it, the server returns a 307 Temporary Redirect, which is a wasted call. */
    public async register(newUser: NewUser): Promise<User> {
        try {
            const response = await http.post<UserDTO>("user/", toNewUserDTO(newUser));
            return toUser(response.data);
        } catch (err) {
            console.error("Error from register");
            throw err;
        }
    }
}

export const userService = new UserService();
