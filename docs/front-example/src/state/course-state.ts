// Step 1

import {Course} from "../models/course";
import {createStore} from "redux";
import {courseSocketService} from "../services/course-socket-service";

export class CourseState {
    courseList: Course[] = [];
    selectedCourse: Course | null = null;

    constructor() {
        courseSocketService.courseAdded();
    }
}

// Step 2
export enum CourseActionType {
    GetCourseList = "GetCourseList",
    AddCourse = "AddCourse",
    UpdateCourse = "UpdateCourse",
    DeleteCourse = "DeleteCourse",
    UpdateSelectedCourse = "UpdateSelectedCourse",
}

// Step 3
export interface CourseAction {
    type: CourseActionType,
    payload: any,
}


// Step 4
export function courseReducer(courseState: CourseState = new CourseState(), action: CourseAction): CourseState {

    const newState: CourseState = {...courseState};
    newState.courseList = [...newState.courseList];

    switch (action.type) {
        case CourseActionType.GetCourseList:
            newState.courseList = action.payload;
            break;
        case CourseActionType.AddCourse:
            newState.courseList.push(action.payload);
            break;
        case CourseActionType.UpdateCourse:
            const indexToUpdate = newState.courseList.findIndex((item) => item.id === action.payload.id);
            newState.courseList[indexToUpdate] = action.payload;
            break;
        case CourseActionType.DeleteCourse:
            const indexToDelete = newState.courseList.findIndex((item) => item.id === action.payload);
            newState.courseList.splice(indexToDelete, 1);
            break;
        case CourseActionType.UpdateSelectedCourse:
            if (action.payload) {
                const course = newState.courseList.find(course => course.id === action.payload);
                newState.selectedCourse = course!;
            }
            else {
                newState.selectedCourse = null;
            }
            break;
    }

    return newState;
}

// Step 5
export const courseStore = createStore(courseReducer);
