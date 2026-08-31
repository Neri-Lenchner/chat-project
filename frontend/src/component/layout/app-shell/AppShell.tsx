import {JSX, ReactNode, useEffect, useRef, useState} from "react";
import Topbar from "../topbar/Topbar";
import Rail from "../rail/Rail";
import RoomList from "../../room/room-list/RoomList";
import ToastList, {ToastMessage, ToastVariant, TOAST_DURATION_MS} from "../../ui/toast/Toast";
import {roomStore} from "../../../state/room-state";
import "./AppShell.css";

/* הפריסה מסעיף 5.2 ב-DESIGN-SYSTEM:
       .app > .topbar (64px)
            > .workspace > .rail (352px) | .main

   העמודה נשארת גלויה גם במסך שיחה — היא מעטפת ולא מסך.
   רק מתחת ל-760px screens.css מסתיר אחד מהשניים, ולשם כך הוא בודק
   את body[data-screen]. זו הסיבה שהמאפיין נכתב כאן.

   המעטפת מחזיקה גם את תור הטוסטים ומעבירה showToast למטה ב-props. */

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
            <Topbar/>
            <div className="workspace">
                <Rail count={roomCount > 0 ? roomCount : undefined}>
                    <RoomList showToast={showToast}/>
                </Rail>
                {typeof children === "function" ? children(showToast) : children}
            </div>
            <ToastList toastList={toastList}/>
        </div>
    );
}

export default AppShell;
