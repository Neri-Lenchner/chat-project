import {JSX} from "react";
import {avatarTone} from "../../../utils/avatar";
import "./Avatar.css";

/* Monogram per DESIGN-SYSTEM §4.4: a rounded square with initials, not a circle and not an image.
   The tone is derived from the id so the same contact always gets the same color.
   The formula lives in utils/avatar.ts, identical to ui.js. */

interface AvatarProps {
    id?: number | string;
    initials: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

function Avatar(avatarProps: AvatarProps): JSX.Element {

    const {id, initials, size, className} = avatarProps;

    const tone = avatarTone(id);
    const sizeClass = size && size !== "md" ? `avatar--${size}` : "";
    const classList = ["avatar", sizeClass, tone, className].filter(Boolean).join(" ");

    return (
        <span className={classList} aria-hidden="true">{initials}</span>
    );
}

export default Avatar;
