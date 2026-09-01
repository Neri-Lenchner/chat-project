import {forwardRef, InputHTMLAttributes, JSX, useId} from "react";
import Icon, {IconName} from "../icon/Icon";
import "./Field.css";

/* Structure per DESIGN-SYSTEM §4.2:
   .field > .field__label + .field__wrap(.input + .field__icon) + .field__hint + .field__error
   The hint and error are always rendered; the CSS switches between them based on .is-invalid.
   forwardRef is required so react-hook-form's {...register()} can connect to the input. */

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
    icon?: IconName;
}

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(fieldProps, ref): JSX.Element {

    const {label, error, hint, icon, className, id, ...restProps} = fieldProps;

    const generatedId = useId();
    const inputId = id ?? generatedId;

    /* .input has a padding-inline-start that makes room for the icon.
       Without an icon, .input--plain is added to reset it. */
    const inputClassList = ["input", icon ? "" : "input--plain", className].filter(Boolean).join(" ");

    return (
        <div className={error ? "field is-invalid" : "field"}>
            <label className="field__label" htmlFor={inputId}>{label}</label>
            <span className="field__wrap">
                <input className={inputClassList}
                       id={inputId}
                       ref={ref}
                       aria-invalid={error ? true : undefined}
                       {...restProps}/>
                {icon && <Icon name={icon} className="field__icon"/>}
            </span>
            {hint && <span className="field__hint">{hint}</span>}
            <span className="field__error">
                <Icon name="alert" size="sm"/>
                <span className="field__error-text">{error}</span>
            </span>
        </div>
    );
});

export default Field;
