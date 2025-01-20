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
const createOrder = async (data: Partial<IOrder>) => {
    try {
        const response = await instance.post(`/orders`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating order:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};

// Get orders
const getManifests = async (url: string = "") => {
    try {
        const response = await instance.get(`/manifest?${url}`);
        return response.data?.orders;
    } catch (error) {
        console.error("Error fetching orders:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};

// Get order by ID
const getOrderById = async (id: string) => {
    try {
        const response = await instance.get(`orders/${id}`);
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

// Update order
const updateOrder = async (id: string, data: Partial<IOrder>) => {
    try {
        const response = await instance.put(`orders/${id}`, data);
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
    getOrderById,
    getManifests,
    unarchiveHub,
    updateOrder,
    archiveHub,
    createOrder
};
