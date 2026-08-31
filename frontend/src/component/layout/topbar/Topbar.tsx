import {JSX} from "react";
import Icon from "../../ui/icon/Icon";
import Button from "../../ui/button/Button";
import UserMenu from "../user-menu/UserMenu";
import "../../ui/brand/Brand.css";
import "./Topbar.css";

/* סעיף 7.1 באפיון. המבנה מ-docs/DESIGN/home.html.
   האלמנט #demo-slot מהפרוטוטייפ הוא בורר מצבי הדגמה ואין לו מקום באפליקציה. */

interface TopbarProps {
    /* נמסר בשלב 18, כשדיאלוג "שיחה חדשה" נבנה. */
    onNewChat?: () => void;
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

                <UserMenu/>
            </div>
        </header>
    );
}

export default Topbar;
