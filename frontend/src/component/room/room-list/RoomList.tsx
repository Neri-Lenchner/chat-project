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

/* חיבור לסטור בדפוס מ-docs/front-example/src/component/.../CourseList.tsx.
   ארבעה מצבים לפי סעיף 7 ב-DESIGN-SYSTEM: טעינה, ריק, שגיאה, נתונים. */

const SKELETON_COUNT = 5;

interface RoomListProps {
    /* נמסר בשלב 18 — פתיחת דיאלוג "שיחה חדשה" מהמצב הריק. */
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

    /* TODO-2: אין DELETE בשרת. ההסתרה מקומית, בלי שום קריאת רשת. */
    function onConfirmDelete(room: Room): void {
        roomService.hideRoom(room.id);
        setRoomToDelete(null);
        roomListProps.showToast("השיחה הוסתרה");
        /* TODO: להשלים בשלב 19 — הסרת ההודעות של החדר מ-MessageStore. */
        if (String(room.id) === roomId) {
            navigate("/");
        }
    }

    /* מיון לפי הזמן האחרון כשהוא ידוע. חדר בלי זמן (TODO-4) שומר על מקומו
       בסוף הרשימה, בסדר שבו הגיע מהשרת. */
    const sortedRoomList = [...roomList].sort((a, b) => {
        if (a.lastAt && b.lastAt) return a.lastAt < b.lastAt ? 1 : -1;
        if (a.lastAt) return -1;
        if (b.lastAt) return 1;
        return 0;
    });

    /* מצב טעינה — שלד בצורת הכרטיסים. לעולם לא ספינר על מסך ריק. */
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

    if (sortedRoomList.length === 0) {
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
            <ul className="RoomList">
                {sortedRoomList.map(room => (
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
