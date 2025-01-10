"use client";
import { useState, useEffect } from "react";
import instance from "../network";
import {
    authenticate,
    getCookie,
} from "../network/helper";
import { handleToast } from "../network/helper";
import { useRouter } from "next/navigation"; // Ensure this is correct

// Define types
interface User {
    id: string;
    attributes?: {
        role_numeric?: number;
    };
    [key: string]: unknown;
}

interface AuthData {
    username: string;
    password: string;
    [key: string]: unknown;
}

export const useAuth = () => {
    // Authentication state
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);

    // Centralized error handler
    const handleError = (err: unknown, defaultMessage: string) => {
        console.log(err);
        const message = defaultMessage;
        handleToast({ err: { response: { data: { message } } } });
    };

    // Login
    const login = async (url: string, data: AuthData): Promise<void> => {
        try {
            const response = await instance.post(url, data);
            if ([200, 201, 204].includes(response?.status)) {
                handleToast({ res: { message: "Login successful!" } });

                // Authenticate and redirect after successful login
                authenticate(response?.data, async () => {
                    // Update isAuthenticated and user after authentication
                    setUser(response?.data?.user || null);
                    setIsAuthenticated(true);
                    router.push("/"); // Redirect to the home page
                    window.location.reload()
                });
            }
        } catch (err) {
            handleError(err, "Login failed.");
        }
    };

    // Load user from cookies on mount and validate token
    useEffect(() => {
        const loadUserFromCookies = (): void => {
            const storedUser = getCookie("user");
            const token = getCookie("token");

            // Validate if both user and token are present, if not, set isAuthenticated to false
            if (storedUser && token) {
                const userData: User = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true); // Set authenticated to true
            } else {
                setIsAuthenticated(false); // Ensure it's false if no token or user
            }
        };

        loadUserFromCookies();
    }, []); // Run only once when the component mounts

    // Monitor authentication state and trigger appropriate actions
    useEffect(() => {
        if (isAuthenticated) {
            // Optionally, you could trigger any additional logic when the user is authenticated
            // For example, redirecting to a dashboard or performing an action.
            const storedUser = getCookie("user");

            if (storedUser) {
                const userData: User = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true); // Make sure authentication status is true if user exists in cookies
            }
        }
    }, [isAuthenticated]);

    return {
        user,
        isAuthenticated,
        login,
        setUser,
    };
};
