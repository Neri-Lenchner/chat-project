import {JSX, MouseEvent, ReactNode, useEffect, useRef} from "react";
import "./Dialog.css";

/* DESIGN-SYSTEM §4.7 ו-§9:
   role="dialog", aria-modal, סגירה ב-Escape ובלחיצה על ה-scrim,
   והחזרת מיקוד לאלמנט שפתח את הדיאלוג.

   סדר הכפתורים ב-.dialog__actions הוא באחריות הקורא, אבל הכלל קבוע:
   הכפתור ההרסני אף פעם לא ראשון בסדר הקריאה. */

interface DialogProps {
    title: string;
    /* false מונע סגירה ב-Escape ובלחיצה על הרקע, כמו data-dismissible ב-ui.js */
    isDismissible?: boolean;
    isWide?: boolean;
    onClose: () => void;
    children: ReactNode;
    /* .dialog__actions — הכפתורים, בסדר שהקורא קובע */
    actions?: ReactNode;
}

function Dialog(dialogProps: DialogProps): JSX.Element {

    const {title, isDismissible = true, isWide, onClose, children, actions} = dialogProps;

    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        /* האלמנט שהיה במיקוד ברגע הפתיחה — אליו המיקוד חוזר בסגירה */
        const lastFocused = document.activeElement as HTMLElement | null;

        const autofocusTarget = dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]")
            ?? dialogRef.current?.querySelector<HTMLElement>("button, [href], input, select, textarea")
            ?? dialogRef.current;
        autofocusTarget?.focus();

        function onKeyDown(event: KeyboardEvent): void {
            if (event.key === "Escape" && isDismissible) {
                onClose();
            }
        }

        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            lastFocused?.focus();
        };
    }, [isDismissible, onClose]);

    function onScrimMouseDown(event: MouseEvent<HTMLDivElement>): void {
        if (isDismissible && event.target === event.currentTarget) {
            onClose();
        }
    }

    return (
        <div className="scrim" onMouseDown={onScrimMouseDown}>
            <div className={isWide ? "dialog dialog--wide" : "dialog"}
                 role="dialog"
                 aria-modal="true"
                 aria-label={title}
                 tabIndex={-1}
                 ref={dialogRef}>
                <h2 className="dialog__title">{title}</h2>
                {children}
                {actions && <div className="dialog__actions">{actions}</div>}
            </div>
        </div>
    );
}

export default Dialog;
