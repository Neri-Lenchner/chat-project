import {User} from "../models/user";
import {RoomMeta} from "../models/room";

/* עטיפה מוקלדת ל-localStorage.
   כל קריאה עוברת try/catch — JSON פגום או localStorage חסום (מצב פרטי,
   מכסת אחסון) לא יפילו את האפליקציה אלא יחזירו ערך ריק.

   שים לב: JSON.parse מחזיר אובייקט פשוט, לא מופע של מחלקה. לכן כל קריאה
   שמחזירה מודל **משחזרת מופע** עם new — אחרת ה-getters (fullName, displayName)
   יהיו undefined. ראה ARCHITECTURE-DECISIONS.md §AD-6. */

function readJson(key: string): unknown {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? null : JSON.parse(raw);
    } catch {
        return null;
    }
}

function writeJson(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* מכסת אחסון מלאה או localStorage חסום — ממשיכים בלי לשמור */
    }
}

function removeKey(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch {
        /* אין מה לעשות */
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/* ---------- 1. המשתמש המחובר (סעיף 4 באפיון) ---------- */

class SessionStorage {

    private readonly key = "user";

    public get(): User | null {
        const raw = readJson(this.key);
        if (!isRecord(raw)) return null;
        if (typeof raw.id !== "number") return null;
        return new User(
            raw.id,
            String(raw.firstName ?? ""),
            String(raw.lastName ?? ""),
            String(raw.phoneNumber ?? "")
        );
    }

    public set(user: User): void {
        writeJson(this.key, user);
    }

    public clear(): void {
        removeKey(this.key);
    }
}

/* ---------- 2. חדרים מוסתרים ---------- */
/* TODO-2: אין DELETE /api/room/{id} בשרת. "מחיקת שיחה" היא הסתרה מקומית בלבד.
   ראה TASKS-FRONT.md §4 */

class HiddenRoomsStorage {

    private readonly key = "hiddenRooms";

    public getAll(): number[] {
        const raw = readJson(this.key);
        if (!Array.isArray(raw)) return [];
        return raw.filter((item): item is number => typeof item === "number");
    }

    public has(roomId: number): boolean {
        return this.getAll().includes(roomId);
    }

    public add(roomId: number): void {
        const list = this.getAll();
        if (list.includes(roomId)) return;
        list.push(roomId);
        writeJson(this.key, list);
    }

    public remove(roomId: number): void {
        writeJson(this.key, this.getAll().filter(item => item !== roomId));
    }

    public clear(): void {
        removeKey(this.key);
    }
}

/* ---------- 3. מיפוי חדר → איש הקשר שבו ---------- */
/* TODO-6: אין endpoint שמחזיר משתתפי חדר, ו-other_user_id נדרש לשליחת הודעה.
   בעת יצירת חדר הפרונט יודע את שניהם ושומר אותם כאן. ראה TASKS-FRONT.md §4 */

class RoomMetaStorage {

    private readonly key = "roomMeta";

    public getAll(): Record<number, RoomMeta> {
        const raw = readJson(this.key);
        const result: Record<number, RoomMeta> = {};
        if (!isRecord(raw)) return result;
        for (const [roomId, value] of Object.entries(raw)) {
            if (!isRecord(value)) continue;
            if (typeof value.otherUserId !== "number") continue;
            result[Number(roomId)] = new RoomMeta(value.otherUserId, String(value.name ?? ""));
        }
        return result;
    }

    public get(roomId: number): RoomMeta | undefined {
        return this.getAll()[roomId];
    }

    public set(roomId: number, meta: RoomMeta): void {
        const all = this.getAll();
        all[roomId] = meta;
        writeJson(this.key, all);
    }

    public remove(roomId: number): void {
        const all = this.getAll();
        delete all[roomId];
        writeJson(this.key, all);
    }

    public clear(): void {
        removeKey(this.key);
    }
}

/* ---------- 4. זמני הודעות ---------- */
/* TODO-4: אין date_time ב-Message בשרת. הזמן נשמר כאן להודעות שנשלחו
   מהדפדפן הזה. להודעה בלי רשומה מוצג "··". ראה TASKS-FRONT.md §4 */

class MessageTimesStorage {

    private readonly key = "messageTimes";

    public getAll(): Record<number, string> {
        const raw = readJson(this.key);
        const result: Record<number, string> = {};
        if (!isRecord(raw)) return result;
        for (const [messageId, value] of Object.entries(raw)) {
            if (typeof value !== "string") continue;
            result[Number(messageId)] = value;
        }
        return result;
    }

    public get(messageId: number): string | undefined {
        return this.getAll()[messageId];
    }

    public set(messageId: number, iso: string): void {
        const all = this.getAll();
        all[messageId] = iso;
        writeJson(this.key, all);
    }

    public clear(): void {
        removeKey(this.key);
    }
}

export const session = new SessionStorage();
export const hiddenRooms = new HiddenRoomsStorage();
export const roomMeta = new RoomMetaStorage();
export const messageTimes = new MessageTimesStorage();
