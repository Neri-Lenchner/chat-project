import React, {JSX, ReactNode} from 'react';
import './PrivateRoute.css';
import {authStore} from "../../state/auth-state";
import {Navigate} from "react-router-dom";
import {RoleId} from "../../models/enums";

interface PrivateRouteProps {
    child: ReactNode;
    permissionIdList: RoleId[];
}

function PrivateRoute(privateRouteProps: PrivateRouteProps): JSX.Element {

    if (!authStore.getState().user) {
       return (<Navigate to="/login" />);
    }

    if (!privateRouteProps.permissionIdList.includes(authStore.getState().user!.roleId)) {
        return (<Navigate to="/" />);
    }

    return (
        <div>{privateRouteProps.child}</div>
    );
}

export default PrivateRoute;
