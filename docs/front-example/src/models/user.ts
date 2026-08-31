export class User {

    constructor(public firstName: string,
                public lastName: string,
                public email: string,
                public password: string,
                public roleId: number,
                 public id?: number) {
    }
}