import {JSX, useEffect, useRef, useState} from "react";
import Icon, {ICONS, IconName} from "../component/ui/icon/Icon";
import Button from "../component/ui/button/Button";
import Field from "../component/ui/field/Field";
import Banner from "../component/ui/banner/Banner";
import Avatar from "../component/ui/avatar/Avatar";
import Spinner from "../component/ui/spinner/Spinner";
import Skeleton from "../component/ui/skeleton/Skeleton";
import Empty from "../component/ui/empty/Empty";
import "../component/ui/brand/Brand.css";
import "../component/ui/badge/Badge.css";
import "../component/layout/user-menu/UserMenu.css";
import Dialog from "../component/ui/dialog/Dialog";
import ToastList, {ToastMessage, ToastVariant, TOAST_DURATION_MS} from "../component/ui/toast/Toast";
import "../component/auth/Auth.css";
import "../component/chat/message-item/MessageItem.css";
import "../component/layout/app-shell/AppShell.css";
import "../component/layout/topbar/Topbar.css";
import "../component/layout/rail/Rail.css";
import "../component/room/room-card/RoomCard.css";
import "../component/room/room-list/RoomList.css";
import "../component/chat/chat-head/ChatHead.css";
import "../component/chat/thread/Thread.css";
import "../component/chat/composer/Composer.css";
import "../component/room/new-chat-dialog/NewChatDialog.css";
import {UserDTO} from "../models/user";
import {RoomDTO, RoomMeta} from "../models/room";
import {MessageDTO} from "../models/message";
import {toMessage, toRoom, toUser, toUserDTO} from "../utils/mappers";
import {formatDate, formatDayLabel, formatRoomStamp, formatTime, isSameDay} from "../utils/date";
import {initials} from "../utils/avatar";
import {appConfig} from "../utils/app-config";
import {hiddenRooms, messageTimes, roomMeta, session} from "../utils/storage";
import {NewUser} from "../models/user";
import {userService} from "../services/user-service";
import {AxiosError} from "axios";
import {User} from "../models/user";
import {UserActionType, userStore} from "../state/user-state";
import "./Styleguide.css";

/* עמוד בדיקה זמני. משלב 4 הוא בנוי מהרכיבים עצמם ולא מ-HTML גולמי.
   מה שעדיין אין לו רכיב (כרטיס שיחה, בועה, תפריט) נשאר HTML לפי הפרוטוטייפ
   עד שהשלב שלו יגיע. הקובץ נמחק בשלב 22. */

