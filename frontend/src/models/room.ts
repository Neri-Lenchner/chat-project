import {UserDTO} from "./user";

/* RoomDTO — הצורה הגולמית שהשרת מחזיר, לפי API SPEC §2.2.
   שני שדות בלבד: אין משתתפים, אין הודעה אחרונה, אין זמן ואין מונה לא-נקרא. */
export class RoomDTO {

    constructor(public id: number,
                public name: string) {
    }
}

/* גוף הבקשה של POST /api/room/ — לפי API SPEC §3.2.
   כל אובייקט ב-user_list חייב את ארבעת השדות, אחרת השרת מחזיר 422,
   והמשתמש המחובר אינו מתווסף אוטומטית — יש לכלול אותו ברשימה. */
export class RoomCreateDTO {

    constructor(public name: string,
                public user_list: UserDTO[]) {
    }
}

/* TODO-6: אין endpoint שמחזיר משתתפי חדר. המיפוי roomId → otherUserId
   נשמר מקומית ב-localStorage בעת יצירת החדר. ראה TASKS-FRONT.md §4 */
export class RoomMeta {

    constructor(public otherUserId: number,
                public name: string) {
    }
}

export class Room {

    constructor(public id: number,
                public name: string,
                // TODO-5: אין ספירת "לא נקרא" בשרת. תמיד 0. ראה TASKS-FRONT.md §4
                public unread: number = 0,
                // TODO-6: מגיע מ-roomMeta המקומי. ראה TASKS-FRONT.md §4
                public otherUserId?: number,
                // TODO-6: שם איש הקשר מה-roomMeta המקומי, גובר על name של השרת
                public metaName?: string,
                // TODO-3: אין ב-Room הודעה אחרונה מהשרת. מגיע מ-MessageStore
                public lastMessage?: string,
                // TODO-3 + TODO-4: אין זמן בשרת. מגיע מ-messageTimes המקומי
                public lastAt?: string) {
    }

    /* נספח א': meta ← name ← "שיחה #{id}".
       name יכול לחזור מהשרת כמחרוזת ריקה בחדר שנוצר משליחת הודעה. */
    public get displayName(): string {
        return this.metaName || this.name || `שיחה #${this.id}`;
    }
}

/* תצוגה מקדימה של חדר ברשימה: ההודעה האחרונה והזמן שלה.
   TODO-3 + TODO-4: שניהם לא מגיעים מהשרת ומורכבים מקומית. */
export class RoomPreview {

    constructor(public roomId: number,
                public lastMessage: string,
                public lastAt?: string) {
    }
}
