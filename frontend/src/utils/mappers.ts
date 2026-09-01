import {NewUser, NewUserDTO, User, UserDTO} from "../models/user";
import {Room, RoomCreateDTO, RoomDTO} from "../models/room";
import {Message, MessageCreateDTO, MessageDTO} from "../models/message";

/* The boundary layer between the server and the app.
   It and the DTO classes in models/ are the only places that touch snake_case.
   Outside both of them, there's no first_name / room_id / is_read in the code. */

export function toUser(userDto: UserDTO): User {
    return new User(
        userDto.id,
        userDto.first_name,
        userDto.last_name,
        userDto.phone_number
    );
}

/* The server attaches the room participants (user_list) to every response — GET/POST/DELETE are
   all consistent. currentUserId is needed to identify who "the other" is: in a 1:1 room (2 participants)
   it's the participant who isn't me; in a group room (more than 2) it stays undefined,
   because there's no single "other" to pick — displayName then falls back to the server's name. */
export function toRoom(roomDto: RoomDTO, currentUserId: number): Room {
    const userList = roomDto.user_list.map(toUser);
    const otherList = userList.filter(user => user.id !== currentUserId);
    const other = otherList.length === 1 ? otherList[0] : undefined;

    return new Room(
        roomDto.id,
        roomDto.name,
        0,                      // TODO-5: unread is always 0
        userList,
        other
    );
}

/* currentUserId is needed to determine mine. at comes from the local messageTimes (TODO-4). */
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

/* Request body of POST /api/message/user/{user_id}/other/{other_user_id}. */
export function toMessageCreateDTO(content: string, roomId: number): MessageCreateDTO {
    return new MessageCreateDTO(content, roomId);
}

/* Request body of POST /api/room/. The logged-in user must be included in the list
   themselves — the server doesn't add them. See API SPEC §3.2. */
export function toRoomCreateDTO(name: string, userList: User[]): RoomCreateDTO {
    return new RoomCreateDTO(
        name,
        userList.map(toUserDTO)
    );
}

/* A 422 error returns the server's field name in loc. Here it's translated to the
   form's field name, so the correct field can be flagged. See API SPEC §4.1. */
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

/* Request body of POST /api/user/ — registration. */
export function toNewUserDTO(newUser: NewUser): NewUserDTO {
    return new NewUserDTO(
        newUser.firstName,
        newUser.lastName,
        newUser.phoneNumber
    );
}

/* The reverse direction — needed for user_list in POST /api/room/.
   Must return all four fields, otherwise the server returns 422. See API SPEC §3.2 */
export function toUserDTO(user: User): UserDTO {
    return new UserDTO(
        user.id,
        user.firstName,
        user.lastName,
        user.phoneNumber
    );
}
