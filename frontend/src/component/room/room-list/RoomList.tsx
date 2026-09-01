import {JSX, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import RoomCard from "../room-card/RoomCard";
import DeleteRoomDialog from "../delete-room-dialog/DeleteRoomDialog";
import Skeleton from "../../ui/skeleton/Skeleton";
import Banner from "../../ui/banner/Banner";
import Empty from "../../ui/empty/Empty";
import {Room} from "../../../models/room";
import {roomStore} from "../../../state/room-state";
import {roomService} from "../../../services/room-service";
import {ShowToast} from "../../layout/app-shell/AppShell";
import "./RoomList.css";

/* Connects to the store following the pattern in docs/front-example/src/component/.../CourseList.tsx.
   Four states per section 7 in DESIGN-SYSTEM: loading, empty, error, data. */

const SKELETON_COUNT = 5;

interface RoomListProps {
    /* Passed in at stage 18 — opens the "new chat" dialog from the empty state. */
    onNewChat?: () => void;
    showToast: ShowToast;
}

function RoomList(roomListProps: RoomListProps): JSX.Element {

    const navigate = useNavigate();
    const {roomId} = useParams<{ roomId: string }>();

    const [roomList, setRoomList] = useState<Room[]>(roomStore.getState().roomList);
    const [isLoading, setLoading] = useState<boolean>(!roomService.isFetched);
    const [hasError, setError] = useState<boolean>(false);
    const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

    useEffect(() => {

        const subscription = roomStore.subscribe(() => {
            setRoomList(roomStore.getState().roomList);
        });

        (async function getRoomList() {
            try {
                setError(false);
                const list = await roomService.getRoomList();
                setRoomList(list);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        })();

        return () => subscription();

    }, []);

    async function onRetry(): Promise<void> {
        setLoading(true);
        setError(false);
        try {
            setRoomList(await roomService.getRoomList(true));
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    /* A real, irreversible deletion (DELETE /api/room/{room_id}) — not a local
       hide. Failure is rethrown so DeleteRoomDialog keeps itself open. */
    async function onConfirmDelete(room: Room): Promise<void> {
        try {
            await roomService.deleteRoom(room.id);
            setRoomToDelete(null);
            roomListProps.showToast("השיחה נמחקה");
            if (String(room.id) === roomId) {
                navigate("/");
            }
        } catch {
            roomListProps.showToast("לא ניתן למחוק את השיחה. נסה שוב.", "error");
            throw new Error("מחיקת השיחה נכשלה");
        }
    }

    /* Loading state — skeleton shaped like the cards. Never a spinner on a blank screen. */
    if (isLoading) {
        return (
            <ul className="RoomList">
                {Array.from({length: SKELETON_COUNT}, (_, index) => (
                    <li className="room-skeleton" key={index}>
                        <Skeleton className="room-skeleton__avatar"/>
                        <span>
                            <Skeleton className="room-skeleton__line RoomList__line--short"/>
                            <Skeleton className="room-skeleton__line"/>
                        </span>
                    </li>
                ))}
            </ul>
        );
    }

    if (hasError) {
        return (
            <Banner variant="error"
                    title="לא ניתן לטעון את השיחות"
                    text="נסה שוב."
                    actionLabel="טעינה מחדש"
                    onAction={onRetry}/>
        );
    }

    if (roomList.length === 0) {
        return (
            <Empty icon="chat"
                   title="עוד לא התחלת שיחה"
                   text="בחר איש קשר והשיחה תיפתח כאן."
                   actionLabel="שיחה חדשה"
                   actionIcon="plus"
                   onAction={roomListProps.onNewChat}/>
        );
    }

    return (
        <>
            {/* Base order is the server's id-descending guarantee; a room jumps to
                the top only once a message is actually sent in it — see room-state.ts */}
            <ul className="RoomList">
                {roomList.map(room => (
                    <li key={room.id}>
                        <RoomCard room={room}
                                  isActive={String(room.id) === roomId}
                                  onOpen={() => navigate("/chat/" + room.id)}
                                  onDelete={setRoomToDelete}/>
                    </li>
                ))}
            </ul>

            {roomToDelete && (
                <DeleteRoomDialog room={roomToDelete}
                                  onCancel={() => setRoomToDelete(null)}
                                  onConfirm={onConfirmDelete}/>
            )}
        </>
    );
}

export default RoomList;
