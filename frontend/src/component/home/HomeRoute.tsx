import {JSX} from "react";
import AppShell from "../layout/app-shell/AppShell";
import Empty from "../ui/empty/Empty";
import "../layout/app-shell/AppShell.css";

/* The main screen. The conversation list goes into the Rail at stage 15. */

function HomeRoute(): JSX.Element {

    return (
        <AppShell screen="home">
            <main className="main main--blank">
                <Empty icon="kav"
                       title="בחר שיחה מהרשימה"
                       text="לחיצה ארוכה על שיחה פותחת את אפשרות המחיקה."/>
            </main>
        </AppShell>
    );
}

export default HomeRoute;
