import {JSX, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import Icon from "../../ui/icon/Icon";
import Field from "../../ui/field/Field";
import Button from "../../ui/button/Button";
import Banner from "../../ui/banner/Banner";
import {Credentials} from "../../../models/user";
import "../Auth.css";
/* The preview panel shows a static conversation and so uses the Thread and MessageItem classes.
   Once the components themselves are built at stage 20, they can be rendered here instead of the raw DOM. */
import "../../chat/thread/Thread.css";
import "../../chat/message-item/MessageItem.css";

/* DOM structure copied from docs/DESIGN/login.html.
   The validation message is identical word-for-word to RULES in docs/DESIGN/ui.js. */

const PHONE_PATTERN = /^0(5\d|[2-4]|[8-9]|7\d)\d{7}$/;

function Login(): JSX.Element {

    const navigate = useNavigate();

    const {register, handleSubmit, formState} = useForm<Credentials>({mode: "onBlur"});

    const [isBlocked, setBlocked] = useState<boolean>(false);

    /* TODO-1: there's no POST /api/user/login on the server. See TASKS-FRONT.md §4
       The screen is fully built, but on submit there is no and will be no server call — only an
       explanation to the user and a link to the registration screen, which is currently the only way in. */
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
