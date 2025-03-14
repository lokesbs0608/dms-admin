/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { getManifests, updateManifestStatus } from "../utils/manifest";
import ManifestDetailsModal from "./manifestForm";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { exportToExcel } from "../utils/uploadToEcxel";

const Manifest = () => {
    const { user } = useAuth()
    const [manifest, setManifest] = useState<IManifestTable[]>([]);
    const [filteredHubs, setFilteredHubs] = useState<IManifestTable[]>([]);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<IManifestTable | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterString, setFilterString] = useState<string>(`sourceHubID=${user?.hub_id}`);
    const [selectedOption, setSelectedOption] = useState("sourceHubID"); // Tracks the selected option
    const [selectedStatus, setSelectedStatus] = useState(""); // Selected status option

    const fetchManifest = async () => {
        try {
            const response = await getManifests(filterString); // API endpoint to fetch manifest;
            setManifest(response);
            setFilteredHubs(response); // Initially, filtered manifest are the same
        } catch (error) {
            console.error("Error fetching manifest:", error);
        }
    };

    // Fetch manifest from API
    useEffect(() => {
        if (!user?.hub_id) return
        fetchManifest();
    }, [filterString]);


    useEffect(() => {
        if (!user?.hub_id) return
        setFilterString(`sourceHubID=${user?.hub_id}`)
    }, [user?.hub_id])

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


    const handleFilter = (type: string) => {

        let hubFilter = "";
        switch (type) {
            case "inbound":
                hubFilter = `sourceHubID=${user?.hub_id}`;
                break;
            case "outbound":
                hubFilter = `destinationHubID=${user?.hub_id}`;
                break;
        }
        setSelectedOption(`${hubFilter}`);
        const newFilterString = `${hubFilter}`;
        setFilterString(newFilterString);
        console.log(newFilterString)
    };

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const statusValue = event.target.value;
        setSelectedStatus(statusValue);

        const newFilterString = statusValue === "all"
            ? `${selectedOption}`
            : `status=${statusValue}&${selectedOption}`;

        setFilterString(newFilterString);
        console.log(newFilterString);
    };

    const handleDownload = () => {
        const keys = {
            code: "Manifest Code",
            "loaderId.code": "Loader Code",
            "sourceHubID.name": "Origin",
            "destinationHubID.name": "Destination",
            "totalPcs": "Total Pcs",
            "actualWeight": "Actual Weight",
            "totalWeight": "Total Weight",
            transport_type: "Transport Type",
            status: "Order Status",
            createdAt: "Manifest date",
            updatedAt: "Manifest Last Updated",
        };
        const currentDate = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        const fileName = `Manifest_Report${currentDate}`;
        exportToExcel(filteredHubs, keys, fileName);
    };

    return (
        <div className="h-screen overflow-auto py-2 ">
            <div className="flex items-center justify-start mx-2 gap-4">
                <input
                    type="text"
                    placeholder="Search by Manifest Number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full max-w-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex gap-4">
                    <button
                        onClick={() => handleFilter("inbound")}
                        className={`px-4 transition-all py-2 rounded-lg font-medium bg-blue-200 text-blue-600 ${selectedOption.includes('sourceHubID') ? "opacity-100" : " scale-50 opacity-40 "
                            } hover:bg-blue-500 hover:text-white`}
                    >
                        Out going
                    </button>
                    <button
                        onClick={() => handleFilter("outbound")}
                        className={`px-4 transition-all py-2 rounded-lg font-medium bg-green-100 opacity-80 text-green-600 ${selectedOption.includes('destinationHubID') ? "opacity-100" : " scale-50 opacity-40 "
                            } hover:bg-green-500 hover:text-white`}
                    >
                        In Coming
                    </button>
                </div>
                <select
                    id="status"
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
                >
                    <option value={'all'}  >All</option>
                    {statusOptions.map((option) => (
                        <option key={`${option.value}_table_status`} className={`${option?.color || "text-gray-700 border-gray-300"}`} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <p
                    onClick={() => handleDownload()}
                    className="text-white cursor-pointer  bg-indigo-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-4 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    Download Report
                </p>
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
                                Manifest Code
                            </th>
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
                                    {order?.code || 'NA'}
                                </th>
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