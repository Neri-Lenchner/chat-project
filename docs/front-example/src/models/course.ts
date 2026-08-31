export class Course {

    constructor(public name: string,
                public duration: number,
                public difficulty: number,
                public numOfStudents: number,
                public isChecked: boolean = false,
                public lecturerId: number,
                public lecturerName?: string,
                public image?: string,
                public id?: number) {
    }
}


