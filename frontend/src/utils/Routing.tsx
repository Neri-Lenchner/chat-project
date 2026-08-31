import {JSX} from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import Register from "../component/auth/register/Register";
import Login from "../component/auth/login/Login";
import HomeRoute from "../component/home/HomeRoute";
import ChatRoute from "../component/chat/chat-route/ChatRoute";
import PrivateRoute from "../component/private-route/PrivateRoute";
import Styleguide from "../dev/Styleguide";

/* בתבנית docs/front-example/src/utils/Routing.tsx. */

function Routing(): JSX.Element {

    return (
        <Routes>
            <Route path="/register" element={<Register/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/" element={<PrivateRoute child={<HomeRoute/>}/>}/>
            <Route path="/chat/:roomId" element={<PrivateRoute child={<ChatRoute/>}/>}/>
            {/* מסלול פיתוח בלבד — נמחק בשלב 22 יחד עם src/dev/ */}
            <Route path="/styleguide" element={<Styleguide/>}/>
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    );
}

export default Routing;
