import {Course} from "../models/course";
import axios from "axios";
import {appConfig} from "../utils/app-config";
import {CourseActionType, courseStore} from "../state/course-state";
import {authStore} from "../state/auth-state";

class CourseService {

    isFetched: boolean = false;

    public async getCourseList(forceFetch: boolean = false): Promise<Course[]> {
        if (!this.isFetched || forceFetch) {
            try {
                const response = await axios.get<Course[]>(appConfig.apiAddress + "course", {headers: {Authorization: "Bearer " + authStore.getState().token }});
                this.isFetched = true;
                courseStore.dispatch({type: CourseActionType.GetCourseList, payload: response.data});
            } catch (err) {
                console.error("Error from getCourseList");
                throw err;
            }
        }
        return courseStore.getState().courseList;
    }

    public async getCourseListByLecturerId(lecturerId: number, forceFetch: boolean = false): Promise<Course[]> {
        if (!this.isFetched || forceFetch) {
            try {
                const response = await axios.get<Course[]>(appConfig.apiAddress + "course/lecturer/" + lecturerId, {headers: {Authorization: "Bearer " + authStore.getState().token }});
                this.isFetched = true;
                courseStore.dispatch({type: CourseActionType.GetCourseList, payload: response.data});
            } catch (err) {
                console.error("Error from getCourseListByLecturerId");
                throw err;
            }
        }
        return courseStore.getState().courseList;
    }

    public async addCourse(course: Course): Promise<Course> {
        const formData = new FormData();
        // JSON.stringify(); => stringc "{"id": }"
        // JSON.parse(); => Object {id: }
        formData.append("course", JSON.stringify(course));
        formData.append("image", course.image![0]);
        try {
            const response = await axios.post<Course>(appConfig.apiAddress + "course", formData, {headers: {Authorization: "Bearer " + authStore.getState().token }});
            response.data.lecturerName = course.lecturerName;
            if (!courseStore.getState().courseList.find(course => course.id === response.data.id)) {
                courseStore.dispatch({type: CourseActionType.AddCourse, payload: response.data});
            }
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    public async updateCourse(course: Course): Promise<void> {
        const formData = new FormData();
        // JSON.stringify(); => stringc "{"id": }"
        // JSON.parse(); => Object {id: }
        formData.append("course", JSON.stringify(course));
        formData.append("image", course.image![0]);
        try {
            await axios.put<void>(appConfig.apiAddress + "course/" + course.id, formData, {headers: { Authorization: "Bearer " + authStore.getState().token }});
            courseStore.dispatch({type: CourseActionType.UpdateCourse, payload: course});
        } catch (err) {
            console.error("Error from updateCourse");
            throw err;
        }
    }

    public async deleteCourse(id: number): Promise<void> {
        try {
            await axios.delete<void>(appConfig.apiAddress + "course/" + id, {headers: { Authorization: "Bearer " + authStore.getState().token }});
            courseStore.dispatch({type: CourseActionType.DeleteCourse, payload: id});
        } catch (err) {
            console.error("Error from delete Course");
            throw err;
        }
    }

    public async deleteCourseList(): Promise<void> {
        for (const course of courseStore.getState().courseList.filter(item => item.isChecked)) {
            await this.deleteCourse(course.id!);
        }
    }

    public async getSingleCourse(id: number): Promise<Course> {
        try {
            const response = await axios.get<Course>(appConfig.apiAddress + "course/" + id, {headers: { Authorization: "Bearer " + authStore.getState().token }});
            return response.data;
        } catch (err) {
            console.error("Error from getSingleCourse");
            throw err;
        }
    }

    public filterByName(value: string): Course[] {
        return courseStore.getState().courseList.filter(course => course.name.toLowerCase().includes(value.toLowerCase()));
    }

    public async filterByNameOnServer(value: string): Promise<Course[]> {
        try {
            const response = await axios.get<Course[]>(appConfig.apiAddress + "course/filter?name=" + value, {headers: {Authorization: "Bearer " + authStore.getState().token }});
            return response.data;
        } catch (err) {
            console.error("Error from getCourseList");
            throw err;
        }
    }
}

export const courseService = new CourseService();
