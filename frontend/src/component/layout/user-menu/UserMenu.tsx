import {JSX, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import Icon from "../../ui/icon/Icon";
import Avatar from "../../ui/avatar/Avatar";
import {User} from "../../../models/user";
import {UserActionType, userStore} from "../../../state/user-state";
import {initials} from "../../../utils/avatar";
import "./UserMenu.css";

/* התנהגות זהה ל-mountUserMenu ב-docs/DESIGN/screens.js:
   לחיצה על ה-chip פותחת וסוגרת, לחיצה בכל מקום אחר סוגרת, Escape סוגר,
   ו-aria-expanded על הטריגר משקף את המצב. */

function UserMenu(): JSX.Element {

    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(userStore.getState().user);
    const [isOpen, setOpen] = useState<boolean>(false);

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const subscription = userStore.subscribe(() => {
            setUser(userStore.getState().user);
        });
        return () => subscription();
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        function onDocumentClick(event: MouseEvent): void {
            if (!menuRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        function onKeyDown(event: KeyboardEvent): void {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("click", onDocumentClick);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("click", onDocumentClick);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen]);

    function onLogout(): void {
        setOpen(false);
        userStore.dispatch({type: UserActionType.Logout, payload: null});
        navigate("/login", {replace: true});
    }

    if (!user) return (<></>);

    return (
        <div className="menu" ref={menuRef}>
            <button className="user-chip"
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() => setOpen(!isOpen)}>
                <Avatar id={user.id} initials={initials(user.fullName)} size="sm"/>
                <span className="user-chip__name">{user.fullName}</span>
                <Icon name="chevron" size="sm"/>
            </button>

            <div className="menu__panel" hidden={!isOpen}>
                <div className="menu__head">
                    <div className="menu__name">{user.fullName}</div>
                    <div className="menu__meta u-num">{user.phoneNumber}</div>
                </div>
                {/* פריט "שיחה חדשה" נוסף כאן בשלב 18, יחד עם הדיאלוג שהוא פותח. */}
                <button className="menu__item menu__item--danger" type="button" onClick={onLogout}>
                    <Icon name="logout"/>
                    התנתקות
                </button>
            </div>
        </div>
    );
}

export default UserMenu;
