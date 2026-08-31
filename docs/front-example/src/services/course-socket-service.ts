import {Course} from "../models/course";
import {socketService} from "./socket-service";
import {CourseActionType, courseStore} from "../state/course-state";

class CourseSocketService {

    public courseAdded() {
        socketService.connect();
        socketService.socket.on("addedCourse", (course) => {
            courseStore.dispatch({type: CourseActionType.AddCourse, payload: course});
        });
    }

}

export const courseSocketService = new CourseSocketService();
