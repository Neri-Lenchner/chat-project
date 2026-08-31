import React, {JSX, useEffect, useState} from 'react';
import './CourseList.css';
import {courseService} from "../../../services/course-service";
import {Course} from "../../../models/course";
import CourseItem from "./course-item/CourseItem";
import {courseStore} from "../../../state/course-state";
import {authStore} from "../../../state/auth-state";
import {RoleId} from "../../../models/enums";

function CourseList(): JSX.Element {

    let [courseList, setCourseList] = useState<Course[]>([]);
    let [loading, setLoading] = useState<boolean>(true);


    useEffect(() => {

        const subscription = courseStore.subscribe(() => {
            setCourseList(courseStore.getState().courseList);
        });

        (async function getCourseList() {
            try {
                if (authStore.getState().user?.roleId === RoleId.Admin) {
                    courseList = await courseService.getCourseList();
                }
                else {
                    courseList = await courseService.getCourseListByLecturerId(authStore.getState().user?.id!);
                }
                setCourseList(courseList);
                setLoading(false);
            } catch (err) {
                alert(err);
            }
        })();

        return () => subscription();

    }, []);

    async function onRemove() {
        setLoading(true);
        await courseService.deleteCourseList();
        setLoading(false);
    }

    async function filterByName(value: string): Promise<void> {
        setCourseList(await courseService.filterByNameOnServer(value));
    }

    return (
        <div className="CourseList">
            <div>
                <button onClick={() => courseService.getCourseList(true)}>Refresh</button>
                <button onClick={() => onRemove()}>Delete Courses</button>
                <input type="text" onChange={(e) => filterByName(e.target.value)} placeholder="Filter by Name"/>
                {loading ? <h4>Loading...</h4> : courseList.length === 0 ? <h4>No Results</h4> :
                    <div className="courseCards">
                        {courseList.map(course => <CourseItem course={course} key={course.id}/>)}
                    </div>
                }
            </div>
        </div>
    );
}

export default CourseList;
