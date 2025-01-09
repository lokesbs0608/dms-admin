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


// create hub
const createHub = async (data: Partial<IHub>): Promise<IEmployee[]> => {
    try {
        const response = await instance.post(`/hub`, data);
        return response.data;
    } catch (error) {
        console.error("Error fetching employees:", error);
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

// Get hubs
const getHubs = async (url: string = "") => {
    try {
        const response = await instance.get(`/hub?${url}`);
        return response.data?.hubs;
    } catch (error) {
        console.error("Error fetching employees:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};

// Get hub by ID
const getHubById = async (id: string) => {
    try {
        const response = await instance.get(`hub/${id}`);
        return response.data?.hub;
    } catch (error) {
        console.error("Error fetching employee:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};

// Update hub
const updateHub = async (id: string, data: Partial<IHub>) => {
    try {
        const response = await instance.put(`hub/${id}`, data);
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
    }
};

// Delete hub
const archiveHub = async (id: string) => {
    try {
        const response = await instance.patch(`hub/${id}/archive`);
        return response?.data
    } catch (error) {
        console.error("Error deleting employee:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};
// Delete hub
const unarchiveHub = async (id: string) => {
    try {
        const response = await instance.patch(`hub/${id}/unarchive`);
        return response?.data
    } catch (error) {
        console.error("Error deleting employee:", error);
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
    getHubById,
    getHubs,
    unarchiveHub,
    updateHub,
    archiveHub,
    createHub
};
