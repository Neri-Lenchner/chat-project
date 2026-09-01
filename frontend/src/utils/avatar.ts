/* An exact port of section 3 in docs/DESIGN/ui.js. */

/* The first two words of the name, first letter of each. */
export function initials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("");
}

/* The tone is derived from the id so the same contact always gets the same color. */
export function avatarTone(id: number | string | undefined): string {
    return `avatar--${(Math.abs(Number(id) || 0) % 5) + 1}`;
}
