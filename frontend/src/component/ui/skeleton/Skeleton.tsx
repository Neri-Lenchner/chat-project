import {JSX} from "react";
import "./Skeleton.css";

interface SkeletonProps {
    className?: string;
}

function Skeleton(skeletonProps: SkeletonProps): JSX.Element {

    const className = ["skeleton", skeletonProps.className].filter(Boolean).join(" ");

    return (
        <span className={className} aria-hidden="true"/>
    );
}

export default Skeleton;
