import React, {JSX} from 'react';
import './StudentItem.css';
import {User} from "../../../models/user";

interface StudentItemProps {
    student: User,
    addStudent: (id: number) => void;
}

function StudentItem(studentItemProps: StudentItemProps): JSX.Element {

    return (
        <div className="CourseItem">
            <div className="course-header">
                <h2 className="course-title">{studentItemProps.student.firstName + " " + studentItemProps.student.lastName}</h2>
            </div>

            <button onClick={() => studentItemProps.addStudent(studentItemProps.student.id!)}>Add</button>

            <div className="course-details">
                <p>⏱ Email: <span>{studentItemProps.student.email}</span></p>
            </div>
        </div>
    );
}

export default StudentItem;
