import React, {JSX, useEffect, useState} from 'react';
import './Header.css';
import {courseStore} from "../../../state/course-state";
import {courseService} from "../../../services/course-service";
import {NavLink, useNavigate} from "react-router-dom";
import {AuthActionType, authStore} from "../../../state/auth-state";
import {User} from "../../../models/user";
import {RoleId} from "../../../models/enums";

function Header(): JSX.Element {
    console.log(courseStore.getState().selectedCourse);
    const navigate = useNavigate();

    const [headline, setHeadline] = useState<string>(courseStore.getState().courseList.length.toString());

    const [isLogin, setLogin] = useState<boolean>(authStore.getState().user !== null);

    const [user, setUser] = useState<User | null>(authStore.getState().user);

    useEffect(() => {

        courseStore.subscribe(() => {
            if (courseStore.getState().selectedCourse) {
                setHeadline(courseStore.getState().selectedCourse!.name);
            }
            else {
                setHeadline(courseStore.getState().courseList.length.toString() + " Courses");
            }

        });

        authStore.subscribe(() => {
            setLogin(authStore.getState().user !== null);
            setUser(authStore.getState().user);
        });

    }, []);

    function logout(): void {
        authStore.dispatch({type: AuthActionType.Logout, payload: null});
        navigate("/login");
    }

    return (
        <div className="Header">
            <h1>{courseService.isFetched ? headline : "No Data"}</h1>
            {!isLogin ?
                <div className="links">
                    <NavLink to="/login">Login</NavLink>
                </div> : <div className="links">
                    <span>Hello {user ? user!.firstName + " " + user!.lastName : ''}</span>
                    <button onClick={() => logout()}>Logout</button>
                    {user?.roleId === RoleId.Admin && <NavLink to="/register">Add new user</NavLink>}
                </div>
            }
        </div>
    );
}

export default Header;
