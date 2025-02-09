import { handleToast } from "@/app/network/helper";
import instance from "../../network/index"; // Import your axios instance

interface IEmployee {
    _id: string;
    name: string;
    gender: "Male" | "Female" | "Other";
    username: string;
    email: string;
    role: string;
    date_of_joining: string;
    location: {
        address: string;
        city: string;
        state: string;
        pincode: string;
    };
    status: "Active" | "Inactive";
    section: string;
    account_id: string;
    documents_id: string[];
    branch_id: string;
    hub_id: string;
    ref_id: string;
    remarks: string;
    created_by: string;
    updated_by: string;
}

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
const createEmployee = async (data: Partial<IEmployee>) => {
    try {
        const response = await instance.post(`/employees`, data);
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
const getEmployees = async (url: string = "") => {
    try {
        const response = await instance.get(`/employees?${url}`);
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
const getEmployeeById = async (id: string): Promise<IEmployee> => {
    try {
        const response = await instance.get(`employees/${id}`);
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
        throw error; // Rethrow error after toast
    }
};

// Update employee
const updateEmployee = async (id: string, data: Partial<IEmployee>): Promise<IEmployee> => {
    try {
        const response = await instance.put(`/employees/${id}`, data);
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

// Delete employee
const archiveEmployee = async (id: string): Promise<ErrorWithResponse> => {
    try {
        const response = await instance.patch(`employees/${id}/archive`);
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
// Delete employee
const unarchiveEmployee = async (id: string): Promise<ErrorWithResponse> => {
    try {
        const response = await instance.patch(`employees/${id}/unarchive`);
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
    getEmployees,
    getEmployeeById,
    updateEmployee,
    archiveEmployee,
    createEmployee,
    unarchiveEmployee
};
