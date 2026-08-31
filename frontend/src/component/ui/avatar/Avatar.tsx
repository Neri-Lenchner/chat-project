import {JSX} from "react";
import {avatarTone} from "../../../utils/avatar";
import "./Avatar.css";

/* מונוגרמה לפי DESIGN-SYSTEM §4.4: ריבוע מעוגל עם ראשי תיבות, לא עיגול ולא תמונה.
   הגוון נגזר מהמזהה כדי שאותו איש קשר יקבל תמיד את אותו צבע.
   הנוסחה יושבת ב-utils/avatar.ts, זהה ל-ui.js. */

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
