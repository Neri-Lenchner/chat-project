import axios from "axios";
import {appConfig} from "./app-config";

/* ה-instance היחיד של axios באפליקציה.

   אין interceptor של Authorization ואין טוקן — בשרת אין אימות כלל
   (API SPEC §1). מזהה המשתמש עובר כ-path parameter בכל קריאה שדורשת אותו. */

export const http = axios.create({
    baseURL: appConfig.apiAddress,
    headers: {"Content-Type": "application/json"},
});
