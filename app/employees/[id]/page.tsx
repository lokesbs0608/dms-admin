"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createEmployee, getEmployeeById, updateEmployee } from "@/app/utils/employees";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getHubs } from "@/app/utils/hub";

const EmployeeForm = () => {
    const router = useRouter(); // Initialize the router

    const { id } = useParams();
    const [hubs, setHubs] = useState<IHub[]>([]);
    const [formData, setFormData] = useState<IEmployee>({
        name: "",
        gender: "Male",
        username: "",
        email: "",
        role: "",
        location: {
            address: "",
            city: "",
            state: "",
            pincode: "",
        },
        section: "",
        status: "Active",
        account_id: "",
        date_of_joining: new Date(),
        documents_id: [],
        hub_id: "",
        ref_id: "",
        remarks: "",
        _id: "",
        password: "Login@123",
    });
    const [loading, setLoading] = useState(true);

    const handleChange = (e: {
        target: { name: string; value: string | number };
    }) => {
        const { name, value } = e.target;
        if (name.includes("location")) {
            const locationField = name.split(".")[1];
            setFormData({
                ...formData,
                location: {
                    ...formData.location,
                    [locationField]: value,
                },
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };
    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        // Filter out empty, null, undefined fields, and empty arrays from formData
        const filteredData = Object.fromEntries(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            Object.entries(formData).filter(([_, value]) => {
                // Check for non-null, non-undefined, non-empty string, and non-empty array
                if (Array.isArray(value)) {
                    return value.length > 0; // Keep array only if it's not empty
                }
                return value !== null && value !== undefined && value !== ""; // Check for non-null, non-undefined, non-empty string
            })
        );
        try {
            const response = id && id !== "create"
                ? await updateEmployee(id.toString(), filteredData) // Call update API
                : await createEmployee(filteredData); // Call create API

            console.log("Form submitted successfully:", response);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };


    const fetchEmployeeById = useCallback(async (employeeID: string) => {
        try {
            const resp = await getEmployeeById(employeeID);
            setFormData((prevData) => ({
                ...prevData,
                ...resp,
            }));
            setLoading(false);
        } catch (error) {
            console.error("Error fetching employee data:", error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (id && id !== "create") {
            fetchEmployeeById(id.toString());
        } else {
            setLoading(false);
        }
    }, [fetchEmployeeById, id]);

    const fetchEmployees = async () => {
        try {
            const response = await getHubs(); // API endpoint to fetch hubs;
            setHubs(response);
        } catch (error) {
            console.error("Error fetching hubs:", error);
        }
    };

    // Fetch hubs from API
    useEffect(() => {
        fetchEmployees();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <div className="flex text-center content-center items-center gap-4 mb-4">
                <Link href="#" onClick={() => router.back()}>
                    <span>
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 38.4 38.4"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="m8.36 21.754 11.301 12.319c0.913 1.077 0.781 2.69 -0.296 3.603s-2.69 0.781 -3.603 -0.296L0.734 20.999a2.546 2.546 0 0 1 -0.517 -0.751 2.55 2.55 0 0 1 -0.224 -1.106l0 -0.002a2.563 2.563 0 0 1 0.272 -1.093 2.55 2.55 0 0 1 0.052 -0.098 2.535 2.535 0 0 1 0.379 -0.513L16.124 0.792c0.96 -1.035 2.577 -1.097 3.612 -0.137s1.097 2.577 0.137 3.612L8.403 16.642h27.392c1.412 0 2.556 1.144 2.556 2.556s-1.144 2.556 -2.556 2.556z" />
                        </svg>
                    </span>
                </Link>
                <h2 className="text-2xl font-bold  text-indigo-600">Employee Form</h2>
            </div>

            {loading ? (
                <div> loading.......</div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                            required
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                            required
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                            required
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                        >
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="delivery_boy">Delivery Partner</option>
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Section</label>
                        <input
                            type="text"
                            name="section"
                            value={formData.section}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                            required
                        />
                    </div>
                    {/* 
                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Branch</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div> */}
                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Hub</label>
                        <select
                            name="hub_id"
                            value={formData.hub_id}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                        >
                            {hubs?.map((items) => {
                                return (
                                    <option key={items?._id} value={items?._id}>
                                        {items?.name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Address</label>
                        <input
                            type="text"
                            name="location.address"
                            value={formData.location.address}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">City</label>
                        <input
                            type="text"
                            name="location.city"
                            value={formData.location.city}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">State</label>
                        <input
                            type="text"
                            name="location.state"
                            value={formData.location.state}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Pincode</label>
                        <input
                            type="text"
                            name="location.pincode"
                            value={formData.location.pincode}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div className="col-span-2 md:col-span-2 lg:col-span-3">
                        <button
                            type="submit"
                            className="text-white max-w-[30rem] bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default EmployeeForm;
