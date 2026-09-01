import {JSX} from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import Register from "../component/auth/register/Register";
import Login from "../component/auth/login/Login";
import HomeRoute from "../component/home/HomeRoute";
import ChatRoute from "../component/chat/chat-route/ChatRoute";
import PrivateRoute from "../component/private-route/PrivateRoute";

/* Following the pattern in docs/front-example/src/utils/Routing.tsx. */

function Routing(): JSX.Element {

    return (
        <Routes>
            <Route path="/register" element={<Register/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/" element={<PrivateRoute child={<HomeRoute/>}/>}/>
            <Route path="/chat/:roomId" element={<PrivateRoute child={<ChatRoute/>}/>}/>
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    );
}

export default Routing;
