import {JSX} from "react";
import Icon from "../../ui/icon/Icon";
import Button from "../../ui/button/Button";
import UserMenu from "../user-menu/UserMenu";
import "../../ui/brand/Brand.css";
import "./Topbar.css";

/* Section 7.1 in the spec. Structure from docs/DESIGN/home.html.
   The #demo-slot element from the prototype is a demo-state switcher and has no place in the app. */

interface TopbarProps {
    onNewChat: () => void;
}

function Topbar(topbarProps: TopbarProps): JSX.Element {

    return (
        <header className="topbar">
            <span className="brand">
                <span className="brand__mark"><Icon name="kav"/></span>
                <span className="brand__name">קו</span>
            </span>

            <div className="topbar__actions">
                <Button variant="secondary"
                        size="sm"
                        icon="newchat"
                        onClick={topbarProps.onNewChat}>
                    שיחה חדשה
                </Button>

                <UserMenu onNewChat={topbarProps.onNewChat}/>
            </div>
        </header>
    );
}

export default Topbar;
