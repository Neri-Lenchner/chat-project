import React, {JSX, useEffect, useRef, useState} from 'react';
import './CourseForm.css';
import {Course} from "../../models/course";
import {courseService} from "../../services/course-service";
import {useForm} from "react-hook-form";
import {useNavigate, useParams} from "react-router-dom";
import {authStore} from "../../state/auth-state";
import {User} from "../../models/user";
import {userService} from "../../services/user-service";
import {RoleId} from "../../models/enums";
import {AxiosError} from "axios";

function CourseForm(): JSX.Element {
    const navigate = useNavigate();

    const [lecturerList, setLecturerList] = useState<User[]>([]);

    const params = useParams();
    const [loading, setLoading] = useState<boolean>(false);
    let courseToUpdate = useRef<Course | undefined>(undefined);

    const {register, watch, formState, handleSubmit, reset, setValue } = useForm<Course>();

    if (authStore.getState().user === null) {
        navigate('/login');
    }

    useEffect(() => {

        (async function getLecturerList() {
            try {
                const userList = await userService.getUserList();
                const lecturerList = userService.filterUserListByRole(RoleId.Lecturer);
                setLoading(false);
                setLecturerList(lecturerList);
            }
            catch (err) {
                console.log(err);
            }

        })();

        async function getSingleCourse() {
            try {
                setLoading(true);
                courseToUpdate.current = await courseService.getSingleCourse(+params.id!);
                setValue("name", courseToUpdate.current.name);
                setValue("duration", courseToUpdate.current.duration);
                setValue("difficulty", courseToUpdate.current.difficulty);
                setValue("numOfStudents", courseToUpdate.current.numOfStudents);
                setValue("lecturerId", courseToUpdate.current.lecturerId);
                setLoading(false);
            }
            catch (err) {
                alert(err)
            }
        }

        if (params.id) {
            getSingleCourse();
        }


    }, []);

    async function addCourse(course: Course) {
        const lecturer: User = lecturerList.find(lecturer => lecturer.id === +course.lecturerId)!;
        course.lecturerName = lecturer.firstName + " " + lecturer.lastName;
        try {
            if (params.id) {
                course.id = courseToUpdate!.current!.id;
                await courseService.updateCourse(course);
            }
            else {
                await courseService.addCourse(course);
            }
            reset();
            // navigate("/courses-list");
        }
        catch (error) {
            console.log(error)
            const myErr = error as AxiosError;
            alert((myErr.response?.data as any)?.error);
        }
    }

    return (
        <form onSubmit={handleSubmit(addCourse)}>
            {loading ? <p>Loading...</p> :
            <div className="form">
                <h2>{params.id ? "Update Course" : "Add New Course"}</h2>
                <input type="text" placeholder="* Name" {...register("name",
                    {
                        required: {value: true, message: "Name is required!"},
                        minLength: {value: 2, message: "Must br contain 2 letters."}
                    }
                )}/>
                {formState.errors.name && <p>{formState.errors.name?.message}</p>}
                <input type="number" placeholder="* Duration" {...register("duration",
                    {
                        required: {value: true, message: "Duration is required!"},
                        min: {value: 1, message: "Minimum: 1"},
                        max: {value: 14, message: "Maximum: 14"}
                    })} />
                {formState.errors.duration && <p>{formState.errors.duration?.message}</p>}
                <input type="number" placeholder="* Difficulty" {...register("difficulty",
                    {
                        required: {value: true, message: "Difficulty is required!"},
                        min: {value: 1, message: "Minimum: 1"},
                        max: {value: 10, message: "Maximum: 10"}
                    }
                )}/>
                {formState.errors.difficulty && <p>{formState.errors.difficulty?.message}</p>}
                <input type="number" placeholder="* Number of Students" {...register("numOfStudents",
                    {
                        required: {value: true, message: "Number of Students is required!"},
                        min: {value: 1, message: "Minimum: 1"},
                    }
                )}/>
                {formState.errors.numOfStudents && <p>{formState.errors.numOfStudents?.message}</p>}
                <select {...register("lecturerId",
                    {
                        required: {value: true, message: "Lecturer is required!"},
                    }
                )}>
                    {lecturerList.map((lecture: User) => <option value={lecture.id} key={lecture.id}>{lecture.firstName + " " + lecture.lastName }</option>)}
                </select>
                <input type="file" {...register("image")}/>
                <button>{params.id ? "Update Course" : "Add Course"}</button>
            </div>
            }
        </form>
    );
}

export default CourseForm;
