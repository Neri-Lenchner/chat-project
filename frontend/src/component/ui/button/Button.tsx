import {ButtonHTMLAttributes, JSX} from "react";
import Icon, {IconName} from "../icon/Icon";
import "./Button.css";

/* The structure is required per DESIGN-SYSTEM §4.1:
   .btn > .btn__spinner.spinner + .btn__label
   The spinner is always rendered; .btn__spinner is hidden in CSS until .is-loading is turned on. */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: "sm" | "md";
    block?: boolean;
    round?: boolean;
    loading?: boolean;
    icon?: IconName;
}

function Button(buttonProps: ButtonProps): JSX.Element {

    const {
        variant = "primary", size, block, round, loading, icon,
        children, className, disabled, type, ...restProps
    } = buttonProps;

    const classList = [
        "btn",
        `btn--${variant}`,
        size === "sm" ? "btn--sm" : "",
        block ? "btn--block" : "",
        round ? "btn--round" : "",
        loading ? "is-loading" : "",
        className,
    ].filter(Boolean).join(" ");

    return (
        <button className={classList}
                type={type ?? "button"}
                disabled={disabled || loading}
                aria-disabled={disabled || loading ? true : undefined}
                {...restProps}>
            <span className="btn__spinner spinner"/>
            {icon && <Icon name={icon} size="sm"/>}
            {children && <span className="btn__label">{children}</span>}
        </button>
    );
}

export default Button;
