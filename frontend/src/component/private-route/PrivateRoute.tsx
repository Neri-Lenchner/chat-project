import {JSX, ReactNode} from "react";
import {Navigate} from "react-router-dom";
import {userStore} from "../../state/user-state";

/* Following the pattern in docs/front-example/src/component/private-route/PrivateRoute.tsx.
   There are no roles and no permissions here — the server has no authentication at all (API SPEC §1),
   so the only check is whether a logged-in user exists.

   Unlike in front-example, the child isn't wrapped in a <div>: the app's screens sit
   inside a CSS grid (.app), and a wrapping element would break the layout. */

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