function Styleguide(): JSX.Element {

    /* בדיקת שלב 5 — מיפוי DTO ↔ Model. זמנית, נמחקת בשלב 22. */
    useEffect(() => {
        const userDto = new UserDTO(2001, "עידן", "אייש", "052-1234567");
        const roomDto = new RoomDTO(1001, "");
        const messageDto = new MessageDTO(7, "שלום", 1001, 2002, false);

        const user = toUser(userDto);
        const roomWithoutMeta = toRoom(roomDto);
        const roomWithMeta = toRoom(roomDto, new RoomMeta(2002, "יוסי כהן"));
        const incoming = toMessage(messageDto, user.id);
        const outgoing = toMessage(new MessageDTO(8, "היי", 1001, 2001, false), user.id, "2026-08-27T09:14:00");

        console.group("שלב 5 — מיפוי DTO ↔ Model");
        console.log("User      ", user, "| fullName:", user.fullName);
        console.log("UserDTO   ", toUserDTO(user), "| 4 שדות:", Object.keys(toUserDTO(user)).length);
        console.log("Room ללא meta", roomWithoutMeta, "| displayName:", roomWithoutMeta.displayName);
        console.log("Room עם meta ", roomWithMeta, "| displayName:", roomWithMeta.displayName);
        console.log("Message נכנס ", incoming, "| mine:", incoming.mine);
        console.log("Message יוצא ", outgoing, "| mine:", outgoing.mine, "| at:", outgoing.at);
        console.groupEnd();
    }, []);

    /* בדיקת שלב 6 — תאריכים. now ו-yesterday נבנים פעם אחת לרנדר. */
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const lastWeek = new Date();
    lastWeek.setDate(now.getDate() - 7);

    const dateSamples = [
        {label: "היום", fn: "formatTime", out: formatTime(now.toISOString())},
        {label: "היום", fn: "formatDate", out: formatDate(now.toISOString())},
        {label: "היום", fn: "formatRoomStamp", out: formatRoomStamp(now.toISOString())},
        {label: "אתמול", fn: "formatRoomStamp", out: formatRoomStamp(yesterday.toISOString())},
        {label: "לפני שבוע", fn: "formatRoomStamp", out: formatRoomStamp(lastWeek.toISOString())},
        {label: "היום", fn: "formatDayLabel", out: formatDayLabel(now.toISOString())},
        {label: "אתמול", fn: "formatDayLabel", out: formatDayLabel(yesterday.toISOString())},
        {label: "לפני שבוע", fn: "formatDayLabel", out: formatDayLabel(lastWeek.toISOString())},
        {label: "היום מול אתמול", fn: "isSameDay", out: String(isSameDay(now, yesterday))},
        {label: "היום מול היום", fn: "isSameDay", out: String(isSameDay(now, new Date()))},
    ];

    /* בדיקת שלב 16 — Dialog ו-Toast. זמני, נמחק בשלב 22. */
    const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
    const [toastList, setToastList] = useState<ToastMessage[]>([]);
    const nextToastId = useRef<number>(1);

    function showToast(text: string, variant: ToastVariant = "default"): void {
        const id = nextToastId.current++;
        setToastList(current => [...current, new ToastMessage(id, text, variant)]);
        setTimeout(() => setToastList(current => current.filter(toast => toast.id !== id)), TOAST_DURATION_MS);
    }

    /* בדיקת שלב 8 — חיבור לסטור בדפוס useState + store.subscribe().
       זהה ל-CourseList.tsx ב-front-example. זמני, נמחק בשלב 22. */
    const [currentUser, setCurrentUser] = useState<User | null>(userStore.getState().user);

    useEffect(() => {
        const subscription = userStore.subscribe(() => {
            setCurrentUser(userStore.getState().user);
        });
        return () => subscription();
    }, []);

    function onLoginDemo(): void {
        userStore.dispatch({
            type: UserActionType.Login,
            payload: new User(2001, "עידן", "אייש", "052-1234567"),
        });
    }

    function onLogoutDemo(): void {
        userStore.dispatch({type: UserActionType.Logout, payload: null});
    }

    /* בדיקת שלב 7 — קריאה אמיתית לשרת. זמני, נמחק בשלב 22. */
    const [registerResult, setRegisterResult] = useState<string>("");
    const [isRegistering, setRegistering] = useState<boolean>(false);

    async function onRegisterDemo(): Promise<void> {
        setRegistering(true);
        setRegisterResult("");
        const stamp = new Date().toISOString().slice(11, 19).replace(/:/g, "");
        try {
            const user = await userService.register(new NewUser("בדיקה", "שלב7", `050${stamp}`));
            userStore.dispatch({type: UserActionType.Register, payload: user});
            setRegisterResult(`נוצר משתמש · id ${user.id} · ${user.fullName} · ${user.phoneNumber}`);
        } catch (error) {
            const err = error as AxiosError;
            setRegisterResult(`נכשל · סטטוס ${err.response?.status ?? "אין תשובה"}`);
        } finally {
            setRegistering(false);
        }
    }

    const storageProbe = `נשמרו: ${Object.keys(roomMeta.getAll()).length} רשומות roomMeta · `
        + `${Object.keys(messageTimes.getAll()).length} רשומות messageTimes · `
        + `${hiddenRooms.getAll().length} חדרים מוסתרים · `
        + `משתמש מחובר: ${session.get()?.fullName ?? "אין"}`;

    /* הדגמת קריטריון הסיום של שלב 4: לחיצה נועלת את הכפתור לשתי שניות */
    const [isSubmitting, setSubmitting] = useState<boolean>(false);
    const [clickCount, setClickCount] = useState<number>(0);

    function onSubmitDemo(): void {
        setClickCount(clickCount + 1);
        setSubmitting(true);
        setTimeout(() => setSubmitting(false), 2000);
    }

    return (
        <main className="page Styleguide">
            <header className="page__head">
                <span className="brand">
                    <span className="brand__mark"><Icon name="kav"/></span>
                    <span className="brand__name">קו</span>
                </span>
                <h1 className="page__title">מדריך העיצוב</h1>
                <p className="page__lede">
                    כל מה שמופיע כאן מגיע מ־<span className="u-num">tokens.css</span>. אם צריך לשנות מראה —
                    משנים טוקן, לא רכיב. המסמך המלא נמצא ב־<span className="u-num">docs/DESIGN-SYSTEM.md</span>.
                </p>
            </header>

            {/* צבע */}
            <section className="section">
                <h2 className="section__title">צבע</h2>
                <div className="grid">
                    <div className="swatch"><div className="swatch__chip Styleguide__swatch--canvas"></div><div className="swatch__body"><div className="swatch__name">רקע</div><div className="swatch__code u-ltr">--color-canvas · #EEF0F5</div></div></div>
                    <div className="swatch"><div className="swatch__chip Styleguide__swatch--surface"></div><div className="swatch__body"><div className="swatch__name">משטח</div><div className="swatch__code u-ltr">--color-surface · #FFFFFF</div></div></div>
                    <div className="swatch"><div className="swatch__chip Styleguide__swatch--ink"></div><div className="swatch__body"><div className="swatch__name">דיו</div><div className="swatch__code u-ltr">--color-ink · #12151C</div></div></div>
                    <div className="swatch"><div className="swatch__chip Styleguide__swatch--ink-2"></div><div className="swatch__body"><div className="swatch__name">דיו משני</div><div className="swatch__code u-ltr">--color-ink-2 · #464F60</div></div></div>
                    <div className="swatch"><div className="swatch__chip Styleguide__swatch--accent"></div><div className="swatch__body"><div className="swatch__name">אקסנט</div><div className="swatch__code u-ltr">--color-accent · #22399E</div></div></div>
                    <div className="swatch"><div className="swatch__chip Styleguide__swatch--accent-wash"></div><div className="swatch__body"><div className="swatch__name">אקסנט רך</div><div className="swatch__code u-ltr">--color-accent-wash · #E8EBF7</div></div></div>
                    <div className="swatch"><div className="swatch__chip Styleguide__swatch--danger"></div><div className="swatch__body"><div className="swatch__name">שגיאה</div><div className="swatch__code u-ltr">--color-danger · #C0362B</div></div></div>
                    <div className="swatch"><div className="swatch__chip Styleguide__swatch--line"></div><div className="swatch__body"><div className="swatch__name">קו</div><div className="swatch__code u-ltr">--color-line · #DDE2EC</div></div></div>
                    <div className="swatch"><div className="swatch__chip Styleguide__swatch--highlight"></div><div className="swatch__body"><div className="swatch__name">הדגשה — לא נקרא</div><div className="swatch__code u-ltr">--color-highlight · #C2740A</div></div></div>
                </div>
            </section>

            {/* טיפוגרפיה */}
            <section className="section">
                <h2 className="section__title">טיפוגרפיה</h2>
                <p className="page__lede Styleguide__lede">משפחה אחת — <strong>Rubik</strong>. ההיררכיה נבנית ממשקל, גודל וצבע. מספרים משתמשים באותו פונט עם ספרות טבלאיות.</p>
                <div className="specimen">
                    <div className="Styleguide__type--display">כל שיחה יושבת על קו זמן</div>
                    <div className="specimen__meta u-ltr">Rubik 700 · --fs-2xl 40px · כותרות</div>
                </div>
                <div className="specimen">
                    <div className="Styleguide__type--title">שם שיחה וכותרת כרטיס</div>
                    <div className="specimen__meta u-ltr">Rubik 600 · --fs-md 17px</div>
                </div>
                <div className="specimen">
                    <div className="Styleguide__type--body">גוף הטקסט של הממשק, ההודעות ותוויות השדות. גובה שורה 1.55.</div>
                    <div className="specimen__meta u-ltr">Rubik 400 · --fs-base 15px</div>
                </div>
                <div className="specimen">
                    <div className="u-num Styleguide__type--num">12:45 · 19/08/2026 · 0501234567</div>
                    <div className="specimen__meta u-ltr">Rubik 400 + tabular-nums · --fs-xs 12px · שעות, תאריכים ומספרים</div>
                </div>
            </section>

            {/* כפתורים */}
            <section className="section">
                <h2 className="section__title">כפתורים</h2>
                <div className="card">
                    <div className="stack">
                        <Button variant="primary">פעולה ראשית</Button>
                        <Button variant="secondary">פעולה משנית</Button>
                        <Button variant="ghost">שקוף</Button>
                        <Button variant="danger">מחיקה</Button>
                        <Button variant="primary" loading>שולח…</Button>
                        <Button variant="primary" disabled>מנוטרל</Button>
                        <Button variant="icon" icon="more" aria-label="עוד"/>
                        <Button variant="primary" round icon="send" aria-label="שליחה" className="Styleguide__send"/>
                    </div>
                </div>
                <div className="card">
                    <div className="stack">
                        <Button variant="primary" size="sm">קטן ראשי</Button>
                        <Button variant="secondary" size="sm">קטן משני</Button>
                        <Button variant="primary" icon="plus">עם אייקון</Button>
                    </div>
                    <Button variant="primary" block>רוחב מלא</Button>
                </div>
                {/* קריטריון הסיום של שלב 4 — מניעת שליחה כפולה */}
                <div className="card">
                    <div className="stack">
                        <Button variant="primary" loading={isSubmitting} onClick={onSubmitDemo}>
                            {isSubmitting ? "שולח…" : "לחץ כדי לבדוק נעילה"}
                        </Button>
                        <span className="u-num Styleguide__type--num">מספר הלחיצות שנקלטו: {clickCount}</span>
                    </div>
                </div>
            </section>

            {/* שדות */}
            <section className="section">
                <h2 className="section__title">שדות והודעות שגיאה</h2>
                <div className="grid Styleguide__grid--wide">
                    <div className="card">
                        <Field label="מספר טלפון"
                               icon="phone"
                               className="input--phone"
                               defaultValue="0501234567"
                               hint="אליו יגיעו השיחות שלך."/>
                    </div>
                    <div className="card">
                        <Field label="מספר טלפון"
                               icon="phone"
                               className="input--phone"
                               defaultValue="05012"
                               error="מספר הטלפון לא תקין. הפורמט הנדרש: 0501234567"/>
                    </div>
                    <div className="card">
                        <Banner variant="error"
                                title="לא ניתן להתחבר"
                                text="המספר הזה לא רשום אצלנו. בדוק אותו או צור חשבון חדש."/>
                    </div>
                    <div className="card">
                        <Banner variant="warn"
                                title="ההסתרה מקומית בלבד"
                                text="השרת עדיין לא תומך במחיקת שיחה."
                                actionLabel="הבנתי"/>
                    </div>
                    <div className="card">
                        <Field label="שדה ללא אייקון" placeholder="input--plain"/>
                    </div>
                </div>
            </section>

            {/* רכיבי תוכן */}
            <section className="section">
                <h2 className="section__title">כרטיס שיחה</h2>
                <div className="card Styleguide__canvas--pad">
                    <ul className="Styleguide__rooms">
                        <li>
                            <div className="room" role="button" tabIndex={0} aria-current="true">
                                <Avatar id={1} initials="יכ"/>
                                <span className="room__main">
                                    <span className="room__name u-truncate">יוסי כהן</span>
                                    <span className="room__last u-truncate">סגור, נדבר מחר בבוקר</span>
                                </span>
                                <span className="room__meta">
                                    <span className="room__time">12:45</span>
                                </span>
                            </div>
                        </li>
                        <li>
                            <div className="room" role="button" tabIndex={0}>
                                <Avatar id={4} initials="נש"/>
                                <span className="room__main">
                                    <span className="room__name u-truncate">נועה שגב</span>
                                    <span className="room__last u-truncate">שלחתי לך את הקובץ, תעדכן אותי</span>
                                </span>
                                <span className="room__meta">
                                    <span className="room__time">09:12</span>
                                    <span className="badge">2</span>
                                </span>
                            </div>
                        </li>
                        <li>
                            <div className="room" role="button" tabIndex={0}>
                                <Avatar id={2} initials="דל"/>
                                <span className="room__main">
                                    <span className="room__name u-truncate">דני לוי</span>
                                    <span className="room__last u-truncate">תודה!</span>
                                </span>
                                <span className="room__meta">
                                    <span className="room__time">19/08/2026</span>
                                </span>
                            </div>
                        </li>
                        <li>
                            <div className="room-skeleton">
                                <Skeleton className="room-skeleton__avatar"/>
                                <div>
                                    <Skeleton className="room-skeleton__line"/>
                                    <Skeleton className="room-skeleton__line"/>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>

            <section className="section">
                <h2 className="section__title">הודעות ופס הזמן</h2>
                <div className="card Styleguide__canvas">
                    <div className="thread__inner">
                        <div className="day"><span className="day__label">היום</span><span className="day__cap"></span></div>
                        <div className="msg msg--in">
                            <div className="msg__body"><div className="bubble">הודעה נכנסת יושבת בצד ההתחלה</div></div>
                            <div className="msg__time u-num">09:14</div>
                        </div>
                        <div className="msg msg--out">
                            <div className="msg__body"><div className="bubble">הודעה יוצאת בצד השני, צמודה לפס הזמן</div></div>
                            <div className="msg__time u-num">09:16</div>
                        </div>
                        <div className="msg msg--out msg--pending">
                            <div className="msg__body"><div className="bubble">בשליחה</div></div>
                            <div className="msg__time u-num">···</div>
                        </div>
                        <div className="msg msg--out msg--failed">
                            <div className="msg__body">
                                <div>
                                    <div className="bubble">הודעה שנכשלה</div>
                                    <button className="msg__retry">לא נשלח · שליחה חוזרת</button>
                                </div>
                            </div>
                            <div className="msg__time u-num">09:18</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section">
                <h2 className="section__title">מונוגרמות, תגיות ומצב ריק</h2>
                <div className="grid Styleguide__grid--wide">
                    <div className="card">
                        <div className="stack">
                            <Avatar id={5} initials="יכ"/>
                            <Avatar id={1} initials="דל"/>
                            <Avatar id={2} initials="מי"/>
                            <Avatar id={3} initials="נש"/>
                            <Avatar id={4} initials="רא"/>
                            <Avatar id={1} initials="תפ" size="sm"/>
                            <Avatar id={3} initials="לג" size="lg"/>
                            <span className="badge">3</span>
                            <span className="chip">12:45</span>
                            <Spinner/>
                            <Spinner size="lg"/>
                        </div>
                    </div>
                    <div className="card">
                        <Empty icon="chat"
                               title="עוד לא התחלת שיחה"
                               text="בחר איש קשר והשיחה תיפתח כאן."
                               className="Styleguide__empty"/>
                    </div>
                    <div className="card">
                        <Empty icon="plus"
                               title="מצב ריק עם פעולה"
                               text="כפתור אחד בלבד, לפי סעיף 7 במערכת העיצוב."
                               actionLabel="שיחה חדשה"
                               actionIcon="plus"
                               className="Styleguide__empty"/>
                    </div>
                </div>
            </section>

            <section className="section">
                <h2 className="section__title">צללים</h2>
                <div className="grid">
                    <div className="card Styleguide__shadow--1"><div className="card__title">--shadow-1</div><p className="card__text">הרמה עדינה: כפתור ראשי, כותרת שיחה</p></div>
                    <div className="card Styleguide__shadow--card"><div className="card__title">--shadow-card</div><p className="card__text">כרטיס שיחה ואיש קשר במצב מנוחה</p></div>
                    <div className="card Styleguide__shadow--lift"><div className="card__title">--shadow-lift</div><p className="card__text">כרטיס ב-hover או כרטיס פעיל</p></div>
                    <div className="card Styleguide__shadow--pop"><div className="card__title">--shadow-pop</div><p className="card__text">דיאלוג בלבד</p></div>
                </div>
            </section>

            {/* בדיקת שלב 6 — Utils. זמני, נמחק בשלב 22. */}
            <section className="section">
                <h2 className="section__title">Utils — תאריך, מונוגרמה ואחסון</h2>
                <div className="card">
                    <table className="Styleguide__table u-ltr">
                        <thead>
                            <tr><th>קלט</th><th>פונקציה</th><th>פלט</th></tr>
                        </thead>
                        <tbody>
                            {dateSamples.map(row => (
                                <tr key={`${row.fn}-${row.label}`}>
                                    <td>{row.label}</td>
                                    <td className="u-ltr">{row.fn}</td>
                                    <td className="u-num">{row.out}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="card">
                    <table className="Styleguide__table">
                        <thead>
                            <tr><th>שם</th><th>initials</th><th>avatarTone</th></tr>
                        </thead>
                        <tbody>
                            {["יוסי כהן", "נועה שגב", "משה ישראלי", "רון"].map((name, index) => (
                                <tr key={name}>
                                    <td>{name}</td>
                                    <td><Avatar id={index + 1} initials={initials(name)} size="sm"/></td>
                                    <td className="u-ltr u-num">{"avatar--" + ((index + 1) % 5 + 1)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="card">
                    <p className="card__text u-ltr">apiAddress: <span className="u-num">{appConfig.apiAddress}</span></p>
                    <p className="card__text">{storageProbe}</p>
                </div>
            </section>

            {/* בדיקת שלב 16 — Dialog ו-Toast. זמני, נמחק בשלב 22. */}
            <section className="section">
                <h2 className="section__title">Dialog ו-Toast</h2>
                <div className="card">
                    <div className="stack">
                        <Button variant="secondary" icon="trash" onClick={() => setDialogOpen(true)}>
                            פתיחת דיאלוג
                        </Button>
                        <Button variant="secondary" icon="check" onClick={() => showToast("השיחה נמחקה")}>
                            טוסט רגיל
                        </Button>
                        <Button variant="secondary" icon="alert" onClick={() => showToast("לא ניתן לשלוח את ההודעה. נסה שוב.", "error")}>
                            טוסט שגיאה
                        </Button>
                    </div>
                    <p className="card__text u-faint">
                        Escape סוגר, לחיצה על הרקע סוגרת, והמיקוד חוזר לכפתור שפתח.
                        הטוסט נעלם לבד אחרי 3.2 שניות.
                    </p>
                </div>
            </section>

            {isDialogOpen && (
                <Dialog title="מחיקת שיחה"
                        onClose={() => setDialogOpen(false)}
                        actions={<>
                            <Button variant="secondary" onClick={() => setDialogOpen(false)}>ביטול</Button>
                            <Button variant="danger" onClick={() => { setDialogOpen(false); showToast("השיחה נמחקה"); }}>מחיקה</Button>
                        </>}>
                    <p className="dialog__text">
                        הפעולה מסתירה את השיחה במכשיר הזה בלבד. היא תמשיך להתקיים אצל הצד השני.
                    </p>
                </Dialog>
            )}

            <ToastList toastList={toastList}/>

            {/* בדיקת שלב 8 — userStore. זמני, נמחק בשלב 22. */}
            <section className="section">
                <h2 className="section__title">userStore</h2>
                <div className="card">
                    <div className="stack">
                        <Button variant="secondary" icon="user" onClick={onLoginDemo}>התחברות דמה</Button>
                        <Button variant="ghost" icon="logout" onClick={onLogoutDemo}>התנתקות</Button>
                    </div>
                    <p className="card__text">
                        {currentUser
                            ? `מחובר: ${currentUser.fullName} · id ${currentUser.id} · ${currentUser.phoneNumber}`
                            : "אין משתמש מחובר"}
                    </p>
                    <p className="card__text u-faint">
                        רענן את הדף — המשתמש אמור להישאר. הקונסטרקטור של UserState טוען מ-localStorage.
                    </p>
                </div>
            </section>

            {/* בדיקת שלב 7 — הקריאה האמיתית הראשונה לשרת. זמני, נמחק בשלב 22. */}
            <section className="section">
                <h2 className="section__title">שרת — הרשמה אמיתית</h2>
                <div className="card">
                    <div className="stack">
                        <Button variant="primary"
                                icon="user"
                                loading={isRegistering}
                                onClick={onRegisterDemo}>
                            {isRegistering ? "נרשם…" : "POST /api/user/"}
                        </Button>
                        <span className="card__text">{registerResult || "טרם נשלחה קריאה"}</span>
                    </div>
                </div>
            </section>

            <section className="section">
                <h2 className="section__title">אייקונים</h2>
                <div className="card">
                    <div className="grid Styleguide__icon-grid">
                        {(Object.keys(ICONS) as IconName[]).map(name => (
                            <div className="Styleguide__icon-cell" key={name}>
                                <Icon name={name}/>
                                <span className="Styleguide__icon-name u-ltr">{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Styleguide;
