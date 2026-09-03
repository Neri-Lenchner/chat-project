/* Decodes a JWT payload client-side (no signature verification — the token was just issued
   by our own server, this only reads back the claims it already carries). No jwt-decode
   dependency: the payload is a base64url JSON string, and decoding it correctly as UTF-8
   (Hebrew names) needs the escape/decodeURIComponent trick below, since atob() alone only
   handles Latin1. */

function base64UrlDecode(segment: string): string {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
    const binary = atob(padded);
    const percentEncoded = Array.from(binary, char => "%" + char.charCodeAt(0).toString(16).padStart(2, "0")).join("");
    return decodeURIComponent(percentEncoded);
}

export function decodeJwtPayload<T>(token: string): T {
    const payload = token.split(".")[1];
    if (!payload) throw new Error("invalid token: missing payload segment");
    return JSON.parse(base64UrlDecode(payload)) as T;
}
