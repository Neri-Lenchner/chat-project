import {JSX} from "react";
import Dialog from "../../ui/dialog/Dialog";
import Button from "../../ui/button/Button";
import {Room} from "../../../models/room";

/* TODO-2: אין DELETE /api/room/{id} בשרת. ראה TASKS-FRONT.md §4
   הדיאלוג אומר את זה למשתמש במפורש במקום להבטיח מחיקה שלא קורית. */

interface DeleteRoomDialogProps {
    room: Room;
    onCancel: () => void;
    onConfirm: (room: Room) => void;
}

function DeleteRoomDialog(deleteRoomDialogProps: DeleteRoomDialogProps): JSX.Element {

    const {room, onCancel, onConfirm} = deleteRoomDialogProps;

    return (
        <Dialog title="מחיקת השיחה"
                onClose={onCancel}
                actions={<>
                    {/* הכפתור ההרסני אף פעם לא ראשון בסדר הקריאה (DESIGN-SYSTEM §4.7) */}
                    <Button variant="secondary" data-autofocus onClick={onCancel}>ביטול</Button>
                    <Button variant="danger" onClick={() => onConfirm(room)}>מחיקה</Button>
                </>}>
            <p className="dialog__text">
                השיחה עם {room.displayName} תוסתר מהמכשיר הזה.
                השרת עדיין לא תומך במחיקה, ולכן היא לא תימחק עבור הצד השני.
            </p>
        </Dialog>
    );
}

export default DeleteRoomDialog;
