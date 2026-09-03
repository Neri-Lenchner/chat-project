import {JSX, KeyboardEvent, useRef, useState} from "react";
import Avatar from "../../ui/avatar/Avatar";
import Button from "../../ui/button/Button";
import {Room} from "../../../models/room";
import {initials} from "../../../utils/avatar";
import {formatRoomStamp} from "../../../utils/date";
import "./RoomCard.css";

/* Structure from roomMarkup() in docs/DESIGN/screens.js.
   div and not button — the card contains a delete button, and a button inside a button is invalid.

   Long press (Section 8 in the spec) — the same 550ms as in bindRoomInteractions. */

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
    /* Marks that the long press already fired, so the click event that follows it
       doesn't open the conversation. Same semantics as longPressed in the prototype. */
    const didLongPress = useRef<boolean>(false);

    /* TODO-3: Room has no last message from the server. It's shown only for a room
       whose messages have already been loaded into MessageStore. See TASKS-FRONT.md §4 */
    const hasPreview = Boolean(room.lastMessage);
    const lastText = hasPreview ? room.lastMessage : "עדיין אין תצוגה מקדימה";

    /* Empty only for a room whose last loaded message predates the server's date_time column. */
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

            <Avatar id={room.other?.id} initials={initials(room.displayName)}/>

            <span className="room__main">
                <span className="room__name u-truncate">{room.displayName}</span>
                <span className={hasPreview ? "room__last u-truncate" : "room__last u-truncate u-faint"}>
                    {lastText}
                </span>
            </span>

            <span className="room__meta">
                <span className="room__time u-num">{stamp}</span>
                {/* TODO-5: there's no "unread" count on the server. unread is always 0, so the badge
                    is built here but never actually shown. See TASKS-FRONT.md §4 */}
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
