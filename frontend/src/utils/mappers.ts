import {
    AuthResponseDTO,
    AuthResult,
    Credentials,
    LoginDTO,
    NewUser,
    NewUserDTO,
    TokenPayloadDTO,
    User,
    UserDTO,
} from "../models/user";
import {Room, RoomCreateDTO, RoomDTO} from "../models/room";
import {Message, MessageCreateDTO, MessageDTO} from "../models/message";
import {decodeJwtPayload} from "./jwt";

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

/* Response of POST /api/user/ — the user is decoded from the token's own payload
   (see auth/token_service.py) rather than sent again alongside it. */
export function toAuthResult(authResponseDto: AuthResponseDTO): AuthResult {
    const payload = decodeJwtPayload<TokenPayloadDTO>(authResponseDto.token);
    const userDto = new UserDTO(Number(payload.sub), payload.first_name, payload.last_name, payload.phone_number);
    return {
        user: toUser(userDto),
        token: authResponseDto.token,
    };
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

/* The server's date_time has no timezone marker (MySQL's DATETIME has none of its own), but is
   always the UTC wall-clock value (see message.py) — marked explicitly here so `new Date(...)`
   parses it as UTC instead of local time. */
function toUtcIso(dateTime: string): string {
    return /[Zz]|[+-]\d\d:\d\d$/.test(dateTime) ? dateTime : dateTime + "Z";
}

/* currentUserId is needed to determine mine. at is undefined only for a message from before
   date_time existed on the server. */
export function toMessage(messageDto: MessageDTO, currentUserId: number): Message {
    return new Message(
        messageDto.id,
        messageDto.content,
        messageDto.room_id,
        messageDto.user_id,
        messageDto.is_read,
        messageDto.user_id === currentUserId,
        messageDto.date_time ? toUtcIso(messageDto.date_time) : undefined
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

/* Request body of POST /api/user/login. */
export function toLoginDTO(credentials: Credentials): LoginDTO {
    return new LoginDTO(credentials.phoneNumber);
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
