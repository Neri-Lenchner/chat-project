import React, {JSX} from 'react';
import './Login.css';
import {useForm} from "react-hook-form";
import {authService} from "../../../services/auth-service";
import {useNavigate} from "react-router-dom";
import {Credentials} from "../../../models/credentials";
import {AxiosError} from "axios";

function Login(): JSX.Element {

    const navigate = useNavigate();

    const {register, watch, formState, handleSubmit, reset, setValue } = useForm<Credentials>();

    async function login(credentials: Credentials) {
        try {
            await authService.login(credentials);
            reset();
            navigate("/courses-list");
        }
        catch (error) {
            const err = error as AxiosError;
            if (err.status === 401) {
                alert("Email or password incorrect");
            }
            else {
                alert("Error, try again later.");
            }
        }
    }

    return (
        <form onSubmit={handleSubmit(login)}>
            <div className="form">
                <h2>Login</h2>
                <input type="email" placeholder="* Email" {...register("email",
                    {
                        required: {value: true, message: "Email is required!"},
                    }
                )}/>
                {formState.errors.email && <p>{formState.errors.email?.message}</p>}
                <input type="password" placeholder="* Password" {...register("password",
                    {
                        required: {value: true, message: "Password is required!"},
                        minLength: {value: 6, message: "Must be contain 6 letters."}
                    }
                )}/>
                {formState.errors.password && <p>{formState.errors.password?.message}</p>}
                <button>Login</button>
            </div>
        </form>
    );
}

export default Login;
