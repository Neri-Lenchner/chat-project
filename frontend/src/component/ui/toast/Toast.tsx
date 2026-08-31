import {JSX} from "react";
import Icon from "../icon/Icon";
import "./Toast.css";

/* המכל והפריט. הניהול עצמו — מערך ב-state של AppShell ופונקציית showToast
   שעוברת למטה ב-props — כדי שלא תידרש ספרייה או Context.

   3.2 שניות, כמו toast() ב-docs/DESIGN/ui.js. */

export const TOAST_DURATION_MS = 3200;

export type ToastVariant = "default" | "error";

export class ToastMessage {

    constructor(public id: number,
                public text: string,
                public variant: ToastVariant = "default") {
    }
}

interface ToastListProps {
    toastList: ToastMessage[];
}

function ToastList(toastListProps: ToastListProps): JSX.Element {

    if (toastListProps.toastList.length === 0) return (<></>);

    return (
        <div className="toasts">
            {toastListProps.toastList.map(toast => (
                <div className={toast.variant === "error" ? "toast toast--error" : "toast"}
                     role="status"
                     key={toast.id}>
                    <Icon name={toast.variant === "error" ? "alert" : "check"} size="sm"/>
                    <span>{toast.text}</span>
                </div>
            ))}
        </div>
    );
}

export default ToastList;
