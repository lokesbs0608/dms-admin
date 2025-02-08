"use client";

import React, { useEffect, useState } from "react";
import { getManifests, updateManifestStatus } from "../utils/manifest";
import ManifestDetailsModal from "./manifestForm";
import toast from "react-hot-toast";

const Manifest = () => {
    const [manifest, setManifest] = useState<IManifestTable[]>([]);
    const [filteredHubs, setFilteredHubs] = useState<IManifestTable[]>([]);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<IManifestTable | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchEmployees = async () => {
        try {
            const response = await getManifests(); // API endpoint to fetch manifest;
            setManifest(response);
            setFilteredHubs(response); // Initially, filtered manifest are the same
        } catch (error) {
            console.error("Error fetching manifest:", error);
        }
    };

    // Fetch manifest from API
    useEffect(() => {
        fetchEmployees();
    }, []);

    // Filter manifest based on search query
    useEffect(() => {
        const filtered = manifest?.filter((hub) =>
            hub?.loaderId?._id?.toLowerCase()?.includes(searchQuery?.toLowerCase())
        );
        setFilteredHubs(filtered);
    }, [searchQuery, manifest]);


    const handleChange = async (event: { target: { value: string } }, id: string) => {
        try {
            const newStatus = event.target.value as "In Transit" | "Delivered" | "Pending"; // Explicitly cast

            const resp = await updateManifestStatus(id, newStatus);

            if (resp?.message === "Manifest status updated successfully.") {
                toast.success(resp?.message);

                // Update the status in hubs state
                setManifest((prevHubs) =>
                    prevHubs.map((hub) =>
                        hub._id === id ? { ...hub, status: newStatus } : hub
                    ) as IManifestTable[] // Ensure the return type matches the expected state
                );
            }
        } catch (error) {
            console.error(error);
        }
    };




    return (
        <div className="h-screen overflow-auto py-2 ">
            <div className="flex items-center justify-between mx-2">
                <input
                    type="text"
                    placeholder="Search by Manifest Number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full max-w-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                />
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
                                Loader Code
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Source Hub Id
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Destination Hub Id
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Transport Type
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Total Pcs
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Actual Weight
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Loader Weight
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
                                    {order.loaderId?.code}
                                </th>
                                <td className="px-6 py-4">{order.sourceHubID?.hub_code}</td>
                                <td className="px-6 py-4">
                                    {order.destinationHubID?.hub_code}
                                </td>
                                <td className="px-6 py-4">{order.transport_type}</td>
                                <td className="px-6 py-4">{order.totalPcs}</td>
                                <td className="px-6 py-4">{order.actualWeight}</td>
                                <td className="px-6 py-4">{order.totalWeight}</td>
                                <td className="px-6 py-4">
                                    <select
                                  
                                        value={order?.status}
                                        onChange={(e) => handleChange(e, order?._id)}
                                        className={`px-3 py-2 border-2 rounded-md w-full focus:outline-none transition-all ${statusOptions.find((opt) => opt.value === order?.status)?.color || "text-gray-700 border-gray-300"
                                            }`}
                                    >
                                        {statusOptions.map((option) => (
                                            <option key={option.value} className={`${option?.color || "text-gray-700 border-gray-300"}`} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <p
                                        onClick={() => {
                                            setShowOrderModal(true);
                                            setSelectedOrder(order);
                                        }}
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                    >
                                        Edit
                                    </p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showOrderModal && (

                <ManifestDetailsModal
                    isOpen={showOrderModal}
                    onClose={() => { setShowOrderModal(false); setSelectedOrder(null) }}
                    id={selectedOrder?._id}
                />
            )}


        </div>
    );
};

export default Manifest;

const statusOptions = [
    { label: "In Transit", value: "In Transit", color: "text-blue-600 border-blue-600" },
    { label: "Delivered", value: "Delivered", color: "text-green-600 border-green-600" },
    { label: "Pending", value: "Pending", color: "text-yellow-600 border-yellow-600" },
];