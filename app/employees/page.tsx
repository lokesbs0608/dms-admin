"use client";

import React, { useEffect, useState } from "react";
import {
    archiveEmployee,
    getEmployees,
    unarchiveEmployee,
} from "../utils/employees";
import Link from "next/link";
import toast from "react-hot-toast";

const Employees = () => {
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<IEmployee[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(
        null
    );
    const [searchQuery, setSearchQuery] = useState("");

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees(); // API endpoint to fetch employees
            setEmployees(response);
            setFilteredEmployees(response); // Initially, filtered employees are the same
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    // Fetch employees from API
    useEffect(() => {
        fetchEmployees();
    }, []);

    // Filter employees based on search query
    useEffect(() => {
        const filtered = employees.filter((employee) =>
            employee.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredEmployees(filtered);
    }, [searchQuery, employees]);

    // Handle Delete Action
    const handleDelete = async (id: string) => {
        if (selectedEmployee?.status === "Inactive") {
            try {
                const resp = await unarchiveEmployee(id);
                toast.success(resp?.message);
                fetchEmployees();
                setShowModal(false); // Close modal after delete
            } catch (error) {
                console.error("Error deleting employee:", error);
            }
        } else {
            try {
                const resp = await archiveEmployee(id);
                toast.success(resp?.message);
                fetchEmployees();
                setShowModal(false); // Close modal after delete
            } catch (error) {
                console.error("Error deleting employee:", error);
            }
        }
    };

    // Open confirmation modal
    const openDeleteModal = (employee: IEmployee) => {
        setSelectedEmployee(employee);
        setShowModal(true);
    };

    return (
        <div className="h-screen overflow-auto py-2 ">
            <div className="flex items-center justify-between mx-2">
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full max-w-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                />
                <Link
                    href={"employees/create"}
                    className="text-white bg-indigo-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-4 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    Create
                </Link>
            </div>

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-4">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <caption className="p-5 text-indigo-600 text-lg font-semibold text-left rtl:text-right bg-white dark:text-white dark:bg-gray-800">
                        Employees
                    </caption>

                    <thead className="text-xs text-indigo-600 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-indigo-600">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Username
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Role
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((employee) => (
                            <tr
                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                key={employee._id}
                            >
                                <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                >
                                    {employee.name}
                                </th>
                                <td className="px-6 py-4">{employee.username}</td>
                                <td className="px-6 py-4">{employee.role}</td>
                                <td className="px-6 py-4">{employee.status}</td>
                                <td className="px-6 py-4">
                                    <Link
                                        href={`employees/${employee._id}`}
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                    >
                                        Edit
                                    </Link>
                                    {employee?.status === "Active" ? (
                                        <button
                                            className="ml-4 font-medium text-red-600 dark:text-red-500 hover:underline"
                                            onClick={() => openDeleteModal(employee)}
                                        >
                                            Delete
                                        </button>
                                    ) : (
                                        <button
                                            className="ml-4 font-medium text-red-600 dark:text-red-500 hover:underline"
                                            onClick={() => openDeleteModal(employee)}
                                        >
                                            Un Archive
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {showModal && selectedEmployee && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h3 className="text-xl font-semibold">
                            Confirm{" "}
                            {selectedEmployee?.status === "Active" ? "Archive" : "Unarchive"}{" "}
                        </h3>
                        <p className="mt-4">
                            Are you sure you want to{" "}
                            {selectedEmployee?.status === "Active" ? "Archive" : "Unarchive"}{" "}
                            {selectedEmployee.name}?
                        </p>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                className="px-4 py-2 text-white bg-red-600 rounded"
                                onClick={() => handleDelete(selectedEmployee._id)}
                            >
                                Yes,{" "}
                                {selectedEmployee?.status === "Active"
                                    ? "Archive"
                                    : "Unarchive"}
                            </button>
                            <button
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
