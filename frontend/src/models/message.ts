/* MessageDTO — the raw shape returned by the server, per API SPEC §2.3.
   date_time is nullable: a message sent before the column existed has none. It's also not
   timezone-marked — the server always writes/reads UTC wall-clock values (see message.py),
   just without a 'Z'/offset suffix, since MySQL's DATETIME has no tz of its own. toMessage
   (utils/mappers.ts) is where that gets normalized into a proper UTC ISO string. */
export class MessageDTO {

    constructor(public id: number,
                public content: string,
                public room_id: number,
                public user_id: number,
                public is_read: boolean,
                public date_time: string | null) {
    }
}

/* Request body of POST /api/message/user/{user_id}/other/{other_user_id}.
   room_id is typed here as number and not number|null on purpose: the rule in the project is
   "always send room_id" (API SPEC §3.5) — sending null creates a new room
   on every call, and in our case every room already exists before a message is sent to it (step 18). */
export class MessageCreateDTO {

    constructor(public content: string,
                public room_id: number) {
    }
}

export type MessageStatus = "pending" | "failed";

export class Message {

    constructor(public id: number,
                public content: string,
                public roomId: number,
                public userId: number,
                public isRead: boolean,
                /* Appendix A: userId === currentUser.id. Set during mapping and not in a getter,
                   so the model doesn't depend on userStore. */
                public mine: boolean,
                /* From the server's date_time (utils/mappers.ts#toMessage), normalized to a UTC
                   ISO string. undefined only for a message from before the column existed. */
                public at?: string,
                /* Local state only while sending. Doesn't come from the server and isn't sent to it. */
                public status?: MessageStatus) {
    }
}
