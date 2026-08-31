import {User} from "../models/user";
import {CourseStudent} from "../models/course-student";
import {courseStore} from "../state/course-state";
import axios from "axios";
import {appConfig} from "../utils/app-config";
import {authStore} from "../state/auth-state";

class CourseStudentService {

    public async addStudentToCourse(studentId: number): Promise<User[]> {
        const courseStudent: CourseStudent = new CourseStudent(courseStore.getState().selectedCourse?.id! ,studentId);
        try {
            const response = await axios.post<User[]>(appConfig.apiAddress + "course-students/", courseStudent, {headers: {Authorization: "Bearer " + authStore.getState().token}});
            return response.data;
        } catch (err) {
            console.error("Error from addStudentToCourse");
            throw err;
        }
    }

    public async getStudentListByCourse(): Promise<User[]> {
        const courseId = courseStore.getState().selectedCourse?.id!
        try {
            const response = await axios.get<User[]>(appConfig.apiAddress + "course-students/course/" + courseId, {headers: {Authorization: "Bearer " + authStore.getState().token}});
            return response.data;
        } catch (err) {
            console.error("Error from addStudentToCourse");
            throw err;
        }
    }
}

export const courseStudentService = new CourseStudentService();
