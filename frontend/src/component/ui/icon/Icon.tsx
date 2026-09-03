import {JSX} from "react";
import "./Icon.css";

/* The "Kav" icon set — a conversion of docs/DESIGN/icons.js.
   Same keys and exactly the same paths. 1.75 stroke, rounded corners, 24 square.
   The structure of the svg is taken from the iconMarkup function in docs/DESIGN/icons.js:
   width, height, stroke and fill come from the .icon class in Icon.css, not from attributes. */

const ICONS = {
    /* The brand mark — a vertical line with a time dot, the same timeline motif as in the conversation screen */
    kav: '<path d="M9 3.5v17"/><circle cx="9" cy="8.5" r="2.1" fill="currentColor" stroke="none"/><path d="M13.2 8.5h5"/><circle cx="9" cy="15.5" r="2.1" fill="currentColor" stroke="none"/><path d="M13.2 15.5h3.4"/>',

    send: '<path d="M4.5 12h13"/><path d="M20 12 4.6 18.4l2.4-6.4-2.4-6.4z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',
    more: '<circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 8l-4 4 4 4"/><path d="M6 12h10"/>',
    back: '<path d="M5 12h14"/><path d="M13 5l7 7-7 7"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.7-3.6 3.5-5.4 7-5.4s6.3 1.8 7 5.4"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19c.6-3.2 3-4.8 6-4.8s5.4 1.6 6 4.8"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.9"/><path d="M18 14.5c2 .7 3.2 2.2 3.5 4.5"/>',
    phone: '<path d="M7 3.8h3l1.4 3.6-2 1.5a11 11 0 0 0 5.7 5.7l1.5-2 3.6 1.4v3a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 3.8 6a2 2 0 0 1 2-2.2Z"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.6v5"/><circle cx="12" cy="16.2" r="1" fill="currentColor" stroke="none"/>',
    chat: '<path d="M20 14.5A2.5 2.5 0 0 1 17.5 17H8l-4 3.5v-14A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5Z"/><path d="M8.5 9.5h7M8.5 12.5h4"/>',
    newchat: '<path d="M20 12.4v2.1a2.5 2.5 0 0 1-2.5 2.5H8l-4 3.5v-14A2.5 2.5 0 0 1 6.5 4h5.2"/><path d="M17.5 3.5v6M14.5 6.5h6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    checkDouble: '<path d="M2 12.5l4.5 4.5L15 8"/><path d="M8 12.5l4.5 4.5L22 8"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    chevron: '<path d="M6 9.5l6 6 6-6"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.7-6"/><path d="M20 4.5V10h-5.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.4 2"/>',
    shield: '<path d="M12 3.5l7 2.7v5.3c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6.2Z"/><path d="M9 12.2l2.2 2.2 4-4.2"/>',
    spark: '<path d="M12 4v4M12 16v4M4 12h4M16 12h4"/><circle cx="12" cy="12" r="2.6"/>',
};

export type IconName = keyof typeof ICONS;

interface IconProps {
    name: IconName;
    size?: "sm" | "md" | "lg";
    className?: string;
}

function Icon(iconProps: IconProps): JSX.Element {

    /* "md" is the default size of .icon and has no modifier class,
       exactly like in mountIcons, which adds a class only when data-icon-size is present. */
    const sizeClass = iconProps.size && iconProps.size !== "md" ? `icon--${iconProps.size}` : "";
    const className = ["icon", sizeClass, iconProps.className].filter(Boolean).join(" ");

    return (
        <svg className={className}
             viewBox="0 0 24 24"
             aria-hidden="true"
             focusable="false"
             dangerouslySetInnerHTML={{__html: ICONS[iconProps.name]}}/>
    );
}

export default Icon;
export {ICONS};
