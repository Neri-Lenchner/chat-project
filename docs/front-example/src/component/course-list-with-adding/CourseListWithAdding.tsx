import React, {JSX} from 'react';
import CourseList from "../course-list-route/course-list/CourseList";
import CourseForm from "../course-form/CourseForm";
function CourseListWithAdding(): JSX.Element {


    return (
        <div className="CourseListWithAdding">
            <CourseForm />
            <CourseList />
        </div>
    );
}

export default CourseListWithAdding;
