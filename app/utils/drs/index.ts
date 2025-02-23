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


// create drs
const createDRS = async (data: Partial<IDRSForm>) => {
    try {
        const response = await instance.post(`/drs`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating drs:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};
// update drs
const updateDRS = async (id: string, data: Partial<IDRSForm>) => {
    try {
        const response = await instance.put(`/drs/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating drs:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};


// get drs
const getAllDRS = async (url: string) => {
    try {
        const response = await instance.get(`/drs?${url}`,);
        return response.data?.drsList;
    } catch (error) {
        console.error("Error fetching drs:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};
// get drs
const getDRSById = async (id: string) => {
    try {
        const response = await instance.get(`/drs/${id}`,);
        return response.data?.drs;
    } catch (error) {
        console.error("Error fetching drs:", error);
        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
};


// get drs
const deleteDRSOrderById = async (drsId: string, orderId: string) => {
    try {
        const response = await instance.delete(`/drs/remove-order`, {
            data: { drsId, orderId } // Correct way to send data in DELETE request
        });

        return response.data?.drsList;
    } catch (error) {
        console.error("Error removing order from DRS:", error);

        if ((error as ErrorWithResponse).response) {
            handleToast({
                err: {
                    response: (error as ErrorWithResponse).response
                }
            });
        }
    }
}

const updateDrsStatus = async (id: string, status: string) => {
    try {
        const response = await instance.put(`/drs/${id}/status/${status}`);
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
    createDRS,
    getAllDRS,
    updateDRS,
    getDRSById,
    updateDrsStatus,
    deleteDRSOrderById
}