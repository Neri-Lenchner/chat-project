/* בתבנית של docs/front-example/src/utils/app-config.ts.
   ב-dev הכתובת יחסית ועוברת דרך ה-proxy של Vite, כי השרת אינו מגדיר CORS middleware.
   ב-prod הפרונט מוגש מאותו origin או פונה ישירות לשרת. */

class AppConfig {
}

class DevAppConfig extends AppConfig {
    apiAddress: string = "/api/";
}

class ProdAppConfig extends AppConfig {
    serverAddress = "http://127.0.0.1:8000";
    apiAddress: string = this.serverAddress + "/api/";
}

/* ב-Vite אין process.env — משתני הסביבה יושבים ב-import.meta.env. ראה נספח ד'. */
export const appConfig = import.meta.env.PROD ? new ProdAppConfig() : new DevAppConfig();
