import {JSX} from "react";
import {Route, Routes} from "react-router-dom";
import Main from "../component/layout/main/Main";
import CourseForm from "../component/course-form/CourseForm";
import CourseListRoute from "../component/course-list-route/CourseListRoute";
import CourseListWithAdding from "../component/course-list-with-adding/CourseListWithAdding";
import Register from "../component/auth/register/Register";
import Login from "../component/auth/login/Login";
import PrivateRoute from "../component/private-route/PrivateRoute";
import {RoleId} from "../models/enums";
import CourseStudentRoute from "../component/course-student-route/CourseStudentRoute";
import SocketTest from "../component/socket-test/SocketTest";


function Routing(): JSX.Element {
    return (
        <Routes>
            <Route path="/courses-list" element={<CourseListRoute />}/>
            <Route path="/courses-list-with-adding" element={<CourseListWithAdding />}/>
            <Route path="/new-course/:id?" element={<PrivateRoute permissionIdList={[RoleId.Admin]} child={<CourseForm />}/>}/>
            <Route path="/register" element={<PrivateRoute permissionIdList={[RoleId.Admin]} child={<Register />}/>}/>
            <Route path="/course-students" element={<PrivateRoute permissionIdList={[RoleId.Admin]} child={<CourseStudentRoute />}/>}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/socket-test" element={<SocketTest />}/>
            <Route path="/" element={<Main />}/>
            <Route path="*" element={<Main />}/>
        </Routes>
    );
}

export default Routing;
