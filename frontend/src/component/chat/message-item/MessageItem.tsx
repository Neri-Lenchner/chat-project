import {JSX} from "react";
import Icon from "../../ui/icon/Icon";
import {Message} from "../../../models/message";
import {formatTime} from "../../../utils/date";
import "./MessageItem.css";

/* .msg--in / .msg--out based on mine (set during mapping, not a getter — appendix A).
   .msg--pending / .msg--failed based on status (Section 21 in the spec). */

interface MessageItemProps {
    message: Message;
    onRetry?: (message: Message) => void;
}

function MessageItem(messageItemProps: MessageItemProps): JSX.Element {

    const {message, onRetry} = messageItemProps;

    const classList = [
        "msg",
        message.mine ? "msg--out" : "msg--in",
        message.status ? `msg--${message.status}` : "",
    ].filter(Boolean).join(" ");

    /* A message from before the server had a date_time column has no `at`, and shows "··" with
       an explanation in the title. A pending/failed message hasn't reached the server (yet), so
       it also has no `at` — but the label there speaks for itself. */
    const time = message.status === "pending" ? "···" : (message.at ? formatTime(message.at) : "··");
    const timeTitle = !message.status && !message.at ? "השרת אינו מחזיר זמן הודעה" : undefined;

    /* Read ticks only make sense for a message that actually reached the server (mine,
       not pending/failed) — the other side can't have read something still in flight. */
    const showTicks = message.mine && !message.status;

    return (
        <div className={classList}>
            <div className="msg__body">
                <div>
                    <div className="bubble">{message.content}</div>
                    {message.status === "failed" && (
                        <button className="msg__retry" onClick={() => onRetry?.(message)}>
                            לא נשלח · שליחה חוזרת
                        </button>
                    )}
                </div>
            </div>
            <div className="msg__time u-num" title={timeTitle}>
                {time}
                {showTicks && (
                    <Icon name={message.isRead ? "checkDouble" : "check"}
                          size="sm"
                          className={message.isRead ? "msg__ticks msg__ticks--read" : "msg__ticks"}/>
                )}
            </div>
        </div>
    );
}

export default MessageItem;
