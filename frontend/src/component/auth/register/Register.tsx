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
/* פאנל התצוגה מציג שיחה סטטית ולכן משתמש במחלקות של Thread ו-MessageItem.
   כשהרכיבים עצמם ייבנו בשלב 20 אפשר יהיה לרנדר אותם כאן במקום את ה-DOM הגולמי. */
import "../../chat/thread/Thread.css";
import "../../chat/message-item/MessageItem.css";

/* מבנה ה-DOM מועתק מ-docs/DESIGN/register.html — פריסה דו-פאנלית, סעיף 5.1.
   הודעות הוולידציה זהות מילה במילה ל-RULES ב-docs/DESIGN/ui.js. */

/* הרג'קס מ-ui.js, על הערך אחרי הסרת רווחים ומקפים */
const PHONE_PATTERN = /^0(5\d|[2-4]|[8-9]|7\d)\d{7}$/;

/* השרת מחזיר ב-422 הודעה באנגלית ("Field required"). אסור להציג אותה
   למשתמש (DESIGN-SYSTEM §8), ואסור להמציא נוסח חדש (נספח ב'), ולכן
   השדה מסומן עם אותה הודעה מאושרת שהוולידציה המקומית משתמשת בה. */
const SERVER_FIELD_MESSAGE: Record<keyof NewUser, string> = {
    firstName: "יש למלא שם פרטי",
    lastName: "יש למלא שם משפחה",
    phoneNumber: "מספר הטלפון לא תקין. הפורמט הנדרש: 0501234567",
};

function Register(): JSX.Element {

    const navigate = useNavigate();

    const {register, handleSubmit, formState, setError} = useForm<NewUser>({mode: "onBlur"});

    const [formError, setFormError] = useState<string>("");

    /* מניעת שליחה כפולה. ה-className של הכפתור מגיע מ-formState.isSubmitting,
       אבל הוא מתעדכן רק ברינדור הבא — שתי לחיצות מהירות מספיקות כדי לחמוק
       בין הלחיצה לרינדור. הנעילה הזו סינכרונית ולכן אטומה. */
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

            /* 422: detail הוא מערך. ממפים כל פריט לשדה שלו בטופס
               לפי loc[loc.length - 1] במקום להציג את המבנה למשתמש. */
            const detail = err.response?.status === 422 ? err.response.data?.detail : undefined;
            if (Array.isArray(detail)) {
                for (const item of detail) {
                    const fieldName = toNewUserField(String(item.loc[item.loc.length - 1]));
                    if (fieldName) {
                        setError(fieldName, {message: SERVER_FIELD_MESSAGE[fieldName]});
                    }
                }
            }

            /* לא נשמר דבר ב-Redux ולא ב-localStorage בכישלון. */
            setFormError("נסה שוב.");
        } finally {
            isSubmittingRef.current = false;
        }
    }

    return (
        <main className="auth">
            {/* צד הטופס */}
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

            {/* פאנל התצוגה: פס הזמן, האלמנט החתימתי של המערכת */}
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
