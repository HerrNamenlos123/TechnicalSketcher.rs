import React from "react";
import ReactDOM from "react-dom/client";
import Tsk from "./Tsk/Tsk";
import "./index.css";
import "./fonts/index.css";
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <Tsk />
    </React.StrictMode>
);
