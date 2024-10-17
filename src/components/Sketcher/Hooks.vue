import React from "react";
const useMousePosition = () => {
    const [mousePosition, setMousePosition] = React.useState({
        x: 0,
        y: 0,
    });
    React.useEffect(() => {
        const updateMousePosition = (ev: any) => {
            setMousePosition({ x: ev.clientX, y: ev.clientY });
        };
        window.addEventListener("mousemove", updateMousePosition);
        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
        };
    }, []);
    return mousePosition;
};
export default useMousePosition;

import { useState, useEffect } from "react";

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height,
    };
}

export default function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(
        getWindowDimensions()
    );

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowDimensions;
}
