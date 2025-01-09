import { QueryClient } from "@tanstack/react-query";
import cookie from "js-cookie";
import toast from "react-hot-toast";

const queryClient = new QueryClient();

// Set in cookie
export const setCookie = (key: string, value: string, days: number = 300): void => {
    if (typeof window !== "undefined") {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000); // Set expiration time to `days` from now

        cookie.set(key, value, {
            expires: expires, // Set expiration date
            secure: process.env.NODE_ENV === "production", // Only set secure flag in production
            path: "/", // Make cookie available site-wide
        });
    }
};

// Remove from cookie
export const removeCookie = (key: string): void => {
    if (typeof window !== "undefined") {
        cookie.remove(key);
    }
};

// Get from cookie
export const getCookie = (key: string): string | undefined => {
    return getCookieFromBrowser(key);
};

export const getCookieFromBrowser = (key: string): string | undefined => {
    return cookie.get(key);
};

export const getCookieFromServer = (key: string, req: { headers: { cookie?: string } }): string | undefined => {
    if (!req.headers.cookie) {
        return undefined;
    }
    const token = req.headers.cookie
        .split(";")
        .find((c) => c.trim().startsWith(`${key}=`));
    if (!token) {
        return undefined;
    }
    const tokenValue = token.split("=")[1];
    return tokenValue;
};

// Set in local storage
export const setLocalStorage = (key: string, value: unknown): void => {
    if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// Get from local storage
export const getLocalStorage = (key: string): unknown | false => {
    if (typeof window !== "undefined") {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : false;
    }
    return false;
};

// Remove from local storage
export const removeLocalStorage = (key: string): void => {
    if (typeof window !== "undefined") {
        localStorage.removeItem(key);
    }
};

// Authenticate user by passing data to cookie and local storage during signin
export const authenticate = (response: unknown, next?: () => void): void => {
    setCookie("user", JSON.stringify(response));

    if (next && typeof next === "function") {
        next(); // Trigger the next step (e.g., redirect)
    } else {
        console.log("No callback provided or invalid.");
    }
};

// Access user info from local storage
export const isAuth = (): boolean => {
    if (typeof window !== "undefined") {
        const cookieChecked = getCookie("user");
        const isLoggedInYN = getCookie("isLoggedInYN");
        if (cookieChecked && isLoggedInYN === "true") {
            return true;
        } else {
            logout();
            return false;
        }
    }
    return false;
};

export const logout = async (): Promise<void> => {
    try {
        removeCookie("user");
        removeCookie("organization");
        removeCookie("isLoggedInYN");
        removeCookie("tourGuide");
        localStorage.clear();
        sessionStorage.clear();

        queryClient.clear();
        queryClient.invalidateQueries();
        queryClient.resetQueries();
        queryClient.refetchQueries();
    } catch (error) {
        console.error("Error during logout:", error);
    }
};

export const updateUser = (user: unknown, next: () => void): void => {
    if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            localStorage.setItem("user", JSON.stringify(user));
            next();
        }
    }
};

export const getBaseUrl = (caseType: "common" | "user" | "admin" | "api"): string => {
    switch (caseType) {
        case "common":
            return process.env.NEXT_PUBLIC_COMMON_BASE_URL || "";
        case "user":
            return "https://user.example.com";
        case "admin":
            return "https://admin.example.com";
        case "api":
            return "https://api.example.com";
        default:
            return process.env.NEXT_PUBLIC_COMMON_BASE_URL || "";
    }
};

/**
 * Handles toast notifications for responses and errors.
 * @param {Object} params - Parameters for toast handling.
 */
interface ToastParams {
    res?: { message?: string };
    err?: { response?: { status?: number; data?: { errors?: Record<string, string[]>; message?: string } } };
    next?: () => void;
}

export const handleToast = ({ res, err, next }: ToastParams): void => {
    if (res) {
        toast.success(res.message || "Operation successful!");

        if (next) next();
    } else if (err) {
        if (err.response?.status === 422) {
            const validationErrors = err.response.data?.errors || {};
            const errorMessages = Object.values(validationErrors).flat();
            errorMessages.forEach((message) => toast.error(message));
        } else {
            toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
        }
    }
};
