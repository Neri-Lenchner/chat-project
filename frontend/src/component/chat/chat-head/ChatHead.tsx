import {JSX} from "react";
import Avatar from "../../ui/avatar/Avatar";
import Button from "../../ui/button/Button";
import {Room} from "../../../models/room";
import {initials} from "../../../utils/avatar";
import "./ChatHead.css";

/* Structure from chat.html: back arrow (mobile only, hidden via CSS above 760px) ·
   Avatar · room name · delete. See TASKS-FRONT.md §20 — chat-head__meta
   isn't needed at this stage (depends on TODO-3/TODO-4). */

interface ChatHeadProps {
    room: Room;
    onBack: () => void;
    onDeleteRequest: () => void;
}

function ChatHead(chatHeadProps: ChatHeadProps): JSX.Element {

    const {room, onBack, onDeleteRequest} = chatHeadProps;

    return (
        <div className="chat-head">
            <Button variant="icon"
                    icon="back"
                    className="chat-head__back"
                    aria-label="חזרה לרשימת השיחות"
                    onClick={onBack}/>

            <Avatar id={room.other?.id} initials={initials(room.displayName)}/>

            <div className="chat-head__main">
                <h2 className="chat-head__name u-truncate">{room.displayName}</h2>
            </div>

            <Button variant="icon"
                    icon="trash"
                    className="chat-head__delete"
                    aria-label={`מחיקת השיחה עם ${room.displayName}`}
                    onClick={onDeleteRequest}/>
        </div>
    );
}

export default ChatHead;
