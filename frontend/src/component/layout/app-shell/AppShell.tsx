import {JSX, ReactNode, useEffect, useRef, useState} from "react";
import Topbar from "../topbar/Topbar";
import Rail from "../rail/Rail";
import RoomList from "../../room/room-list/RoomList";
import NewChatDialog from "../../room/new-chat-dialog/NewChatDialog";
import ToastList, {ToastMessage, ToastVariant, TOAST_DURATION_MS} from "../../ui/toast/Toast";
import {roomStore} from "../../../state/room-state";
import "./AppShell.css";

/* Layout from section 5.2 in DESIGN-SYSTEM:
       .app > .topbar (64px)
            > .workspace > .rail (352px) | .main

   The rail stays visible even on the chat screen — it's a shell, not a screen.
   Only below 760px does screens.css hide one of the two, and for that it checks
   body[data-screen]. That's why the attribute is set here.

   The shell also holds the toast queue and passes showToast down through props. */

export type AppScreen = "home" | "chat";

export type ShowToast = (text: string, variant?: ToastVariant) => void;

interface AppShellProps {
    screen: AppScreen;
    children: ReactNode | ((showToast: ShowToast) => ReactNode);
}

function AppShell(appShellProps: AppShellProps): JSX.Element {

    const {screen, children} = appShellProps;

    const [roomCount, setRoomCount] = useState<number>(roomStore.getState().roomList.length);
    const [toastList, setToastList] = useState<ToastMessage[]>([]);
    const [isNewChatOpen, setNewChatOpen] = useState<boolean>(false);

    const nextToastId = useRef<number>(1);

    function showToast(text: string, variant: ToastVariant = "default"): void {
        const id = nextToastId.current++;
        setToastList(current => [...current, new ToastMessage(id, text, variant)]);
        setTimeout(() => {
            setToastList(current => current.filter(toast => toast.id !== id));
        }, TOAST_DURATION_MS);
    }

    useEffect(() => {
        const subscription = roomStore.subscribe(() => {
            setRoomCount(roomStore.getState().roomList.length);
        });
        return () => subscription();
    }, []);

    useEffect(() => {
        document.body.dataset.screen = screen;
        return () => {
            delete document.body.dataset.screen;
        };
    }, [screen]);

    return (
        <div className="app">
            <Topbar onNewChat={() => setNewChatOpen(true)}/>
            <div className="workspace">
                <Rail count={roomCount > 0 ? roomCount : undefined}>
                    <RoomList showToast={showToast} onNewChat={() => setNewChatOpen(true)}/>
                </Rail>
                {typeof children === "function" ? children(showToast) : children}
            </div>
            <ToastList toastList={toastList}/>
            {isNewChatOpen && (
                <NewChatDialog onClose={() => setNewChatOpen(false)} showToast={showToast}/>
            )}
        </div>
    );
}

export default AppShell;
