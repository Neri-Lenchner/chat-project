/* המרה מדויקת של סעיף 3 ב-docs/DESIGN/ui.js. */

/* שתי המילים הראשונות בשם, אות ראשונה מכל אחת. */
export function initials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("");
}

/* הגוון נגזר מהמזהה כדי שאותו איש קשר יקבל תמיד את אותו צבע. */
export function avatarTone(id: number | string | undefined): string {
    return `avatar--${(Math.abs(Number(id) || 0) % 5) + 1}`;
}
