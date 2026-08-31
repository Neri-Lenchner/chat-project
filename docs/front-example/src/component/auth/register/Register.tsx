import React, {JSX, useEffect, useState} from 'react';
import './Register.css';
import {useForm} from "react-hook-form";
import {User} from "../../../models/user";
import {authService} from "../../../services/auth-service";
import {useNavigate} from "react-router-dom";
import {Role} from "../../../models/role";
import {roleService} from "../../../services/role-service";

function Register(): JSX.Element {

    const navigate = useNavigate();

    const {register, watch, formState, handleSubmit, reset, setValue} = useForm<User>();

    const [roleList, setRoleList] = useState<Role[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);

    useEffect(() => {

        (async function getRoleList() {
            try {
                const roleList = await roleService.getRoleList();
                setLoading(false);
                setRoleList(roleList);
                console.log(roleList);
            }
            catch (err) {
                console.log(err);
            }

        })();

    }, []);

    async function registerUser(user: User) {
        try {
            await authService.register(user);
            reset();
            // navigate("/courses-list");
        } catch (error) {
            alert(error);
        }
    }

    return (
        <form onSubmit={handleSubmit(registerUser)}>
            <div className="form">
                <h2>Register</h2>
                {isLoading ? <h4>Loading...</h4> :
                    <>
                        <input type="text" placeholder="* First Name" {...register("firstName",
                            {
                                required: {value: true, message: "First Name is required!"},
                                minLength: {value: 2, message: "Must be contain 2 letters."}
                            }
                        )}/>
                        {formState.errors.firstName && <p>{formState.errors.firstName?.message}</p>}
                        <input type="text" placeholder="* Last Name" {...register("lastName",
                            {
                                required: {value: true, message: "Last Name is required!"},
                                minLength: {value: 2, message: "Must be contain 2 letters."}
                            }
                        )}/>
                        {formState.errors.lastName && <p>{formState.errors.lastName?.message}</p>}
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
                        <select {...register("roleId",
                            {
                                required: {value: true, message: "Role is required!"},
                            }
                        )}>
                            {roleList.map((role: Role) => <option value={role.id} key={role.id}>{role.name}</option>)}
                        </select>
                        <button>Register</button>
                    </>
                }
            </div>
        </form>
    );
}

export default Register;
