import {JSX, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import {AxiosError} from "axios";
import Icon from "../../ui/icon/Icon";
import Field from "../../ui/field/Field";
import Button from "../../ui/button/Button";
import Banner from "../../ui/banner/Banner";
import {NewUser} from "../../../models/user";
import {ValidationErrorDTO} from "../../../models/api-error";
import {userService} from "../../../services/user-service";
import {UserActionType, userStore} from "../../../state/user-state";
import {toNewUserField} from "../../../utils/mappers";
import "../Auth.css";
/* The preview panel shows a static conversation and so uses the Thread and MessageItem classes.
   Once the components themselves are built at stage 20, they can be rendered here instead of the raw DOM. */
import "../../chat/thread/Thread.css";
import "../../chat/message-item/MessageItem.css";

/* DOM structure copied from docs/DESIGN/register.html — two-panel layout, section 5.1.
   The validation messages are identical word-for-word to RULES in docs/DESIGN/ui.js. */

/* The regex from ui.js, applied to the value after removing spaces and hyphens */
const PHONE_PATTERN = /^0(5\d|[2-4]|[8-9]|7\d)\d{7}$/;

/* On 422 the server returns an English message ("Field required"). It must not be shown
   to the user (DESIGN-SYSTEM §8), and a new wording must not be invented (appendix B), so
   the field is marked with the same approved message that local validation uses. */
const SERVER_FIELD_MESSAGE: Record<keyof NewUser, string> = {
    firstName: "יש למלא שם פרטי",
    lastName: "יש למלא שם משפחה",
    phoneNumber: "מספר הטלפון לא תקין. הפורמט הנדרש: 0501234567",
};

function Register(): JSX.Element {

    const navigate = useNavigate();

    const {register, handleSubmit, formState, setError} = useForm<NewUser>({mode: "onBlur"});

    const [formError, setFormError] = useState<string>("");

    /* Prevents double submission. The button's className comes from formState.isSubmitting,
       but it only updates on the next render — two quick clicks are enough to slip through
       between the click and the render. This lock is synchronous and therefore atomic. */
    const isSubmittingRef = useRef<boolean>(false);

    async function onRegister(newUser: NewUser): Promise<void> {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setFormError("");
        try {
            const user = await userService.register(newUser);
            userStore.dispatch({type: UserActionType.Register, payload: user});
            navigate("/");
        } catch (error) {
            const err = error as AxiosError<ValidationErrorDTO>;

            /* 422: detail is an array. Each item is mapped to its form field
               using loc[loc.length - 1], instead of showing the raw structure to the user. */
            const detail = err.response?.status === 422 ? err.response.data?.detail : undefined;
            if (Array.isArray(detail)) {
                for (const item of detail) {
                    const fieldName = toNewUserField(String(item.loc[item.loc.length - 1]));
                    if (fieldName) {
                        setError(fieldName, {message: SERVER_FIELD_MESSAGE[fieldName]});
                    }
                }
            }

            /* Nothing is saved to Redux or localStorage on failure. */
            setFormError("נסה שוב.");
        } finally {
            isSubmittingRef.current = false;
        }
    }

    return (
        <main className="auth">
            {/* Form side */}
            <section className="auth__form-side">
                <div className="auth__form">
                    <span className="brand auth__brand">
                        <span className="brand__mark"><Icon name="kav"/></span>
                        <span>
                            <span className="brand__name">קו</span>
                            <span className="brand__sub">CHAT</span>
                        </span>
                    </span>

                    <h1 className="auth__title">פתיחת חשבון</h1>
                    <p className="auth__lede">שלושה פרטים וזהו. המספר שתזין הוא גם שם המשתמש שלך.</p>

                    {formError && <Banner variant="error" title="לא ניתן להשלים את ההרשמה" text={formError}/>}

                    <form onSubmit={handleSubmit(onRegister)} noValidate>
                        <div className="form__row">
                            <Field label="שם פרטי"
                                   icon="user"
                                   id="firstName"
                                   type="text"
                                   autoComplete="given-name"
                                   placeholder="ישראל"
                                   error={formState.errors.firstName?.message}
                                   {...register("firstName", {
                                       validate: {
                                           required: value => value.trim().length > 0 || "יש למלא שם פרטי",
                                           name: value => value.trim().length >= 2 || "שם פרטי צריך להכיל שתי אותיות לפחות",
                                       },
                                   })}/>

                            <Field label="שם משפחה"
                                   icon="users"
                                   id="lastName"
                                   type="text"
                                   autoComplete="family-name"
                                   placeholder="ישראלי"
                                   error={formState.errors.lastName?.message}
                                   {...register("lastName", {
                                       validate: {
                                           required: value => value.trim().length > 0 || "יש למלא שם משפחה",
                                           name: value => value.trim().length >= 2 || "שם משפחה צריך להכיל שתי אותיות לפחות",
                                       },
                                   })}/>
                        </div>

                        <Field label="מספר טלפון"
                               icon="phone"
                               className="input--phone"
                               id="phone"
                               type="tel"
                               inputMode="numeric"
                               autoComplete="tel"
                               placeholder="0501234567"
                               hint="אליו יגיעו השיחות שלך."
                               error={formState.errors.phoneNumber?.message}
                               {...register("phoneNumber", {
                                   validate: {
                                       required: value => value.trim().length > 0 || "יש למלא מספר טלפון",
                                       phone: value => PHONE_PATTERN.test(value.replace(/[\s-]/g, ""))
                                           || "מספר הטלפון לא תקין. הפורמט הנדרש: 0501234567",
                                   },
                               })}/>

                        <div className="form__actions">
                            <Button variant="primary"
                                    block
                                    type="submit"
                                    loading={formState.isSubmitting}>
                                יצירת חשבון
                            </Button>
                            <p className="form__alt">כבר יש לך חשבון? <Link to="/login">התחברות</Link></p>
                        </div>
                    </form>
                </div>
            </section>

            {/* Preview panel: the timeline, the system's signature element */}
            <aside className="auth__panel" aria-hidden="true">
                <h2 className="auth__headline">כל שיחה יושבת על <em>קו זמן</em>.</h2>

                <div className="preview">
                    <div className="thread__inner">
                        <div className="day"><span className="day__label">היום</span><span className="day__cap"></span></div>

                        <div className="msg msg--in">
                            <div className="msg__body"><div className="bubble">קבעת כבר את הפגישה של רביעי?</div></div>
                            <div className="msg__time u-num">09:14</div>
                        </div>
                        <div className="msg msg--out">
                            <div className="msg__body"><div className="bubble">כן, 10:30 אצלכם</div></div>
                            <div className="msg__time u-num">09:16</div>
                        </div>
                        <div className="msg msg--in">
                            <div className="msg__body"><div className="bubble">מצוין, נתראה</div></div>
                            <div className="msg__time u-num">09:17</div>
                        </div>
                    </div>
                </div>

                <p className="auth__note">בכל שיחה השעות מיושרות לעמודה אחת, כך שאפשר לקרוא את קצב ההתכתבות בלי לקרוא אותה.</p>
            </aside>
        </main>
    );
}

export default Register;
