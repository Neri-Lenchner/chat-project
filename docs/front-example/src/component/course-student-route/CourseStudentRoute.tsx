import React, {JSX, useEffect, useState} from 'react';
import './CourseStudentRoute.css';
import CourseStudentsForm from "./course-students-form/CourseStudentsForm";
import {courseService} from "../../services/course-service";
import {courseStudentService} from "../../services/course-student-service";
import StudentItem from "./student-item/StudentItem";
import {User} from "../../models/user";

function CourseStudentRoute(): JSX.Element {

    let [studentList, setStudentList] = useState<User[]>([]);

    useEffect(() => {

        (async function getStudentListByCourse() {
            const studentList = await courseStudentService.getStudentListByCourse();
            setStudentList(studentList);
            console.log(studentList);
        })();


    }, []);

    async function addStudent() {

    }

    return (
        <div className="CourseListRoute">
            <CourseStudentsForm />
            {/*{loading ? <h4>Loading...</h4> : studentList.length === 0 ? <h4>No Results</h4> :*/}
                <div className="courseCards">
                    {studentList.map(student => <StudentItem student={student} addStudent={addStudent} key={student.id}/>)}
                </div>
            {/*}*/}
        </div>
    );
}

export default CourseStudentRoute;
