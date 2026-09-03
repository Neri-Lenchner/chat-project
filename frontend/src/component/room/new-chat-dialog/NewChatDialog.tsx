import {FormEvent, JSX, useState} from "react";
import {useNavigate} from "react-router-dom";
import Dialog from "../../ui/dialog/Dialog";
import Avatar from "../../ui/avatar/Avatar";
import Field from "../../ui/field/Field";
import Button from "../../ui/button/Button";
import Banner from "../../ui/banner/Banner";
import {User} from "../../../models/user";
import {CONTACTS} from "../../../data/contacts";
import {roomService} from "../../../services/room-service";
import {userService} from "../../../services/user-service";
import {userStore} from "../../../state/user-state";
import {initials} from "../../../utils/avatar";
import {ShowToast} from "../../layout/app-shell/AppShell";
import "./NewChatDialog.css";

/* DOM from docs/DESIGN/new-chat.html, creation logic from screens.js §initNewChat,
   with one change: failure is shown as a toast rather than a banner inside the dialog,
   per TASKS-FRONT.md stage 18 section 3.

   Duplicate prevention (an existing room with the same contact) is handled inside
   roomService.getOrCreateRoom — not here.

   Phone-number search added on top of the designed screen — there's no docs/DESIGN mockup for
   it. Same phone regex/message as Register.tsx and Login.tsx. */

const PHONE_PATTERN = /^0(5\d|[2-4]|[8-9]|7\d)\d{7}$/;

interface NewChatDialogProps {
    onClose: () => void;
    showToast: ShowToast;
}

function NewChatDialog(newChatDialogProps: NewChatDialogProps): JSX.Element {

    const {onClose, showToast} = newChatDialogProps;
    const navigate = useNavigate();

    const [busyContactId, setBusyContactId] = useState<number | null>(null);

    const [phoneQuery, setPhoneQuery] = useState<string>("");
    const [phoneError, setPhoneError] = useState<string>("");
    const [notFound, setNotFound] = useState<boolean>(false);
    const [isSearching, setSearching] = useState<boolean>(false);

    async function onSelectContact(contact: User): Promise<void> {
        if (busyContactId !== null) return;
        setBusyContactId(contact.id);
        try {
            /* If a room with this contact already exists — getOrCreateRoom returns it
               without a server call. Otherwise the list isn't re-fetched with GET: the room returned
               from the server is added directly to roomStore inside roomService.createRoom.

               name can't be "" here — POST /api/room/'s RoomCreateDTO rejects a blank name
               with a 422 (backend/modules/room/room.py — not_blank validator; unlike the
               room auto-created by sending a message, which sets it directly on the ORM Room
               and never goes through that DTO). contact.fullName satisfies it. It's stored as
               the shared room name, but Room.displayName (models/room.ts) ignores that for a
               1:1 room and always shows other.fullName instead — per viewer, not per creator —
               so what's sent here doesn't otherwise matter. */
            const room = await roomService.getOrCreateRoom(contact.fullName, contact);
            navigate("/chat/" + room.id);
            onClose();
        } catch {
            setBusyContactId(null);
            showToast("לא ניתן ליצור את השיחה. נסה שוב.", "error");
        }
    }

    async function onSearch(event: FormEvent): Promise<void> {
        event.preventDefault();
        setNotFound(false);

        const normalized = phoneQuery.replace(/[\s-]/g, "");
        if (!PHONE_PATTERN.test(normalized)) {
            setPhoneError("מספר הטלפון לא תקין. הפורמט הנדרש: 0501234567");
            return;
        }
        setPhoneError("");

        const me = userStore.getState().user;
        if (me && normalized === me.phoneNumber.replace(/[\s-]/g, "")) {
            setPhoneError("זה המספר שלך.");
            return;
        }

        setSearching(true);
        try {
            const found = await userService.findByPhone(normalized);
            if (!found) {
                setNotFound(true);
                return;
            }
            await onSelectContact(found);
        } catch {
            showToast("לא ניתן לחפש את המספר. נסה שוב.", "error");
        } finally {
            setSearching(false);
        }
    }

    return (
        <Dialog title="שיחה חדשה"
                subtitle="בחר איש קשר או חפש לפי מספר טלפון."
                isWide
                showCloseButton
                onClose={onClose}>
            <form className="new-chat-search" onSubmit={onSearch} noValidate>
                <Field label="מספר טלפון"
                       icon="phone"
                       className="input--phone"
                       type="tel"
                       inputMode="numeric"
                       autoComplete="tel"
                       placeholder="0501234567"
                       value={phoneQuery}
                       error={phoneError}
                       onChange={event => {
                           setPhoneQuery(event.target.value);
                           setPhoneError("");
                           setNotFound(false);
                       }}/>
                <Button variant="secondary" type="submit" loading={isSearching}>חיפוש</Button>
            </form>

            {notFound && (
                <Banner variant="warn"
                        title="לא נמצא משתמש"
                        text="אין חשבון עם מספר הטלפון הזה."/>
            )}

            <ul className="contacts">
                {CONTACTS.map(contact => (
                    <li key={contact.id}>
                        <button className={busyContactId === contact.id ? "contact is-busy" : "contact"}
                                type="button"
                                disabled={busyContactId !== null}
                                onClick={() => onSelectContact(contact)}>
                            <Avatar id={contact.id} initials={initials(contact.fullName)} size="sm"/>
                            <span className="contact__name u-truncate">{contact.fullName}</span>
                            <span className="contact__hint">
                                {busyContactId === contact.id ? "יוצר שיחה…" : "פתיחת שיחה"}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </Dialog>
    );
}

export default NewChatDialog;
