import {http} from "../utils/http";
import {NewUser, User, UserDTO} from "../models/user";
import {toNewUserDTO, toUser} from "../utils/mappers";

/* TODO-1: אין endpoint להתחברות בשרת. ראה TASKS-FRONT.md §4
   מסך ההתחברות נבנה במלואו ויזואלית, ובשליחה מציג באנר שגיאה עם קישור להרשמה. */

class UserService {

    /* POST /api/user/ — שים לב ל-"/" בסוף.
       בלעדיו השרת מחזיר 307 Temporary Redirect וזו קריאה מיותרת. */
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
