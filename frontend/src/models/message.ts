/* MessageDTO — הצורה הגולמית שהשרת מחזיר, לפי API SPEC §2.3.
   שים לב: אין שדה date_time. הוא מוער בקוד השרת (message.py). */
export class MessageDTO {

    constructor(public id: number,
                public content: string,
                public room_id: number,
                public user_id: number,
                public is_read: boolean) {
    }
}

export type MessageStatus = "pending" | "failed";

export class Message {

    constructor(public id: number,
                public content: string,
                public roomId: number,
                public userId: number,
                public isRead: boolean,
                /* נספח א': userId === currentUser.id. נקבע במיפוי ולא ב-getter,
                   כדי שהמודל לא יהיה תלוי ב-userStore. */
                public mine: boolean,
                // TODO-4: אין date_time בשרת. הזמן נשמר מקומית. ראה TASKS-FRONT.md §4
                public at?: string,
                /* מצב מקומי בזמן שליחה בלבד. לא מגיע מהשרת ולא נשלח אליו. */
                public status?: MessageStatus) {
    }
}
