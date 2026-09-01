import {JSX, useState} from "react";
import Dialog from "../../ui/dialog/Dialog";
import Button from "../../ui/button/Button";
import {Room} from "../../../models/room";

/* DELETE /api/room/{room_id} deletes the room, all its messages, and the
   membership of both participants — permanently, for both of them. See ARCHITECTURE-DECISIONS.md §AD-8. */

interface DeleteRoomDialogProps {
    room: Room;
    onCancel: () => void;
    /* Rejects if the deletion fails — so the dialog knows to stay open and reset the button. */
    onConfirm: (room: Room) => Promise<void>;
}

function DeleteRoomDialog(deleteRoomDialogProps: DeleteRoomDialogProps): JSX.Element {

    const {room, onCancel, onConfirm} = deleteRoomDialogProps;

    const [isDeleting, setDeleting] = useState<boolean>(false);

    async function handleConfirm(): Promise<void> {
        setDeleting(true);
        try {
            await onConfirm(room);
            /* On success the parent removes roomToDelete and the dialog unmounts — nothing to do here. */
        } catch {
            setDeleting(false);
        }
    }

    return (
        <Dialog title="מחיקת השיחה"
                onClose={onCancel}
                isDismissible={!isDeleting}
                actions={<>
                    {/* The destructive button is never first in reading order (DESIGN-SYSTEM §4.7) */}
                    <Button variant="secondary" data-autofocus disabled={isDeleting} onClick={onCancel}>ביטול</Button>
                    <Button variant="danger" loading={isDeleting} onClick={handleConfirm}>מחיקה</Button>
                </>}>
            <p className="dialog__text">
                כל ההודעות בשיחה עם {room.displayName} יימחקו לצמיתות, גם עבור הצד השני.
                אי אפשר לבטל פעולה זו.
            </p>
        </Dialog>
    );
}

export default DeleteRoomDialog;
