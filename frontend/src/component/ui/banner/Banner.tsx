import {JSX} from "react";
import Icon, {IconName} from "../icon/Icon";
import Button from "../button/Button";
import "./Banner.css";

/* Screen-level status message per DESIGN-SYSTEM §4.3. Always role="alert". */

export type BannerVariant = "default" | "error" | "warn";

interface BannerProps {
    title: string;
    text?: string;
    variant?: BannerVariant;
    icon?: IconName;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

function Banner(bannerProps: BannerProps): JSX.Element {

    const {title, text, variant = "error", icon = "alert", actionLabel, onAction, className} = bannerProps;

    const classList = [
        "banner",
        variant === "default" ? "" : `banner--${variant}`,
        className,
    ].filter(Boolean).join(" ");

    return (
        <div className={classList} role="alert">
            <Icon name={icon}/>
            <span className="banner__body">
                <strong className="banner__title">{title}</strong>
                {text && <span className="banner__text">{text}</span>}
            </span>
            {actionLabel && (
                <Button variant="secondary" size="sm" onClick={onAction}>{actionLabel}</Button>
            )}
        </div>
    );
}

export default Banner;
