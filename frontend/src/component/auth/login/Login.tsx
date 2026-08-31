import {JSX, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import Icon from "../../ui/icon/Icon";
import Field from "../../ui/field/Field";
import Button from "../../ui/button/Button";
import Banner from "../../ui/banner/Banner";
import {Credentials} from "../../../models/user";
import "../Auth.css";
/* פאנל התצוגה מציג שיחה סטטית ולכן משתמש במחלקות של Thread ו-MessageItem.
   כשהרכיבים עצמם ייבנו בשלב 20 אפשר יהיה לרנדר אותם כאן במקום את ה-DOM הגולמי. */
import "../../chat/thread/Thread.css";
import "../../chat/message-item/MessageItem.css";

/* מבנה ה-DOM מועתק מ-docs/DESIGN/login.html.
   הודעת הוולידציה זהה מילה במילה ל-RULES ב-docs/DESIGN/ui.js. */

const PHONE_PATTERN = /^0(5\d|[2-4]|[8-9]|7\d)\d{7}$/;

function Login(): JSX.Element {

    const navigate = useNavigate();

    const {register, handleSubmit, formState} = useForm<Credentials>({mode: "onBlur"});

    const [isBlocked, setBlocked] = useState<boolean>(false);

    /* TODO-1: אין POST /api/user/login בשרת. ראה TASKS-FRONT.md §4
       המסך נבנה במלואו, אבל בשליחה אין ולא תהיה קריאת שרת — רק הסבר
       כן למשתמש וקישור למסך ההרשמה, שהוא הדרך היחידה להיכנס כרגע. */
    function onLogin(): void {
        setBlocked(true);
    }

    return (
        <main className="auth">
            <section className="auth__form-side">
                <div className="auth__form">
                    <span className="brand auth__brand">
                        <span className="brand__mark"><Icon name="kav"/></span>
                        <span>
                            <span className="brand__name">קו</span>
                            <span className="brand__sub">CHAT</span>
                        </span>
                    </span>

                    <h1 className="auth__title">התחברות</h1>
                    <p className="auth__lede">הזן את המספר שאיתו נרשמת.</p>

                    {isBlocked && (
                        <Banner variant="error"
                                title="התחברות אינה זמינה כרגע"
                                text="השרת עדיין לא תומך בהתחברות לפי מספר טלפון. אפשר להיכנס דרך מסך ההרשמה."
                                actionLabel="מעבר להרשמה"
                                onAction={() => navigate("/register")}/>
                    )}

                    <form onSubmit={handleSubmit(onLogin)} noValidate>
                        <Field label="מספר טלפון"
                               icon="phone"
                               className="input--phone"
                               id="phone"
                               type="tel"
                               inputMode="numeric"
                               autoComplete="tel"
                               placeholder="0501234567"
                               error={formState.errors.phoneNumber?.message}
                               {...register("phoneNumber", {
                                   validate: {
                                       required: value => value.trim().length > 0 || "יש למלא מספר טלפון",
                                       phone: value => PHONE_PATTERN.test(value.replace(/[\s-]/g, ""))
                                           || "מספר הטלפון לא תקין. הפורמט הנדרש: 0501234567",
                                   },
                               })}/>

                        <div className="form__actions">
                            <Button variant="primary" block type="submit">כניסה</Button>
                            <p className="form__alt">אין לך עדיין חשבון? <Link to="/register">הרשמה</Link></p>
                        </div>
                    </form>
                </div>
            </section>

            <aside className="auth__panel" aria-hidden="true">
                <h2 className="auth__headline">המספר שלך הוא <em>הכניסה</em>.</h2>

                <div className="preview">
                    <div className="thread__inner">
                        <div className="day"><span className="day__label">אתמול</span><span className="day__cap"></span></div>
                        <div className="msg msg--out">
                            <div className="msg__body"><div className="bubble">שלחתי לך עכשיו את הכל</div></div>
                            <div className="msg__time u-num">18:02</div>
                        </div>
                        <div className="msg msg--in">
                            <div className="msg__body"><div className="bubble">קיבלתי, תודה</div></div>
                            <div className="msg__time u-num">18:30</div>
                        </div>
                    </div>
                </div>

                <p className="auth__note">אין סיסמאות ואין שמות משתמש. השיחות שלך נטענות לפי המספר.</p>
            </aside>
        </main>
    );
}

export default Login;
