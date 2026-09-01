import {JSX, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import AppShell, {ShowToast} from "../../layout/app-shell/AppShell";
import ChatHead from "../chat-head/ChatHead";
import Thread from "../thread/Thread";
import Composer from "../composer/Composer";
import DeleteRoomDialog from "../../room/delete-room-dialog/DeleteRoomDialog";
import Empty from "../../ui/empty/Empty";
import {Room} from "../../../models/room";
import {roomStore} from "../../../state/room-state";
import {roomService} from "../../../services/room-service";
import "../../layout/app-shell/AppShell.css";

/* Connects to roomStore following the pattern in RoomList.tsx. The call to getRoomList() here
   doesn't create an additional network request if the list was already loaded in Rail — it just
   waits for the result if loading is still in progress (e.g. navigating directly to /chat/:id). */

function ChatRoute(): JSX.Element {

    const {roomId} = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const numericRoomId = Number(roomId);

    const [roomList, setRoomList] = useState<Room[]>(roomStore.getState().roomList);
    const [isResolved, setResolved] = useState<boolean>(roomService.isFetched);
    const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

    useEffect(() => {

        const subscription = roomStore.subscribe(() => {
            setRoomList(roomStore.getState().roomList);
        });

        (async function ensureRoomList() {
            try {
                setRoomList(await roomService.getRoomList());
            } finally {
                setResolved(true);
            }
        })();

        return () => subscription();

    }, []);

    const room = roomList.find(candidate => candidate.id === numericRoomId);

    useEffect(() => {
        if (isResolved && !room) {
            navigate("/", {replace: true});
        }
    }, [isResolved, room, navigate]);

    async function onConfirmDelete(showToast: ShowToast, target: Room): Promise<void> {
        try {
            await roomService.deleteRoom(target.id);
            setRoomToDelete(null);
            showToast("השיחה נמחקה");
            navigate("/");
        } catch {
            showToast("לא ניתן למחוק את השיחה. נסה שוב.", "error");
            throw new Error("מחיקת השיחה נכשלה");
        }
    }

    return (
        <AppShell screen="chat">
            {showToast => (
                <>
                    {room ? (
                        <main className="main">
                            <ChatHead room={room}
                                      onBack={() => navigate("/")}
                                      onDeleteRequest={() => setRoomToDelete(room)}/>
                            <Thread room={room} showToast={showToast}/>
                            <Composer key={room.id} room={room} showToast={showToast}/>
                        </main>
                    ) : (
                        <main className="main main--blank">
                            <Empty icon="chat" title="טוען שיחה…"/>
                        </main>
                    )}

                    {roomToDelete && (
                        <DeleteRoomDialog room={roomToDelete}
                                          onCancel={() => setRoomToDelete(null)}
                                          onConfirm={target => onConfirmDelete(showToast, target)}/>
                    )}
                </>
            )}
        </AppShell>
    );
}

export default ChatRoute;
