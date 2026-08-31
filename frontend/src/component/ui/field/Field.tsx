import {forwardRef, InputHTMLAttributes, JSX, useId} from "react";
import Icon, {IconName} from "../icon/Icon";
import "./Field.css";

/* מבנה לפי DESIGN-SYSTEM §4.2:
   .field > .field__label + .field__wrap(.input + .field__icon) + .field__hint + .field__error
   ה-hint וה-error מרונדרים תמיד; ה-CSS מחליף ביניהם לפי .is-invalid.
   forwardRef נדרש כדי ש-{...register()} של react-hook-form יתחבר לקלט. */

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

    /* ל-.input יש padding-inline-start שמפנה מקום לאייקון.
       בלי אייקון מוסיפים .input--plain שמאפס אותו. */
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
