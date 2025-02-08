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
const createManifest = async (data: Partial<IManifest>) => {
    try {
        const response = await instance.post(`/manifest`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating manifest:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};

// create hub
const updateManifest = async (id: string, data: Partial<IManifest>) => {
    try {
        const response = await instance.put(`/manifest/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating manifest:", error);
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
const getManifestById = async (id: string) => {
    try {
        const response = await instance.get(`/manifest?${id}`);
        return response.data[0];
    } catch (error) {
        console.error("Error fetching manifest:", error);
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
const deleteOrderIds = async (_id: string, id: string = "") => {
    try {
        const response = await instance.put(`/manifest/${_id}/order/${id}`);
        return response.data;
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




// Get orders
const getManifests = async (url: string = "") => {
    try {
        const response = await instance.get(`/manifest?${url}`);
        return response.data;
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






export {
    getManifests,
    updateManifest,
    createManifest,
    getManifestById,
    deleteOrderIds,
};
