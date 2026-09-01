import {JSX, ReactNode} from "react";
import "./Rail.css";

/* The conversations rail. A shell only — its content comes in as children.
   At stage 15 RoomList will go inside .rail__body, and the counter will get the number of rooms. */

interface RailProps {
    count?: number;
    children?: ReactNode;
}

function Rail(railProps: RailProps): JSX.Element {

    return (
        <aside className="rail">
            <div className="rail__head">
                <h1 className="rail__title">השיחות שלי</h1>
                {railProps.count !== undefined && (
                    <span className="rail__count u-num">{railProps.count}</span>
                )}
            </div>

            <div className="rail__body">
                {railProps.children}
            </div>
        </aside>
    );
}

export default Rail;
