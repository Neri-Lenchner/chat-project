/* UserDTO — the raw shape returned by the server, snake_case, per API SPEC §2.1.
   It and its counterparts in room.ts / message.ts, together with utils/mappers.ts,
   are the only places in the code allowed to contain snake_case names. */
export class UserDTO {

    constructor(public id: number,
                public first_name: string,
                public last_name: string,
                public phone_number: string) {
    }
}

/* Request body of POST /api/user/ — three fields, no id.
   The server generates the id and returns it in UserDTO. */
export class NewUserDTO {

    constructor(public first_name: string,
                public last_name: string,
                public phone_number: string) {
    }
}

/* Response of POST /api/user/ — just the JWT (valid one month). It's not paired with a
   separate user object because the token payload already carries the full user record
   (see TokenPayloadDTO) — that's what utils/jwt.ts decodes it into on the client.
   The token is stored in localStorage (see utils/storage.ts); the app doesn't send it as
   an Authorization header anywhere yet. */
export class AuthResponseDTO {

    constructor(public token: string) {
    }
}

/* Decoded JWT payload, per auth/token_service.py on the server — snake_case, since this
   is server-shaped data like UserDTO. sub is the user id, kept as a string per JWT convention. */
export class TokenPayloadDTO {

    constructor(public sub: string,
                public first_name: string,
                public last_name: string,
                public phone_number: string,
                public iat: number,
                public exp: number) {
    }
}

/* The user plus token decoded from AuthResponseDTO — what userService.register()/login() return. */
export interface AuthResult {
    user: User;
    token: string;
}

/* Request body of POST /api/user/login — matches UserLoginDTO on the server. */
export class LoginDTO {

    constructor(public phone_number: string) {
    }
}

/* What the registration form collects. Used as the useForm type in step 11. */
export class NewUser {

    constructor(public firstName: string,
                public lastName: string,
                public phoneNumber: string) {
    }
}

/* What the login form collects. Used as the useForm type in step 12. */
export class Credentials {

    constructor(public phoneNumber: string) {
    }
}

export class User {

    constructor(public id: number,
                public firstName: string,
                public lastName: string,
                public phoneNumber: string) {
    }

    /* Appendix A: fullName is a computed getter, not a field */
    public get fullName(): string {
        return `${this.firstName} ${this.lastName}`.trim();
    }
}
