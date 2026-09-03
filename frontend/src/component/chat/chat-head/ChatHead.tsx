import {JSX, useEffect, useState} from "react";
import Avatar from "../../ui/avatar/Avatar";
import Button from "../../ui/button/Button";
import {Room} from "../../../models/room";
import {initials} from "../../../utils/avatar";
import {presenceStore} from "../../../state/presence-state";
import {typingStore} from "../../../state/typing-state";
import "./ChatHead.css";

/* Structure from chat.html: back arrow (mobile only, hidden via CSS above 760px) ·
   Avatar · room name · delete. chat-head__meta now carries presence/typing —
   only for a 1:1 room (room.other), same limitation Composer.tsx already has. */

interface ChatHeadProps {
    room: Room;
    onBack: () => void;
    onDeleteRequest: () => void;
}

function ChatHead(chatHeadProps: ChatHeadProps): JSX.Element {

    const {room, onBack, onDeleteRequest} = chatHeadProps;
    const otherId = room.other?.id;

    const [isOnline, setOnline] = useState<boolean>(
        otherId !== undefined && Boolean(presenceStore.getState().onlineUserIds[otherId])
    );

    useEffect(() => {
        if (otherId === undefined) return;
        setOnline(Boolean(presenceStore.getState().onlineUserIds[otherId]));
        const subscription = presenceStore.subscribe(() => {
            setOnline(Boolean(presenceStore.getState().onlineUserIds[otherId]));
        });
        return () => subscription();
    }, [otherId]);

    const [isTyping, setTyping] = useState<boolean>(false);

    useEffect(() => {
        /* typingStore only changes on a socket event, but "typing" needs to turn itself off
           once the stored expiry passes even if no new event ever arrives — hence the poll
           alongside the subscription. */
        function sync(): void {
            const until = typingStore.getState().typingUntilByRoom[room.id];
            setTyping(Boolean(until) && (until as number) > Date.now());
        }
        sync();
        const subscription = typingStore.subscribe(sync);
        const interval = window.setInterval(sync, 1000);
        return () => {
            subscription();
            window.clearInterval(interval);
        };
    }, [room.id]);

    return (
        <div className="chat-head">
            <Button variant="icon"
                    icon="back"
                    className="chat-head__back"
                    aria-label="חזרה לרשימת השיחות"
                    onClick={onBack}/>

            <Avatar id={room.other?.id}
                    initials={initials(room.displayName)}
                    online={otherId !== undefined ? isOnline : undefined}/>

            <div className="chat-head__main">
                <h2 className="chat-head__name u-truncate">{room.displayName}</h2>
                {otherId !== undefined && (
                    <p className="chat-head__meta">
                        {isTyping ? "מקליד/ה…" : (isOnline ? "מחובר/ת" : "לא מחובר/ת")}
                    </p>
                )}
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
