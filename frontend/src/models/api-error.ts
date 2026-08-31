/* מבנה שגיאת הוולידציה של FastAPI, לפי API SPEC §4.1.
   detail הוא **מערך** — אין להציג אותו ישירות למשתמש.
   הדרך הנכונה: למפות לפי loc[loc.length - 1] לשדה בטופס. */

export class ValidationErrorItemDTO {

    constructor(public type: string,
                public loc: string[],
                public msg: string) {
    }
}

export class ValidationErrorDTO {

    constructor(public detail: ValidationErrorItemDTO[]) {
    }
}
