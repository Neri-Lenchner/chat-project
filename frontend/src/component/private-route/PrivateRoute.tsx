import {JSX, ReactNode} from "react";
import {Navigate} from "react-router-dom";
import {userStore} from "../../state/user-state";

/* בתבנית docs/front-example/src/component/private-route/PrivateRoute.tsx.
   כאן אין תפקידים ואין הרשאות — בשרת אין אימות כלל (API SPEC §1),
   ולכן הבדיקה היחידה היא האם קיים משתמש מחובר.

   שלא כמו ב-front-example, הילד לא נעטף ב-<div>: מסכי האפליקציה יושבים
   בתוך רשת CSS (.app), ואלמנט עוטף היה שובר את הפריסה. */

interface PrivateRouteProps {
    child: ReactNode;
}

function PrivateRoute(privateRouteProps: PrivateRouteProps): JSX.Element {

    if (!userStore.getState().user) {
        return (<Navigate to="/login" replace/>);
    }

    return (
        <>{privateRouteProps.child}</>
    );
}

export default PrivateRoute;
