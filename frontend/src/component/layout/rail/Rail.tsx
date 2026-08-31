import {JSX, ReactNode} from "react";
import "./Rail.css";

/* עמודת השיחות. מעטפת בלבד — התוכן שלה מגיע כילדים.
   בשלב 15 RoomList ייכנס לתוך .rail__body, והמונה יקבל את מספר החדרים. */

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
