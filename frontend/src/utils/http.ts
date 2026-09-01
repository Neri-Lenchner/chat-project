import axios from "axios";
import {appConfig} from "./app-config";

/* The single axios instance in the app.

   There's no Authorization interceptor and no token — the server has no authentication at all
   (API SPEC §1). The user id is passed as a path parameter in every call that requires it. */

export const http = axios.create({
    baseURL: appConfig.apiAddress,
    headers: {"Content-Type": "application/json"},
});
