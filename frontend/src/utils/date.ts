/* An exact port of section 2 in docs/DESIGN/ui.js — the same behavior word for word.
   Any change here changes what the user sees in the time column and the conversation list. */

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

/* Today → time only. Otherwise → date. (section 7.2 of the spec) */
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
