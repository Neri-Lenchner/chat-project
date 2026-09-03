import {User} from "../models/user";

/* A typed wrapper around localStorage.
   Every call goes through try/catch — corrupt JSON or a blocked localStorage (private mode,
   storage quota) won't crash the app but will return an empty value instead.

   Note: JSON.parse returns a plain object, not a class instance. So every read
   that returns a model **reconstructs an instance** with new — otherwise the getters (fullName, displayName)
   would be undefined. See ARCHITECTURE-DECISIONS.md §AD-6. */

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
        /* Storage quota full or localStorage blocked — continue without saving */
    }
}

function removeKey(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch {
        /* Nothing to do */
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/* ---------- 1. The logged-in user (section 4 of the spec) ---------- */

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

/* ---------- 2. The JWT issued alongside registration (models/user.ts — AuthResponseDTO) ---------- */

class TokenStorage {

    private readonly key = "token";

    public get(): string | null {
        try {
            return localStorage.getItem(this.key);
        } catch {
            return null;
        }
    }

    public set(token: string): void {
        try {
            localStorage.setItem(this.key, token);
        } catch {
            /* Storage quota full or localStorage blocked — continue without saving */
        }
    }

    public clear(): void {
        removeKey(this.key);
    }
}

export const session = new SessionStorage();
export const authToken = new TokenStorage();
