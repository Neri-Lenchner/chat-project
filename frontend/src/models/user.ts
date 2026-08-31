/* UserDTO — הצורה הגולמית שהשרת מחזיר, snake_case, לפי API SPEC §2.1.
   הוא ומקבילותיו ב-room.ts / message.ts, יחד עם utils/mappers.ts,
   הם המקומות היחידים בקוד שמותר להם להכיל שמות snake_case. */
export class UserDTO {

    constructor(public id: number,
                public first_name: string,
                public last_name: string,
                public phone_number: string) {
    }
}

/* גוף הבקשה של POST /api/user/ — שלושה שדות, בלי id.
   השרת מייצר את ה-id ומחזיר אותו ב-UserDTO. */
export class NewUserDTO {

    constructor(public first_name: string,
                public last_name: string,
                public phone_number: string) {
    }
}

/* מה שטופס ההרשמה אוסף. משמש כטיפוס של useForm בשלב 11. */
export class NewUser {

    constructor(public firstName: string,
                public lastName: string,
                public phoneNumber: string) {
    }
}

/* מה שטופס ההתחברות אוסף. משמש כטיפוס של useForm בשלב 12.
   TODO-1: אין endpoint להתחברות בשרת, ולכן אין DTO מקביל.
   ראה TASKS-FRONT.md §4 */
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

    /* נספח א': fullName הוא getter מחושב, לא שדה */
    public get fullName(): string {
        return `${this.firstName} ${this.lastName}`.trim();
    }
}
