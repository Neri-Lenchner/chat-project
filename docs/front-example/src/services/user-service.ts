import axios from "axios";
import {appConfig} from "../utils/app-config";
import {authStore} from "../state/auth-state";
import {User} from "../models/user";
import {CourseActionType, courseStore} from "../state/course-state";
import {UserActionType, userStore} from "../state/user-state";
import {RoleId} from "../models/enums";
import {CourseStudent} from "../models/course-student";

class UserService {

    isFetched: boolean = false;

    public async getUserListByRole(roleId: number): Promise<User[]> {
        try {
            const response = await axios.get<User[]>(appConfig.apiAddress + "user/role/" + roleId, {headers: {Authorization: "Bearer " + authStore.getState().token}});
            return response.data;
        } catch (err) {
            console.error("Error from getUserList");
            throw err;
        }
    }

    public async getUserList(forceFetch: boolean = false): Promise<User[]> {
        if (!this.isFetched || forceFetch) {
            try {
                const response = await axios.get<User[]>(appConfig.apiAddress + "user/", {headers: {Authorization: "Bearer " + authStore.getState().token}});
                userStore.dispatch({type: UserActionType.GetUserList, payload: response.data});
            } catch (err) {
                console.error("Error from getUserList");
                throw err;
            }
        }
        return userStore.getState().userList;
    }

    public filterUserListByRole(roleId: RoleId) {
        return userStore.getState().userList.filter(user => user.roleId === roleId);
    }

    public filterUserListByName(name: string, roleId: number) {
        return userStore.getState().userList.filter(user => user.roleId === roleId).filter(user => {
            const fullName = user.firstName + " " + user.lastName;
            return fullName.toLowerCase().includes(name.toLowerCase());
        });
    }
}

export const userService = new UserService();
