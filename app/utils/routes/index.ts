import { handleToast } from "@/app/network/helper";
import instance from "../../network/index"; // Import your axios instance



// Define a type for the error that can optionally have a response property
type ErrorWithResponse = {
    response?: {
        status?: number;
        data?: {
            errors?: Record<string, string[]>;
            message?: string;
        };
    };
    message: string;
};


// create routes
const createRoutes = async (data: Partial<IRoute>) => {
    try {
        const response = await instance.post(`/routes`, data);
        handleToast({
            res: { message: response?.data?.message }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching routes:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};

// Get routes
const getRoutes = async (url: string = "") => {
    try {
        const response = await instance.get(`/routes?${url}`);
        return response.data?.routes
            ;
    } catch (error) {
        console.error("Error fetching routes:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};

// Get employee by ID
const getRoutesById = async (id: string): Promise<IRoute> => {
    try {
        const response = await instance.get(`routes/${id}`);
        return response.data?.route;
    } catch (error) {
        console.error("Error fetching routes:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
        throw error; // Rethrow error after toast
    }
};

// Update employee
const updateRoutes = async (id: string, data: Partial<IRoute>): Promise<IRoute> => {
    try {
        const response = await instance.put(`/routes/${id}`, data);
        handleToast({
            res: { message: response?.data?.message }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating employee:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
        throw error; // Rethrow error after toast
    }
};

// Delete routes
const archiveRoutes = async (id: string) => {
    try {
        const response = await instance.put(`routes/${id}/archive`);
        return response?.data
    } catch (error) {
        console.error("Error deleting routes:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};
// Delete routes
const unarchiveRoutes = async (id: string) => {
    try {
        const response = await instance.put(`routes/${id}/unarchive`);
        return response?.data
    } catch (error) {
        console.error("Error deleting routes:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};


export {
    getRoutes,
    getRoutesById,
    updateRoutes,
    archiveRoutes,
    createRoutes,
    unarchiveRoutes
};
