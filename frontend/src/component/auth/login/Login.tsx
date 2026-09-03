import {JSX, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import {AxiosError} from "axios";
import Icon from "../../ui/icon/Icon";
import Field from "../../ui/field/Field";
import Button from "../../ui/button/Button";
import Banner from "../../ui/banner/Banner";
import {Credentials} from "../../../models/user";
import {userService} from "../../../services/user-service";
import {UserActionType, userStore} from "../../../state/user-state";
import "../Auth.css";
/* The preview panel shows a static conversation and so uses the Thread and MessageItem classes.
   Once the components themselves are built at stage 20, they can be rendered here instead of the raw DOM. */
import "../../chat/thread/Thread.css";
import "../../chat/message-item/MessageItem.css";

/* DOM structure copied from docs/DESIGN/login.html.
   The validation message is identical word-for-word to RULES in docs/DESIGN/ui.js. */

const PHONE_PATTERN = /^0(5\d|[2-4]|[8-9]|7\d)\d{7}$/;

/* Screen-level banner shown on submit failure. Two shapes: a 404 (phone not registered) links
   to the registration screen; anything else (network/5xx) is a plain "try again". */
interface LoginBanner {
    title: string;
    text: string;
    withRegisterAction: boolean;
}

function Login(): JSX.Element {

    const navigate = useNavigate();

    const {register, handleSubmit, formState, setError} = useForm<Credentials>({mode: "onBlur"});

    const [banner, setBanner] = useState<LoginBanner | null>(null);

    /* Same double-submission guard as Register.tsx — see the comment there. */
    const isSubmittingRef = useRef<boolean>(false);

    async function onLogin(credentials: Credentials): Promise<void> {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setBanner(null);
        try {
            const authResult = await userService.login(credentials);
            userStore.dispatch({type: UserActionType.Login, payload: authResult});
            navigate("/");
        } catch (error) {
            const err = error as AxiosError;
            if (err.response?.status === 404) {
                setBanner({
                    title: "מספר הטלפון לא נמצא",
                    text: "לא קיים חשבון עם המספר הזה. אפשר להירשם איתו במסך ההרשמה.",
                    withRegisterAction: true,
                });
            } else if (err.response?.status === 422) {
                /* Same approved wording as Register.tsx's SERVER_FIELD_MESSAGE.phoneNumber. */
                setError("phoneNumber", {message: "מספר הטלפון לא תקין. הפורמט הנדרש: 0501234567"});
            } else {
                setBanner({title: "לא ניתן להתחבר", text: "נסה שוב.", withRegisterAction: false});
            }
        } finally {
            isSubmittingRef.current = false;
        }
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

                    {banner && (
                        <Banner variant="error"
                                title={banner.title}
                                text={banner.text}
                                actionLabel={banner.withRegisterAction ? "מעבר להרשמה" : undefined}
                                onAction={banner.withRegisterAction ? () => navigate("/register") : undefined}/>
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
                            <Button variant="primary"
                                    block
                                    type="submit"
                                    loading={formState.isSubmitting}>
                                כניסה
                            </Button>
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
