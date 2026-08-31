import {NewUser, NewUserDTO, User, UserDTO} from "../models/user";
import {Room, RoomCreateDTO, RoomDTO, RoomMeta} from "../models/room";
import {Message, MessageDTO} from "../models/message";

/* שכבת הגבול בין השרת לאפליקציה.
   הוא ומחלקות ה-DTO ב-models/ הם המקומות היחידים שנוגעים ב-snake_case.
   מחוץ לשניהם אין first_name / room_id / is_read בקוד. */

export function toUser(userDto: UserDTO): User {
    return new User(
        userDto.id,
        userDto.first_name,
        userDto.last_name,
        userDto.phone_number
    );
}

/* meta מגיע מ-roomMeta המקומי (TODO-6) ונשאר undefined עד שלב 14. */
export function toRoom(roomDto: RoomDTO, meta?: RoomMeta): Room {
    return new Room(
        roomDto.id,
        roomDto.name,
        0,                      // TODO-5: unread תמיד 0
        meta?.otherUserId,
        meta?.name
    );
}

/* currentUserId נדרש כדי לקבוע mine. at מגיע מ-messageTimes המקומי (TODO-4). */
export function toMessage(messageDto: MessageDTO, currentUserId: number, at?: string): Message {
    return new Message(
        messageDto.id,
        messageDto.content,
        messageDto.room_id,
        messageDto.user_id,
        messageDto.is_read,
        messageDto.user_id === currentUserId,
        at
    );
}

/* גוף הבקשה של POST /api/room/. המשתמש המחובר חייב להיכלל ברשימה
   בעצמו — השרת לא מוסיף אותו. ראה API SPEC §3.2. */
export function toRoomCreateDTO(name: string, userList: User[]): RoomCreateDTO {
    return new RoomCreateDTO(
        name,
        userList.map(toUserDTO)
    );
}

/* שגיאת 422 מחזירה את שם השדה של השרת ב-loc. כאן הוא מתורגם לשם
   השדה בטופס, כדי שאפשר יהיה לסמן את השדה הנכון. ראה API SPEC §4.1. */
export function toNewUserField(serverField: string): keyof NewUser | null {
    switch (serverField) {
        case "first_name":
            return "firstName";
        case "last_name":
            return "lastName";
        case "phone_number":
            return "phoneNumber";
        default:
            return null;
    }
}

/* גוף הבקשה של POST /api/user/ — הרשמה. */
export function toNewUserDTO(newUser: NewUser): NewUserDTO {
    return new NewUserDTO(
        newUser.firstName,
        newUser.lastName,
        newUser.phoneNumber
    );
}

/* הכיוון ההפוך — נדרש ל-user_list ב-POST /api/room/.
   חייב להחזיר את ארבעת השדות, אחרת השרת מחזיר 422. ראה API SPEC §3.2 */
export function toUserDTO(user: User): UserDTO {
    return new UserDTO(
        user.id,
        user.firstName,
        user.lastName,
        user.phoneNumber
    );
}
