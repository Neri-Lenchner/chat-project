import {JSX} from "react";
import "./Spinner.css";

interface SpinnerProps {
    size?: "md" | "lg";
    className?: string;
}

function Spinner(spinnerProps: SpinnerProps): JSX.Element {

    const sizeClass = spinnerProps.size === "lg" ? "spinner--lg" : "";
    const className = ["spinner", sizeClass, spinnerProps.className].filter(Boolean).join(" ");

    return (
        <span className={className} aria-hidden="true"/>
    );
}

export default Spinner;
