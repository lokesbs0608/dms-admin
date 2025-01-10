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


// create customer
const createCustomer = async (data: Partial<ICustomer>) => {
    try {
        const response = await instance.post(`/customer/register`, data);
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

// Get customers
const getCustomers = async (url: string = "") => {
    try {
        const response = await instance.get(`/customer/all?${url}`);
        return response.data?.customers;
    } catch (error) {
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};

// Get customer by ID
const getCustomerById = async (id: string) => {
    try {
        const response = await instance.get(`customer/${id}`);
        return response.data;
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

// Update customer
const updateCustomer = async (id: string, data: Partial<ICustomer>) => {
    try {
        const response = await instance.put(`customer/${id}`, data);
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

// archive customer
const archiveCustomer = async (id: string) => {
    try {
        const response = await instance.patch(`customer/${id}/archive`);
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
// unarchive customer
const unarchiveCustomer = async (id: string) => {
    try {
        const response = await instance.patch(`customer/${id}/unarchive`);
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
    getCustomers,
    getCustomerById,
    unarchiveCustomer,
    updateCustomer,
    archiveCustomer,
    createCustomer
};
