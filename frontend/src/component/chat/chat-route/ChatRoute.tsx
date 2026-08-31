import {JSX} from "react";
import {useParams} from "react-router-dom";
import AppShell from "../../layout/app-shell/AppShell";
import Empty from "../../ui/empty/Empty";
import "../../layout/app-shell/AppShell.css";

/* שלד בלבד. כותרת השיחה, ה-thread ושורת הכתיבה נבנים בשלבים 20–21. */

function ChatRoute(): JSX.Element {

    const {roomId} = useParams<{ roomId: string }>();

    return (
        <AppShell screen="chat">
            <main className="main main--blank">
                <Empty icon="chat"
                       title={`שיחה ${roomId}`}
                       text="מסך השיחה נבנה בשלבים 20–21."/>
            </main>
        </AppShell>
    );
}

export default ChatRoute;
