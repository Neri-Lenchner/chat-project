import React, {JSX} from 'react';
import './CourseItem.css';
import {Course} from "../../../../models/course";
import {useNavigate} from "react-router-dom";
import {CourseActionType, courseStore} from "../../../../state/course-state";
import {appConfig} from "../../../../utils/app-config";

interface CourseItemProps {
    course: Course,
}

function CourseItem(courseItemProps: CourseItemProps): JSX.Element {

    const navigate = useNavigate();

    function onChecked(isChecked: boolean, course: Course): void {
        course.isChecked = isChecked;
    }

    function updateCourse(id: number) {
        navigate("/new-course/" + id);
    }

    function navigateToCourseStudents(id: number) {
        courseStore.dispatch({type: CourseActionType.UpdateSelectedCourse, payload: id});
        navigate("/course-students");
    }

    return (
        <div className="CourseItem">
            <div className="course-header">
                <h2 className="course-title">{courseItemProps.course.name}</h2>

                <label className="remove-checkbox">
                    <input onChange={(e) => onChecked(e.target.checked, courseItemProps.course)} type="checkbox"/>
                    remove
                </label>
            </div>

            <button onClick={() => updateCourse(courseItemProps.course.id!)}>Show</button>
            <button onClick={() => navigateToCourseStudents(courseItemProps.course.id!)}>Students</button>

            <div className="course-details">
                <p>⏱ Duration: <span>{courseItemProps.course.duration}</span></p>
                <p>🎯 Difficulty: <span>{courseItemProps.course.difficulty}</span></p>
                <p>👥 Students: <span>{courseItemProps.course.numOfStudents}</span></p>
                <p>Lecture: <span> {courseItemProps.course.lecturerName} </span></p>
                {courseItemProps.course.image ? <p><img alt="Course Image" src={appConfig.uploadsAddress + courseItemProps.course.image}/></p> : ""}
            </div>
        </div>
    );
}

export default CourseItem;
