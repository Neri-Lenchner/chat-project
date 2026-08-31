/* המרה מדויקת של סעיף 2 ב-docs/DESIGN/ui.js — אותה התנהגות מילה במילה.
   כל שינוי כאן משנה את מה שהמשתמש רואה בעמודת השעות וברשימת השיחות. */

function pad(value: number): string {
    return String(value).padStart(2, "0");
}

export function formatTime(iso: string): string {
    const date = new Date(iso);
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDate(iso: string): string {
    const date = new Date(iso);
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

/* היום → שעה בלבד. אחרת → תאריך. (סעיף 7.2 באפיון) */
export function formatRoomStamp(iso: string): string {
    const date = new Date(iso);
    return isSameDay(date, new Date()) ? formatTime(iso) : formatDate(iso);
}

export function formatDayLabel(iso: string): string {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (isSameDay(date, today)) return "היום";
    if (isSameDay(date, yesterday)) return "אתמול";
    return formatDate(iso);
}
