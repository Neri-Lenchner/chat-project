import {User, UserDTO} from "./user";

/* RoomDTO — the raw shape returned by the server. Includes user_list — the full
   room participants, which the server now attaches to every room (GET/POST/DELETE are
   all consistent). This fully closes TODO-6: a local roomMeta is no longer needed. */
export class RoomDTO {

    constructor(public id: number,
                public name: string,
                public user_list: UserDTO[]) {
    }
}

/* Request body of POST /api/room/ — per API SPEC §3.2.
   Every object in user_list must have all four fields, otherwise the server returns 422,
   and the logged-in user is not added automatically — they must be included in the list. */
export class RoomCreateDTO {

    constructor(public name: string,
                public user_list: UserDTO[]) {
    }
}

export class Room {

    constructor(public id: number,
                public name: string,
                // TODO-5: there is no "unread" count on the server. Always 0. See TASKS-FRONT.md §4
                public unread: number = 0,
                /* All room participants, straight from the server — including the logged-in user themselves. */
                public userList: User[] = [],
                /* The participant who isn't me, derived during mapping by currentUserId. undefined
                   in a group room (more than 2 participants) — there is no single "other" to pick. */
                public other?: User,
                // TODO-3: Room has no last message from the server. It comes from MessageStore
                public lastMessage?: string,
                // TODO-3: Room itself has no lastAt on the server — it comes from the loaded
                // message's own at (models/message.ts), which is server-provided.
                public lastAt?: string) {
    }

    /* other.fullName ← name ← "Conversation #{id}". other is only set for a 1:1 room (exactly
       two participants — see toRoom in utils/mappers.ts), so this always shows "who I'm talking
       to" from each viewer's own side there, regardless of what name (if any) got stored on the
       room itself. name is shared across every participant, so it's used only when there's no
       single other — i.e. an actual group room, or the fallback while user_list hasn't loaded. */
    public get displayName(): string {
        return this.other?.fullName || this.name || `שיחה #${this.id}`;
    }
}

/* Preview of a room in the list: the last message and its time.
   TODO-3: there's no single call that returns this — it's composed locally from whichever
   message-fetching path last touched the room (send, socket push, or opening the thread). */
export class RoomPreview {

    constructor(public roomId: number,
                public lastMessage: string,
                public lastAt?: string) {
    }
}
