"use client"

import { useState, useEffect } from "react";

function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 765);
        };

        // Set the initial value after the component mounts
        handleResize();

        window.addEventListener("resize", handleResize);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return isMobile;
}

export default useIsMobile;
