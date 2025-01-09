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

interface AuthResponse {
    token?: string;
    user?: unknown;  // You can replace `unknown` with a more specific type for `user`
}

// Authenticate user by passing data to cookie and local storage during signin
export const authenticate = (response: AuthResponse, next?: () => void): void => {
    if (response?.token && response?.user) {
        // Only set cookies if token and user are available
        setCookie("token", response.token);
        setCookie("user", JSON.stringify(response.user)); // Assuming user is an object
    } else {
        console.error("Invalid response data: token or user is missing.");
    }

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
        removeCookie("token")
        localStorage.clear();
        sessionStorage.clear();

        queryClient.clear();
        queryClient.invalidateQueries();
        queryClient.resetQueries();
        queryClient.refetchQueries();
        window.location.reload()
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
    res?: { message?: string }; // Success response message
    err?: {
        response?: {
            status?: number;
            data?: {
                errors?: Record<string, string[]>;
                message?: string;
            }
        };
    }; // Error response
    next?: () => void; // Next action after showing toast (optional)
}

export const handleToast = ({ res, err, next }: ToastParams): void => {
    if (res) {
        toast.success(res.message || "Operation successful!");

        if (next) next();
    } else if (err) {
        const { response } = err;

        if (response) {
            if (response.status === 422) {
                // Handling validation errors
                const validationErrors = response.data?.errors || {};
                const errorMessages = Object.values(validationErrors).flat();
                errorMessages.forEach((message) => toast.error(message));
            } else if (response.status === 400) {
                // Bad Request error handling
                toast.error("Invalid request. Please check your input.");
            } else if (response.status === 404) {
                // Not Found error handling
                toast.error("Requested resource not found.");
            } else if (response.status === 500) {
                // Server error handling
                toast.error("Internal server error. Please try again later.");
            } else {
                // Generic error message for any other status
                toast.error(response?.data?.message || "Something went wrong. Please try again.");
            }
        } else {
            // In case of network or non-response errors
            toast.error("Network error. Please check your connection.");
        }
    }
};
