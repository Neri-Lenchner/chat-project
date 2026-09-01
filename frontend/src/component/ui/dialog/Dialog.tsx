import {JSX, MouseEvent, ReactNode, useEffect, useRef} from "react";
import Button from "../button/Button";
import "./Dialog.css";

/* DESIGN-SYSTEM §4.7 and §9:
   role="dialog", aria-modal, closing on Escape and on clicking the scrim,
   and returning focus to the element that opened the dialog.

   The order of the buttons in .dialog__actions is the caller's responsibility, but the rule is fixed:
   the destructive button is never first in reading order. */

interface DialogProps {
    title: string;
    /* Changes the structure: title + short explanation + close button (X), like .dialog__head
       in docs/DESIGN/new-chat.html. Without it, a plain title remains. */
    subtitle?: string;
    showCloseButton?: boolean;
    /* false prevents closing on Escape and on clicking the backdrop, like data-dismissible in ui.js */
    isDismissible?: boolean;
    isWide?: boolean;
    onClose: () => void;
    children: ReactNode;
    /* .dialog__actions — the buttons, in the order the caller decides */
    actions?: ReactNode;
}

function Dialog(dialogProps: DialogProps): JSX.Element {

    const {title, subtitle, showCloseButton, isDismissible = true, isWide, onClose, children, actions} = dialogProps;

    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        /* The element that had focus at the moment of opening — focus returns to it on close */
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
                {showCloseButton ? (
                    <div className="dialog__head">
                        <div>
                            <h2 className="dialog__title">{title}</h2>
                            {subtitle && <p className="dialog__text u-faint">{subtitle}</p>}
                        </div>
                        <Button variant="icon" icon="x" aria-label="סגירה" onClick={onClose}/>
                    </div>
                ) : (
                    <h2 className="dialog__title">{title}</h2>
                )}
                {children}
                {actions && <div className="dialog__actions">{actions}</div>}
            </div>
        </div>
    );
}

export default Dialog;
