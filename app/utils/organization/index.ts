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


// Get organization
const createOrganization = async (data: Partial<IOrganization>) => {
    try {
        const response = await instance.post(`/organization`, data);
        handleToast({
            res: { message: response?.data?.message }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching organization:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};

// Get organization
const getOrganization = async () => {
    try {
        const response = await instance.get(`/organization`);
        return response.data?.data;
    } catch (error) {
        console.error("Error fetching organization:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};

// Get organization by ID
const getOrganizationById = async (id: string): Promise<IOrganization> => {
    try {
        const response = await instance.get(`organization/${id}`);
        return response.data?.organization;
    } catch (error) {
        console.error("Error fetching organization:", error);
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

// Update organization
const updateOrganization = async (id: string, data: Partial<IOrganization>): Promise<IOrganization> => {
    try {
        const response = await instance.put(`/organization/${id}`, data);
        handleToast({
            res: { message: response?.data?.message }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating organization:", error);
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

// Delete organization
const archiveOrganization = async (id: string): Promise<ErrorWithResponse> => {
    try {
        const response = await instance.patch(`organization/${id}/archive`);
        return response?.data
    } catch (error) {
        console.error("Error deleting organization:", error);
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
// Delete organization
const unarchiveEOrganization = async (id: string): Promise<ErrorWithResponse> => {
    try {
        const response = await instance.patch(`organization/${id}/unarchive`);
        return response?.data
    } catch (error) {
        console.error("Error deleting organization:", error);
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
    getOrganization,
    getOrganizationById,
    updateOrganization,
    archiveOrganization,
    createOrganization,
    unarchiveEOrganization
};
