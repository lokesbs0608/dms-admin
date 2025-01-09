"use client"
import { useState, useEffect } from "react";
import instance from "../network";
import {
    authenticate,
    getCookie,
    logout as clearStorage,
} from "../network/helper";
import { handleToast } from "../network/helper";

// Define types
interface User {
    id: string;
    attributes?: {
        role_numeric?: number;
    };
    [key: string]: unknown;
}

interface AuthData {
    email: string;
    password: string;
    [key: string]: unknown;
}

export const useAuth = () => {
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);

    // Centralized error handler
    const handleError = (err: unknown, defaultMessage: string) => {
        console.log(err);
        const message = defaultMessage;
        handleToast({ err: { response: { data: { message } } } });
    };

    // Fetch user data
    const fetchUser = async (): Promise<void> => {
        try {
            const res = await instance.get("/api/user");
            if (res?.status === 200) {
                setUser(res.data?.data);
                setIsAuthenticated(true);
                authenticate(res.data?.data, () => { });
            }
        } catch (err) {
            handleError(err, "Failed to fetch user data.");
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    // Login
    const login = async (url: string, data: AuthData): Promise<void> => {
        await clearStorage();
        try {
            const response = await instance.post(url, data);
            if ([200, 201, 204].includes(response?.status)) {
                handleToast({ res: { message: "Login successful!" } });
                await fetchUser();
            }
        } catch (err) {
            handleError(err, "Login failed.");
        }
    };

    // Load user from cookies on mount
    useEffect(() => {
        const loadUserFromCookies = (): void => {
            const storedUser = getCookie("user");

            if (storedUser) {
                const userData: User = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true);
            }
        };

        loadUserFromCookies();
    }, []);

    return {
        user,
        isAuthenticated,
        login,
        setUser,
    };
};
