import {JSX, KeyboardEvent, useRef, useState} from "react";
import Avatar from "../../ui/avatar/Avatar";
import Button from "../../ui/button/Button";
import {Room} from "../../../models/room";
import {initials} from "../../../utils/avatar";
import {formatRoomStamp} from "../../../utils/date";
import "./RoomCard.css";

/* המבנה מ-roomMarkup() ב-docs/DESIGN/screens.js.
   div ולא button — בתוך הכרטיס יש כפתור מחיקה, וכפתור בתוך כפתור פסול.

   לחיצה ארוכה (סעיף 8 באפיון) — אותם 550ms כמו ב-bindRoomInteractions. */

const LONG_PRESS_MS = 550;

interface RoomCardProps {
    room: Room;
    isActive?: boolean;
    onOpen: (room: Room) => void;
    onDelete?: (room: Room) => void;
}

function RoomCard(roomCardProps: RoomCardProps): JSX.Element {

    const {room, isActive, onOpen, onDelete} = roomCardProps;

    const [isPressing, setPressing] = useState<boolean>(false);

    const pressTimer = useRef<number | undefined>(undefined);
    /* מסמן שהלחיצה הארוכה כבר פעלה, כדי שה-click שיגיע אחריה
       לא יפתח את השיחה. אותה סמנטיקה כמו longPressed בפרוטוטייפ. */
    const didLongPress = useRef<boolean>(false);

    /* TODO-3: אין ב-Room הודעה אחרונה מהשרת. היא מוצגת רק לחדר
       שהודעותיו כבר נטענו ל-MessageStore. ראה TASKS-FRONT.md §4 */
    const hasPreview = Boolean(room.lastMessage);
    const lastText = hasPreview ? room.lastMessage : "עדיין אין תצוגה מקדימה";

    /* TODO-4: אין date_time בשרת. בלי זמן מקומי העמודה נשארת ריקה. */
    const stamp = room.lastAt ? formatRoomStamp(room.lastAt) : "";

    function cancelPress(): void {
        window.clearTimeout(pressTimer.current);
        pressTimer.current = undefined;
        setPressing(false);
    }

    function onPointerDown(): void {
        if (!onDelete) return;
        didLongPress.current = false;
        setPressing(true);
        pressTimer.current = window.setTimeout(() => {
            didLongPress.current = true;
            setPressing(false);
            onDelete(room);
        }, LONG_PRESS_MS);
    }

    function onClick(): void {
        cancelPress();
        if (didLongPress.current) {
            didLongPress.current = false;
            return;
        }
        onOpen(room);
    }

    function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
        if (event.key === "Enter") {
            onOpen(room);
        }
        if (event.key === "Delete" && onDelete) {
            event.preventDefault();
            onDelete(room);
        }
    }

    return (
        <div className={isPressing ? "room is-pressing" : "room"}
             role="button"
             tabIndex={0}
             aria-current={isActive ? "true" : undefined}
             onClick={onClick}
             onKeyDown={onKeyDown}
             onPointerDown={onPointerDown}
             onPointerUp={cancelPress}
             onPointerLeave={cancelPress}
             onPointerCancel={cancelPress}>

            <Avatar id={room.otherUserId} initials={initials(room.displayName)}/>

            <span className="room__main">
                <span className="room__name u-truncate">{room.displayName}</span>
                <span className={hasPreview ? "room__last u-truncate" : "room__last u-truncate u-faint"}>
                    {lastText}
                </span>
            </span>

            <span className="room__meta">
                <span className="room__time u-num">{stamp}</span>
                {/* TODO-5: אין ספירת "לא נקרא" בשרת. unread תמיד 0 ולכן ה-badge
                    נבנה כאן אך לעולם לא מוצג. ראה TASKS-FRONT.md §4 */}
                {room.unread > 0 ? (
                    <span className="badge">{room.unread}</span>
                ) : (
                    <Button variant="icon"
                            icon="trash"
                            className="room__delete"
                            aria-label={`מחיקת השיחה עם ${room.displayName}`}
                            onPointerDown={event => event.stopPropagation()}
                            onClick={event => {
                                event.stopPropagation();
                                onDelete?.(room);
                            }}/>
                )}
            </span>
        </div>
    );
}

export default RoomCard;
