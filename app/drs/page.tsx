/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import DrsDetailsModal from "./drsForm";
import { getAllDRS, updateDrsStatus } from "../utils/drs";
import generateDeliveryRunSheetPDF from "./drsMaker";

const Manifest = () => {
    const { user } = useAuth();
    const [manifest, setDRS] = useState<IDRSRecord[]>([]);
    const [filteredHubs, setFilteredDrs] = useState<IDRSRecord[]>([]);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<IDRSRecord | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterString, setFilterString] = useState<string>(
        `hubId=${user?.hub_id}`
    );
    const [selectedOption, setSelectedOption] = useState("sourceHubID"); // Tracks the selected option
    const [selectedStatus, setSelectedStatus] = useState(""); // Selected status option

    const fetchDrs = async () => {
        try {
            const response = await getAllDRS(filterString); // API endpoint to fetch manifest;
            setDRS(response);
            setFilteredDrs(response); // Initially, filtered manifest are the same
        } catch (error) {
            console.error("Error fetching manifest:", error);
        }
    };

    // Fetch manifest from API
    useEffect(() => {
        if (!user?.hub_id) return;
        fetchDrs();
    }, [filterString]);

    useEffect(() => {
        if (!user?.hub_id) return;
        setFilterString(`hubId=${user?.hub_id}`);
    }, [user?.hub_id]);

    // Filter manifest based on search query
    useEffect(() => {
        const filtered = manifest?.filter((hub) =>
            hub?.deliveryBoyId?.name
                ?.toLowerCase()
                ?.includes(searchQuery?.toLowerCase())
        );
        setFilteredDrs(filtered);
    }, [searchQuery, manifest]);

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const statusValue = event.target.value;
        setSelectedStatus(statusValue);

        const newFilterString =
            statusValue === "all"
                ? `${selectedOption}`
                : `status=${statusValue}&${selectedOption}`;

        setFilterString(newFilterString);
        console.log(newFilterString);
    };

    const handleChange = async (
        event: { target: { value: string } },
        id: string
    ) => {
        try {
            const newStatus = event.target.value as "Out for Delivery" | "Delivered"; // Explicitly cast

            const resp = await updateDrsStatus(id, newStatus);

            if (resp?.message === "DRS status updated successfully.") {
                toast.success(resp?.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDrsPrint = async (order: IDRSRecord) => {
        console.log(order);
        generateDeliveryRunSheetPDF(order)
    };

    return (
        <div className="h-screen overflow-auto py-2 ">
            <div className="flex items-center justify-start mx-2 gap-4">
                <input
                    type="text"
                    placeholder="Search by Docket Number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full max-w-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                />

                <select
                    id="status"
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
                >
                    <option value={"all"}>All</option>
                    {statusOptions.map((option) => (
                        <option
                            key={`${option.value}_table_status`}
                            className={`${option?.color || "text-gray-700 border-gray-300"}`}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <p
                    onClick={() => setShowOrderModal(true)}
                    className="text-white  bg-indigo-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-4 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    Create
                </p>
            </div>

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-4">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <caption className="p-5 text-[#1d4ed8] text-lg font-semibold text-left rtl:text-right bg-white dark:text-white dark:bg-gray-800">
                        Manifest
                    </caption>

                    <thead className="text-xs text-[#1d4ed8] uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-[#1d4ed8]">
                                DRS Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-[#1d4ed8]">
                                Employee Name
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Hub Id
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Vehicle No
                            </th>

                            <th scope="col" className="px-6 py-3">
                                Total Weight
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Total Pcs
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
                        {filteredHubs?.map((order) => (
                            <tr
                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                key={order._id}
                            >
                                <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                >
                                    {order.code || 'NA'}
                                </th>
                                <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                >
                                    {order.deliveryBoyId?.name}
                                </th>
                                <td className="px-6 py-4">{order.hubId.name}</td>
                                <td className="px-6 py-4">{order.vehicleNumber}</td>

                                <td className="px-6 py-4">
                                    {order.orderIds?.reduce(
                                        (sum, items) => sum + (items?.totalWeight || 0),
                                        0
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {order.orderIds?.reduce(
                                        (sum, items) => sum + (items?.itemsCount || 0),
                                        0
                                    )}
                                </td>

                                <td className="px-6 py-4">
                                    <select
                                        value={order?.status}
                                        onChange={(e) => handleChange(e, order?._id)}
                                        className={`px-3 py-2 border-2 rounded-md w-full focus:outline-none transition-all ${statusOptions.find((opt) => opt.value === order?.status)
                                            ?.color || "text-gray-700 border-gray-300"
                                            }`}
                                    >
                                        {statusOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                className={`${option?.color || "text-gray-700 border-gray-300"
                                                    }`}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4 flex items-center gap-4">
                                    <p
                                        onClick={() => {
                                            setShowOrderModal(true);
                                            setSelectedOrder(order);
                                        }}
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                    >
                                        Edit
                                    </p>
                                    <p
                                        onClick={() => {
                                            handleDrsPrint(order);
                                        }}
                                        className="font-medium text-gray-600 dark:text-white hover:underline"
                                    >
                                        Print
                                    </p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showOrderModal && (
                <DrsDetailsModal
                    isOpen={showOrderModal}
                    onClose={() => {
                        setShowOrderModal(false);
                        setSelectedOrder(null);
                    }}
                    id={selectedOrder?._id}
                />
            )}
        </div>
    );
};

export default Manifest;

const statusOptions = [
    {
        label: "Out for Delivery",
        value: "Out for Delivery",
        color: "text-blue-600 border-blue-600",
    },
    {
        label: "Delivered",
        value: "Delivered",
        color: "text-green-600 border-green-600",
    },
];
