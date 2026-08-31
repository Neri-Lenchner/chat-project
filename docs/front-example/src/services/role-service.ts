import axios from "axios";
import {appConfig} from "../utils/app-config";
import {authStore} from "../state/auth-state";
import {Role} from "../models/role";

class RoleService {

    isFetched: boolean = false;

    public async getRoleList(forceFetch: boolean = false): Promise<Role[]> {
        //if (!this.isFetched || forceFetch) {
            try {
                const response = await axios.get<Role[]>(appConfig.apiAddress + "role", {headers: {Authorization: "Bearer " + authStore.getState().token }});
                //this.isFetched = true;
                return response.data;
            } catch (err) {
                console.error("Error from getCourseList");
                throw err;
            }
        }
        //return courseStore.getState().courseList;
    //}
}

export const roleService = new RoleService();
