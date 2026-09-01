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

/* What the registration form collects. Used as the useForm type in step 11. */
export class NewUser {

    constructor(public firstName: string,
                public lastName: string,
                public phoneNumber: string) {
    }
}

/* What the login form collects. Used as the useForm type in step 12.
   TODO-1: there is no login endpoint on the server, so there is no matching DTO.
   See TASKS-FRONT.md §4 */
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
