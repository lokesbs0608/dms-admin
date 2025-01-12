/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createRoutes, getRoutesById, updateRoutes } from "@/app/utils/routes";
import { getHubs } from "@/app/utils/hub";

const HubForm = () => {
    const router = useRouter();
    const { id } = useParams();
    const [formData, setFormData] = useState<IRoute>({
        _id: "",
        areas: [],
        branch_id: "",
        from: "",
        hub_id: "",
        pincodes: [],
        route_code: "",
        status: "Active",
        to: "",
        via: "",
    });

    const [loading, setLoading] = useState(true);
    const [hubs, setHubs] = useState<IHub[]>([]);

    const handleChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;

        if (name === "pincodes") {
            setFormData({
                ...formData,
                pincodes: value?.split(",").map((pin: string) => pin.trim()),
            });
        } else if (name === "areas") {
            setFormData({
                ...formData,
                areas: value?.split(",").map((area: string) => area.trim()),
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
                    ? await updateRoutes(id.toString(), filteredData) // Call update API
                    : await createRoutes(filteredData); // Call create API
            if (response) {

                router.back();
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const fetchHubById = useCallback(
        async (hubID: string) => {
            try {
                const resp: IRoute = await getRoutesById(hubID);
                setFormData({ ...formData, ...resp });

                setLoading(false);
            } catch (error) {
                console.error("Error fetching hub data:", error);
                setLoading(false);
            }
        },
        [formData]
    );

    useEffect(() => {
        if (id && id !== "create") {
            fetchHubById(id.toString());
        } else {
            setLoading(false);
        }
    }, [id]);

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
                <h2 className="text-2xl font-bold text-indigo-600 ">Loader Form</h2>
            </div>

            {loading ? (
                <div>Loading.......</div>
            ) : (
                <>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium">From</label>
                                <input
                                    type="text"
                                    name="from"
                                    value={formData.from}
                                    onChange={handleChange}
                                    className="w-full mt-2 p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium">Via</label>
                                <input
                                    type="text"
                                    name="via"
                                    value={formData.via}
                                    onChange={handleChange}
                                    className="w-full mt-2 p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium">TO</label>
                                <input
                                    type="text"
                                    name="to"
                                    value={formData.to}
                                    onChange={handleChange}
                                    className="w-full mt-2 p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium">Pincodes</label>
                                <input
                                    type="text"
                                    name="pincodes"
                                    value={formData?.pincodes?.join(", ")}
                                    onChange={handleChange}
                                    className="w-full mt-2 p-2 border rounded"
                                    placeholder="Enter Pincode Comma separated"
                                    required
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium">Areas</label>
                                <input
                                    type="text"
                                    name="areas"
                                    value={formData?.areas?.join(", ")}
                                    onChange={handleChange}
                                    placeholder="Enter Areas Comma separated"
                                    className="w-full mt-2 p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium">Hub ID</label>
                                <select
                                    name="hub_id"
                                    value={formData.hub_id}
                                    onChange={handleChange}
                                    required
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
                                <label className="block text-sm font-medium">Route Code</label>
                                <input
                                    type="text"
                                    name="route_code"
                                    value={formData.route_code}
                                    onChange={handleChange}
                                    className="w-full mt-2 p-2 border rounded"
                                    required
                                />
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
                        </div>

                        <div className="col-span-2 md:col-span-2 lg:col-span-3 my-4">
                            <button
                                type="submit"
                                className="text-white max-w-[30rem]  bg-indigo-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default HubForm;
