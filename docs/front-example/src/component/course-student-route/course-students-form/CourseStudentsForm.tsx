import React, {JSX, useEffect, useRef, useState} from 'react';
import './CourseStudentsForm.css';
import {courseService} from "../../../services/course-service";
import {RoleId} from "../../../models/enums";
import {userService} from "../../../services/user-service";
import {User} from "../../../models/user";
import StudentItem from "../student-item/StudentItem";
import {courseStore} from "../../../state/course-state";
import {courseStudentService} from "../../../services/course-student-service";

function CourseStudentsForm(): JSX.Element {

    let [studentList, setStudentList] = useState<User[]>([]);
    let [loading, setLoading] = useState<boolean>(false);

    const searchInput = useRef<HTMLInputElement>(null);


    useEffect(() => {

        // const subscription = courseStore.subscribe(() => {
        //     setCourseList(courseStore.getState().courseList);
        // });
        //
        // (async function getCourseList() {
        //     try {
        //         if (authStore.getState().user?.roleId === RoleId.Admin) {
        //             courseList = await courseService.getCourseList();
        //         }
        //         else {
        //             courseList = await courseService.getCourseListByLecturerId(authStore.getState().user?.id!);
        //         }
        //         setCourseList(courseList);
        //         setLoading(false);
        //     } catch (err) {
        //         alert(err);
        //     }
        // })();
        //
        // return () => subscription();

    }, []);

    async function onRemove() {
        setLoading(true);
        await courseService.deleteCourseList();
        setLoading(false);
    }

    // async function filterByName(value: string): Promise<void> {
    //     setCourseList(await courseService.filterByNameOnServer(value));
    // }

    async function getStudentList(): Promise<void> {
        if (searchInput.current!.value.length > 1) {
            setLoading(true);
            await userService.getUserList();
            const filteredStudentList = userService.filterUserListByName(searchInput.current!.value, RoleId.Student);
            setStudentList(filteredStudentList);
            setLoading(false);
        }
        else {
            alert("Name must be contain at least 2 characters")
        }
    }

    async function addStudent(id: number): Promise<void> {
        await courseStudentService.addStudentToCourse(id);
    }

    return (
        <div className="CourseStudentsForm">
            <div className="search">
                <input ref={searchInput} type="text" placeholder="Find Students"/>
                <button onClick={() => getStudentList()}>Search</button>
            </div>
            {loading ? <h4>Loading...</h4> : studentList.length === 0 ? <h4>No Results</h4> :
                <div className="courseCards">
                    {studentList.map(student => <StudentItem student={student} addStudent={addStudent} key={student.id}/>)}
                </div>
            }
        </div>
    );
}

export default CourseStudentsForm;
