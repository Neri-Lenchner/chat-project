/* Following the docs/front-example/src/utils/app-config.ts pattern.
   In dev, the address is relative and goes through Vite's proxy, because the server doesn't define CORS middleware.
   In prod, the frontend is served from the same origin or talks directly to the server. */

class AppConfig {
}

class DevAppConfig extends AppConfig {
    apiAddress: string = "/api/";
}

class ProdAppConfig extends AppConfig {
    serverAddress = "http://127.0.0.1:8000";
    apiAddress: string = this.serverAddress + "/api/";
}

/* In Vite there's no process.env — environment variables live in import.meta.env. See Appendix D. */
export const appConfig = import.meta.env.PROD ? new ProdAppConfig() : new DevAppConfig();
