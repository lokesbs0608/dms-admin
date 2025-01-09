"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createHub, getHubById, updateHub } from "../../utils/hub"; // Add API utilities for hubs
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getEmployees } from "@/app/utils/employees";
import toast from "react-hot-toast";

const HubForm = () => {
    const router = useRouter();
    const { id } = useParams();
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [formData, setFormData] = useState<IHub>({
        name: "",
        _id: "",
        address: "",
        bank_details_id: "",
        division: "",
        documents_id: [],
        emergency_person_id: "",
        hub_code: "",
        landline_number: "",
        manager_id: "",
        pincodes: [""],
        status: "Active",
    });

    const [loading, setLoading] = useState(true);

    const handleChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;

        if (name === "pincodes") {
            setFormData({
                ...formData,
                pincodes: value?.split(",").map((pin: string) => pin.trim()),
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
            const response =
                id && id !== "create"
                    ? await updateHub(id.toString(), filteredData) // Call update API
                    : await createHub(filteredData); // Call create API
            console.log(response);
            toast.success(response?.message);
            router.back()

        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };


    const fetchHubById = useCallback(async (hubID: string) => {
        try {
            const resp = await getHubById(hubID);
            setFormData({ ...formData, ...resp });
            setLoading(false);
        } catch (error) {
            console.error("Error fetching hub data:", error);
            setLoading(false);
        }
    }, [formData]);

    useEffect(() => {
        if (id && id !== "create") {
            fetchHubById(id.toString());
        } else {
            setLoading(false);
        }
    }, [id]);

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees(); // API endpoint to fetch employees
            setEmployees(response);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    // Fetch employees from API
    useEffect(() => {
        fetchEmployees();
    }, []);

    const selectedEmployee = employees.find((employee) => employee._id === formData?.manager_id);
    const selectedEmergencyPerson = employees.find((employee) => employee._id === formData?.emergency_person_id);
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
                <h2 className="text-2xl font-bold text-indigo-600 ">Hub Form</h2>
            </div>

            {loading ? (
                <div>Loading.......</div>
            ) : (
                <><form
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
                            required />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                            required />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Hub Code</label>
                        <input
                            type="text"
                            name="hub_code"
                            value={formData.hub_code}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                            required />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Division</label>
                        <input
                            type="text"
                            name="division"
                            value={formData.division}

                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                            required />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Pincodes</label>
                        <input
                            type="text"
                            name="pincodes"
                            required
                            value={formData.pincodes.join(", ")}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                            placeholder="Separate by commas" />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Landline Number</label>
                        <input
                            type="text"
                            name="landline_number"
                            value={formData.landline_number}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                            required />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                            className="w-full mt-2 p-2 border rounded"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Manager </label>
                        <select
                            name="manager_id"
                            required
                            value={formData.manager_id}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                        >
                            {employees.map((items) => {
                                return (
                                    <option key={items?._id} value={items?._id}>
                                        {items?.name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium">
                            Emergency Contact
                        </label>
                        <select
                            name="emergency_person_id"
                            required
                            value={formData.emergency_person_id}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                        >
                            {employees.map((items) => {
                                return (
                                    <option key={items?._id} value={items?._id}>
                                        {items?.name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-2 lg:col-span-3">
                        <button
                            type="submit"
                            className="text-white max-w-[30rem]  bg-indigo-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            Submit
                        </button>
                    </div>
                </form>


                    <div className="p-4 my-4 bg-white shadow-md rounded-md">
                        <h2 className="text-center my-4 text-2xl text-indigo-600">Employee details</h2>
                        {selectedEmployee && selectedEmergencyPerson ? (
                            <table className="w-full border-collapse border border-gray-300">
                                <tbody>
                                    <tr className="border-b">
                                        <td className="px-4 py-2 font-medium text-gray-600">Manager Name</td>
                                        <td className="px-4 py-2">{selectedEmployee.name}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-2 font-medium text-gray-600">Manager ID</td>
                                        <td className="px-4 py-2">{selectedEmployee._id}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-2 font-medium text-gray-600">Position</td>
                                        <td className="px-4 py-2">{selectedEmployee.role}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-2 font-medium text-gray-600">Department</td>
                                        <td className="px-4 py-2">{selectedEmployee.section || "N/A"}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-2 font-medium text-gray-600">Emergency Contact Name</td>
                                        <td className="px-4 py-2">{selectedEmergencyPerson?.name || "N/A"}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-2 font-medium text-gray-600">Emergency Contact Email</td>
                                        <td className="px-4 py-2">{selectedEmergencyPerson?.email || "N/A"}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-2 font-medium text-gray-600">Emergency Contact Role</td>
                                        <td className="px-4 py-2">{selectedEmergencyPerson?.role || "N/A"}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-medium text-gray-600">Emergency Contact Section</td>
                                        <td className="px-4 py-2">{selectedEmergencyPerson?.section || "N/A"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500">No manager selected</p>
                        )}
                    </div>


                </>
            )}
        </div>
    );
};

export default HubForm;
