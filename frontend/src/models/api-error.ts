/* FastAPI's validation error structure, per API SPEC §4.1.
   detail is an **array** — it must not be displayed to the user directly.
   The correct way: map by loc[loc.length - 1] to a field in the form. */

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
