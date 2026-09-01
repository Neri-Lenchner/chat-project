import {JSX} from "react";
import Icon, {IconName} from "../icon/Icon";
import Button from "../button/Button";
import "./Empty.css";

/* Empty state — DESIGN-SYSTEM §7. A framed icon, title, explanation, and one action button. */

interface EmptyProps {
    icon: IconName;
    title: string;
    text?: string;
    actionLabel?: string;
    actionIcon?: IconName;
    onAction?: () => void;
    className?: string;
}

function Empty(emptyProps: EmptyProps): JSX.Element {

    const {icon, title, text, actionLabel, actionIcon, onAction, className} = emptyProps;

    const classList = ["empty", className].filter(Boolean).join(" ");

    return (
        <div className={classList}>
            <span className="empty__mark"><Icon name={icon} size="lg"/></span>
            <h2 className="empty__title">{title}</h2>
            {text && <p className="empty__text">{text}</p>}
            {actionLabel && (
                <Button variant="primary" icon={actionIcon} onClick={onAction}>{actionLabel}</Button>
            )}
        </div>
    );
}

export default Empty;
