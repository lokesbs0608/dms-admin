import axios, {
    AxiosInstance,
    InternalAxiosRequestConfig,
    AxiosResponse,
    AxiosError,
} from "axios";
import Cookies from "js-cookie";
import { handleToast, logout } from "./helper";

// Define types for your toast handler and error structure (if not already defined in `helper.ts`)
interface ErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

// Create an Axios instance
const instance: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_COMMON_BASE_URL, // Use your backend base URL
    validateStatus: (status) => status >= 200 && status < 400, // Treat 302 as a success
});

// Request interceptor: Adds CSRF and Authorization tokens to headers
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Fetch token (e.g., JWT) from cookies
        const token = Cookies.get("token");

        // Add the Authorization header if the token exists
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        console.error("Request error:", error);
        return Promise.reject(error); // Reject the error to propagate it to the calling function
    }
);

// Response interceptor: Handles errors and responses
instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response) {
            const { data, status } = error.response;
            let errorMessage = "An unknown error occurred";

            // Handle 401 Unauthorized: Trigger logout
            if (status === 401) {
                console.warn("Unauthorized (401) error - logging out.");
                logout(); // Call the logout function
                return Promise.reject(error); // Ensure the error is passed along
            }

            // Handle validation errors
            if (data && (data as ErrorResponse).errors) {
                const errors = (data as ErrorResponse).errors;
                if (errors && errors.email && Array.isArray(errors.email)) {
                    errorMessage = errors.email.join(", ");
                } else {
                    errorMessage = "Validation errors occurred";
                }
            } else if (data && (data as ErrorResponse).message) {
                errorMessage = (data as ErrorResponse).message;
            }

            // Show the error in a toast notification
            handleToast({
                err: { response: { data: { message: errorMessage } } },
            });

            console.error("Error response:", error.response); // Log error details for debugging
        } else {
            // Handle general errors without a response
            console.error("Error message:", error.message);
            handleToast({
                err: { response: { data: { message: error.message } } },
            });
        }

        return Promise.reject(error); // Ensure the error is passed along
    }
);

export default instance;
