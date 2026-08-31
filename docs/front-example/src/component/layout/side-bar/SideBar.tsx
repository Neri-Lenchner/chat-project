import React, {JSX, useEffect, useState} from 'react';
import './SideBar.css';
import {NavLink} from "react-router-dom";
import {authStore} from "../../../state/auth-state";
import {RoleId} from "../../../models/enums";
import {courseStore} from "../../../state/course-state";
import {User} from "../../../models/user";

function SideBar(): JSX.Element {

    const [user, setUser] = useState<User | null>(authStore.getState().user);

    useEffect(() => {

        authStore.subscribe(() => {
            setUser(authStore.getState().user);
        });

    }, []);

    return (
        <div className="SideBar">
            { !user ? <></> :
                <div className="links">
                    {user?.roleId === RoleId.Admin && <NavLink to="/new-course">New Course</NavLink>}
                    <NavLink to="/courses-list">View Courses List</NavLink>
                    <NavLink to="/socket-test">Socket Test</NavLink>
                </div>
            }
        </div>
    );
}

export default SideBar;
