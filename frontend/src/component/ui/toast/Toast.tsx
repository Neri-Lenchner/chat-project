import {JSX} from "react";
import Icon from "../icon/Icon";
import "./Toast.css";

/* The container and the item. The management itself — an array in AppShell's state and a showToast
   function passed down via props — so that no library or Context is required.

   3.2 seconds, like toast() in docs/DESIGN/ui.js. */

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
