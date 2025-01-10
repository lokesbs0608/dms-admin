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


// Get employees
const createLoader = async (data: Partial<IEmployee>) => {
    try {
        const response = await instance.post(`/loader`, data);
        handleToast({
            res: { message: response?.data?.message }
        });
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
    }
};

// Get employees
const getLoader = async (url: string = "") => {
    try {
        const response = await instance.get(`/loader?${url}`);
        return response.data?.employees;
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

// Get employee by ID
const getLoaderById = async (id: string) => {
    try {
        const response = await instance.get(`loader/${id}`);
        return response.data?.employee;
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

// Update employee
const updateLoader = async (id: string, data: Partial<ILoader>) => {
    try {
        const response = await instance.put(`/loader/${id}`, data);
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
    }
};

// archive loader
const archiveLoader = async (id: string): Promise<ErrorWithResponse> => {
    try {
        const response = await instance.patch(`loader/${id}/archive`);
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
        throw error; // Rethrow error after toast
    }
};



export {
    getLoader,
    getLoaderById,
    updateLoader,
    archiveLoader,
    createLoader,
};
