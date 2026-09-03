import {JSX, useEffect, useRef, useState} from "react";
import MessageItem from "../message-item/MessageItem";
import Skeleton from "../../ui/skeleton/Skeleton";
import Banner from "../../ui/banner/Banner";
import Empty from "../../ui/empty/Empty";
import {Message} from "../../../models/message";
import {Room, RoomPreview} from "../../../models/room";
import {messageStore} from "../../../state/message-state";
import {messageService} from "../../../services/message-service";
import {RoomActionType, roomStore} from "../../../state/room-state";
import {formatDayLabel, isSameDay} from "../../../utils/date";
import {ShowToast} from "../../layout/app-shell/AppShell";
import "./Thread.css";

/* Connects to the store following the pattern in RoomList.tsx, but per room individually — a one-time load
   per roomId (messageService.getMessagesByRoom), not for the whole app. */

interface ThreadProps {
    room: Room;
    showToast: ShowToast;
}

interface DayGroup {
    label: string;
    isStart: boolean;
    messages: Message[];
}

/* Grouping by day, following the render() pattern in docs/DESIGN/chat.html: the first group
   is always "start of the conversation". A new separator opens only when both sides are known and different —
   TODO-4: a historical message without `at` doesn't open its own separator, and stays in the
   previous group, so as not to show false "day separators". */
function groupByDay(messages: Message[]): DayGroup[] {
    const groups: DayGroup[] = [];
    messages.forEach((message, index) => {
        if (index === 0) {
            groups.push({label: "תחילת השיחה", isStart: true, messages: [message]});
            return;
        }
        const previous = messages[index - 1];
        const dayChanged = Boolean(message.at) && Boolean(previous.at)
            && !isSameDay(new Date(previous.at as string), new Date(message.at as string));
        if (dayChanged) {
            groups.push({label: formatDayLabel(message.at as string), isStart: false, messages: [message]});
        } else {
            groups[groups.length - 1].messages.push(message);
        }
    });
    return groups;
}

function Thread(threadProps: ThreadProps): JSX.Element {

    const {room, showToast} = threadProps;

    const [messages, setMessages] = useState<Message[]>(messageStore.getState().messagesByRoom[room.id] ?? []);
    const [isLoading, setLoading] = useState<boolean>(!messageStore.getState().loadedRooms[room.id]);
    const [hasError, setError] = useState<boolean>(false);

    const bottomRef = useRef<HTMLDivElement>(null);

    /* Marks the room read whenever it has a received-and-unread message in view — covers
       both "just opened this room" and "a new message arrived while it's open". Re-marking
       an already-read room is a harmless no-op server-side (message_service.mark_room_read),
       so this doesn't need to track what it already sent. */
    function markReadIfNeeded(list: Message[]): void {
        if (list.some(message => !message.mine && !message.isRead)) {
            void messageService.markRoomRead(room.id);
        }
    }

    useEffect(() => {

        setLoading(!messageStore.getState().loadedRooms[room.id]);
        setError(false);

        const subscription = messageStore.subscribe(() => {
            const list = messageStore.getState().messagesByRoom[room.id] ?? [];
            setMessages(list);
            markReadIfNeeded(list);
        });

        (async function load() {
            try {
                const list = await messageService.getMessagesByRoom(room.id);
                setMessages(list);
                markReadIfNeeded(list);
                /* TODO-3: this is the only way the last message appears in the
                   room list. See TASKS-FRONT.md §4 and RoomCard.tsx */
                const last = list[list.length - 1];
                if (last) {
                    roomStore.dispatch({
                        type: RoomActionType.UpdateRoomPreview,
                        payload: new RoomPreview(room.id, last.content, last.at),
                    });
                }
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        })();

        return () => subscription();

    }, [room.id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView();
    }, [messages]);

    async function onRetry(): Promise<void> {
        setLoading(true);
        setError(false);
        try {
            setMessages(await messageService.getMessagesByRoom(room.id, true));
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    /* .msg__retry — Section 21 in the spec. otherUserId is always known here: a
       failed message was only ever created through Composer, which is disabled when there's no single recipient (group room). */
    async function onRetryMessage(message: Message): Promise<void> {
        const otherUserId = room.other?.id;
        if (!otherUserId) return;
        try {
            await messageService.retryMessage(room.id, otherUserId, message);
        } catch {
            showToast("לא ניתן לשלוח את ההודעה. נסה שוב.", "error");
        }
    }

    return (
        <div className="thread">
            {hasError && (
                <Banner variant="error"
                        title="לא ניתן לטעון את ההודעות"
                        text="ההודעות לא נטענו. נסה שוב."
                        actionLabel="טעינה מחדש"
                        onAction={onRetry}/>
            )}

            <div className="thread__inner">
                {isLoading ? (
                    <div className="thread-skeleton">
                        <Skeleton className="thread-skeleton__bubble"/>
                        <Skeleton className="thread-skeleton__bubble thread-skeleton__bubble--out"/>
                        <Skeleton className="thread-skeleton__bubble thread-skeleton__bubble--narrow"/>
                        <Skeleton className="thread-skeleton__bubble thread-skeleton__bubble--out thread-skeleton__bubble--wide"/>
                    </div>
                ) : hasError ? null : messages.length === 0 ? (
                    <Empty icon="chat"
                           title={`השיחה עם ${room.displayName} ריקה`}
                           text="ההודעה הראשונה שתשלח תופיע כאן."/>
                ) : (
                    <>
                        {groupByDay(messages).map(group => (
                            <div key={group.messages[0].id}>
                                <div className={group.isStart ? "day day--start" : "day"}>
                                    <span className="day__label">{group.label}</span>
                                    <span className="day__cap"/>
                                </div>
                                {group.messages.map(message => (
                                    <MessageItem key={message.id} message={message} onRetry={onRetryMessage}/>
                                ))}
                            </div>
                        ))}
                        <div ref={bottomRef}/>
                    </>
                )}
            </div>
        </div>
    );
}

export default Thread;
