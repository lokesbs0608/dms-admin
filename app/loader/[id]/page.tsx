/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    createCustomer,
    getCustomerById,
    updateCustomer,
} from "@/app/utils/customer";

const HubForm = () => {
    const router = useRouter();
    const { id } = useParams();
    const [formData, setFormData] = useState<ILoader>({
        name: "",
        _id: "",
        location: { address: "", city: "", pincode: "", state: "" },
        status: "Active",
        company_name: "",
        documents_ids: [],
        email: "",
        tags: [],
        username: "",
        code: "",
        website: "",
    });

    const [loading, setLoading] = useState(true);

    const handleChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;

        if (name === "tags") {
            setFormData({
                ...formData,
                tags: value?.split(",").map((pin: string) => pin.trim()),
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
                    ? await updateCustomer(id.toString(), filteredData) // Call update API
                    : await createCustomer(filteredData); // Call create API
            if (response) {
                toast.success(response?.message);
                router.back();
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const fetchHubById = useCallback(
        async (hubID: string) => {
            try {
                const resp: ILoader = await getCustomerById(hubID);
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
                                <label className="block text-sm font-medium">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={formData.company_name}
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
                                <label className="block text-sm font-medium">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.location?.address}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            location: {
                                                ...formData.location,
                                                address: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-full mt-2 p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.location?.city}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            location: {
                                                ...formData.location,
                                                city: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-full mt-2 p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium">Pincode</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            location: {
                                                ...formData.location,
                                                pincode: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-full mt-2 p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium">State</label>
                                <input
                                    type="text"
                                    name="State"
                                    value={formData.location?.state}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            location: {
                                                ...formData.location,
                                                address: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-full mt-2 p-2 border rounded"
                                    required
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-medium">Tags</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData?.tags?.join(", ")}
                                    onChange={handleChange}
                                    className="w-full mt-2 p-2 border rounded"
                                    required
                                    placeholder="Enter Comma Separated Values"
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
                            <div className="col-span-1">
                                <label className="block text-sm font-medium">Loader Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    className="w-full mt-2 p-2 border rounded"
                                    required
                                />
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
