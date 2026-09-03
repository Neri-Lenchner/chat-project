import ReactDOM from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import "./styles/tokens.css";
import "./styles/base.css";
import App from "./App";
import {messageSocketService} from "./services/message-socket-service";

/* Started here, once, rather than from a store constructor (state/message-state.ts) —
   the store modules are entangled in import cycles with each other, and connecting there
   read userStore before its own module had finished initializing ("Cannot access
   'userStore' before initialization"). By the time main.tsx runs, every module is resolved. */
messageSocketService.listenForNewMessages();

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <BrowserRouter>
        <App/>
    </BrowserRouter>
);
