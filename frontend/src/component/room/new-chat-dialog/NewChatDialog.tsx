import {JSX, useState} from "react";
import {useNavigate} from "react-router-dom";
import Dialog from "../../ui/dialog/Dialog";
import Avatar from "../../ui/avatar/Avatar";
import {User} from "../../../models/user";
import {CONTACTS} from "../../../data/contacts";
import {roomService} from "../../../services/room-service";
import {initials} from "../../../utils/avatar";
import {ShowToast} from "../../layout/app-shell/AppShell";
import "./NewChatDialog.css";

/* DOM from docs/DESIGN/new-chat.html, creation logic from screens.js §initNewChat,
   with one change: failure is shown as a toast rather than a banner inside the dialog,
   per TASKS-FRONT.md stage 18 section 3.

   Duplicate prevention (an existing room with the same contact) is handled inside
   roomService.getOrCreateRoom — not here. */

interface NewChatDialogProps {
    onClose: () => void;
    showToast: ShowToast;
}

function NewChatDialog(newChatDialogProps: NewChatDialogProps): JSX.Element {

    const {onClose, showToast} = newChatDialogProps;
    const navigate = useNavigate();

    const [busyContactId, setBusyContactId] = useState<number | null>(null);

    async function onSelectContact(contact: User): Promise<void> {
        if (busyContactId !== null) return;
        setBusyContactId(contact.id);
        try {
            /* If a room with this contact already exists — getOrCreateRoom returns it
               without a server call. Otherwise the list isn't re-fetched with GET: the room returned
               from the server is added directly to roomStore inside roomService.createRoom. */
            const room = await roomService.getOrCreateRoom(contact.fullName, contact);
            navigate("/chat/" + room.id);
            onClose();
        } catch {
            setBusyContactId(null);
            showToast("לא ניתן ליצור את השיחה. נסה שוב.", "error");
        }
    }

    return (
        <Dialog title="שיחה חדשה"
                subtitle="בחר איש קשר כדי לפתוח שיחה."
                isWide
                showCloseButton
                onClose={onClose}>
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
