import React, {JSX, useEffect} from 'react';
import './CourseListRoute.css';
import CourseList from "./course-list/CourseList";
import {CourseActionType, courseStore} from "../../state/course-state";

function CourseListRoute(): JSX.Element {


    useEffect(() => {
        courseStore.dispatch({type: CourseActionType.UpdateSelectedCourse, payload: null});
    }, []);


    return (
        <div className="CourseListRoute">
            <CourseList />
        </div>
    );
}

export default CourseListRoute;
