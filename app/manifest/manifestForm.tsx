/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { getHubs } from "../utils/hub";
import { getOrders } from "../utils/orders";
import { getLoader } from "../utils/loader";
import { useAuth } from "../hooks/useAuth";
import {
    createManifest,
    deleteOrderIds,
    getManifestById,
    updateManifest,
} from "../utils/manifest";
import toast from "react-hot-toast";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    id: string | undefined;
}

const ManifestDetailsModal = ({ isOpen, onClose, id }: Props) => {
    const { user } = useAuth();
    const [hubs, setHubs] = useState<IHub[]>([]);
    const [loader, setLoader] = useState<ILoader[]>([]);
    const [filteredOrder, setFilteredOrders] = useState<IOrderTable[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [orders, setOrders] = useState<IOrderTable[]>([]);
    const [isChecked, setIsChecked] = useState(false);

    const [manifestData, setManifestData] = useState<IManifest>({
        actualWeight: "",
        destinationHubID: "",
        driverContactNumber: "",
        estimatedDeliveryDate: "",
        gpsLocation: "",
        loaderId: "",
        no_ofIndividualOrder: "",
        orderIDs: [],
        sourceHubID: "",
        status: "Pending",
        totalPcs: "",
        totalWeight: "",
        transport_type: "",
        vehicleNumber: "",
    });

    const [showItems, setShowItems] = useState("");

    useEffect(() => {
        // Check if hub_id is present
        if (!user?.hub_id) return;

        // Set the filter string with source_hub_id
        const filterString = `status=Pending&status=Picked&sourceHubId=${user.hub_id}`;
        setManifestData({ ...manifestData, sourceHubID: user?.hub_id });

        // Fetch orders after the filter string is updated
        fetchOrder(filterString);
    }, [user?.hub_id]);

    const fetchOrder = async (filterString: string) => {
        try {
            const response = await getOrders(filterString); // API endpoint to fetch hubs;
            setOrders(response);
            setFilteredOrders(response); // Initially, filtered hubs are the same
        } catch (error) {
            console.error("Error fetching hubs:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchLoader();
                await fetchHubs();

                if (id) {
                    const resp = await getManifestById(id);
                    if (resp?._id) {
                        setManifestData({
                            ...manifestData,
                            ...resp,
                            loaderId: resp?.loaderId?._id,
                            sourceHubID: resp?.sourceHubID?._id,
                            destinationHubID: resp?.destinationHubID?._id,
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [id]);

    const fetchHubs = async () => {
        try {
            const response = await getHubs(); // API endpoint to fetch hubs;
            setHubs(response);
        } catch (error) {
            console.error("Error fetching hubs:", error);
        }
    };

    const fetchLoader = async () => {
        try {
            const response = await getLoader(); // API endpoint to fetch hubs;
            setLoader(response);
        } catch (error) {
            console.error("Error fetching hubs:", error);
        }
    };

    // Filter hubs based on search query
    useEffect(() => {
        const filtered = orders?.filter((hub) =>
            hub?.docketNumber.toLowerCase()?.includes(searchQuery?.toLowerCase())
        );
        setFilteredOrders(filtered);
    }, [orders, searchQuery]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleOrderIdsToManifest = async (orders: any[]) => {
        try {
            const formattedOrderIDs = orders.map(
                (order: {
                    _id: string;
                    docketNumber: string;
                    items: ItemDetails[];
                }) => ({
                    _id: order._id,
                    items_count: order?.items?.length, // Convert to string
                    docketNumber: order?.docketNumber,
                    total_weight: order?.items?.reduce(
                        (sum, item) => sum + (Number(item?.weight) || 0),
                        0
                    ),
                    items: order?.items,
                })
            );

            // Update manifest data with the new orderIDs
            const updatedManifestData = {
                ...manifestData,
                orderIDs: formattedOrderIDs,
            };

            setManifestData(updatedManifestData);
        } catch (error) {
            console.error("Error processing order IDs:", error);
            throw new Error("Failed to process order IDs");
        }
    };

    const deleteOrder = async (idsToDelete: string) => {
        try {
            const filterString = `status=Pending&status=Picked&sourceHubId=${manifestData.sourceHubID || ""}`;
            const resp = await deleteOrderIds(id || "", idsToDelete);
            console.log(resp, '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
            if (resp?.message === 'Order removed from manifest and status updated successfully.') {
                toast.success('Order removed from manifest and status updated successfully')
                setManifestData({
                    ...manifestData,
                    orderIDs: resp?.updatedManifest?.orderIds

                })
                console.log(resp?.updatedManifest?.orderIds)
                fetchOrder(filterString);
            }
        } catch (error) {
            console.error("Error deleting order IDs:", error);
            throw new Error("Failed to delete order IDs");
        }
    };
    const deleteOrderIdsFromTable = (idsToDelete: string[]) => {
        try {
            console.log("IDs to delete:", idsToDelete);

            if (!manifestData?.orderIDs || !Array.isArray(manifestData.orderIDs)) {
                throw new Error("Manifest data or order IDs are invalid");
            }

            // Filter out orders with matching _id
            const updatedOrderIDs = manifestData.orderIDs.filter(
                (order: { _id: string }) => !idsToDelete.includes(order._id)
            );

            // Update the manifest data with the filtered orders
            const updatedManifestData = {
                ...manifestData,
                orderIDs: updatedOrderIDs,
            };

            // Update the state
            setManifestData(updatedManifestData);
            console.log("Updated Manifest Data after deletion:", updatedManifestData);
        } catch (error) {
            console.error("Error deleting order IDs:", error);
            throw new Error("Failed to delete order IDs");
        }
    };

    // Function to check if all filtered orders exist in the orderIDs
    const checkAllOrdersExist = () => {
        return filteredOrder?.every((order) =>
            manifestData?.orderIDs?.some(
                (existingOrder) => existingOrder._id === order._id
            )
        );
    };

    // Set checkbox checked state based on whether all filtered orders exist in orderIDs
    useEffect(() => {
        const allOrdersExist = checkAllOrdersExist();
        setIsChecked(allOrdersExist);
    }, [filteredOrder, manifestData.orderIDs]);

    // Handle checkbox change
    const handleCheckboxChange = (e: { target: { checked: boolean } }) => {
        if (e.target.checked) {
            // If checked, add the filtered orders to manifestData
            handleOrderIdsToManifest(filteredOrder);
        } else {
            // If unchecked, reset orderIDs
            setManifestData({
                ...manifestData,
                orderIDs: [],
            });
        }
    };

    const validateAllCounts = async () => {
        // Get total count from orderIDs
        const orderItemsCount =
            manifestData?.orderIDs?.reduce(
                (total, order) => total + (+order.items_count || 0),
                0
            ) || 0;

        // Get total weight from orderIDs
        const orderItemsWeight =
            manifestData?.orderIDs?.reduce(
                (total, order) => total + (Number(order.total_weight) || 0),
                0
            ) || 0;
        setManifestData({
            ...manifestData,

            no_ofIndividualOrder: orderItemsCount.toString(),
            actualWeight: orderItemsWeight.toFixed(3).toString(),
            totalPcs: orderItemsCount.toFixed(1).toString(),
        });
    };

    useEffect(() => {
        validateAllCounts();
    }, [manifestData?.orderIDs]);

    const handleManifestOrder = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (!manifestData?.orderIDs) return toast.error('No order Selected');
        if (manifestData?.totalWeight >= manifestData?.actualWeight) return toast.error('Please check Loader weight')

        if (id) {
            try {
                const resp = await updateManifest(id, manifestData);
                if (
                    resp?.message === "Manifest updated successfully"
                ) {
                    toast.success("Manifest updated successfully");
                    onClose();
                }
            } catch (error) {
                console.log(error);
            } finally {
            }
        } else {
            try {
                const resp = await createManifest(manifestData);
                if (
                    resp?.message === "Manifest created successfully and orders updated."
                ) {
                    toast.success("Manifest created successfully and orders updated.");
                    onClose();
                }
            } catch (error) {
                console.log(error);
            } finally {
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-end ">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-[100%] h-[100vh] overflow-y-auto shadow-lg rounded-lg">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Manifest Details</h2>
                        <button
                            className="p-2 bg-red-500 text-white rounded"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                    <form onSubmit={handleManifestOrder}>
                        <div className="grid grid-cols-5 gap-6">
                            <div>
                                <h2 className="font-bold mb-2">Loader</h2>
                                <select
                                    required
                                    onChange={(e) =>
                                        setManifestData({
                                            ...manifestData,
                                            loaderId: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border rounded mb-4"
                                    value={manifestData?.loaderId}
                                >
                                    <option value="">Select Loader </option>
                                    {loader.map((item) => (
                                        <option key={item?._id} value={item?._id}>
                                            {item?.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <h2 className="font-bold mb-2">Driver Number</h2>
                                <input
                                    type="text" // Use "text" to avoid built-in browser formatting for "number"
                                    placeholder="Driver Contact Number"
                                    className="w-full p-2 border mb-2 rounded"
                                    value={manifestData?.driverContactNumber}
                                    name="driverContactNumber"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const regex = /^[6-9][0-9]{0,9}$/; // Allows 10 digits starting with 6-9

                                        // Update value only if it matches the regex or is empty
                                        if (regex.test(value) || value === "") {
                                            setManifestData({
                                                ...manifestData,
                                                driverContactNumber: value,
                                            });
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <h2 className="font-bold mb-2">GPS Location</h2>
                                <input
                                    type="url" // Use "text" to avoid built-in browser formatting for "number"
                                    placeholder="Gps Location"
                                    className="w-full p-2 border mb-2 rounded"
                                    value={manifestData?.gpsLocation}
                                    name="docketNumber"
                                    onChange={(e) => {
                                        setManifestData({
                                            ...manifestData,
                                            gpsLocation: e.target.value,
                                        });
                                    }}
                                />
                            </div>
                            <div>
                                <h2 className="font-bold mb-2">Vehicle Number</h2>
                                <input
                                    type="text"
                                    placeholder="KA02KR0232"
                                    className="w-full p-2 border mb-2 rounded"
                                    value={manifestData?.vehicleNumber || ""}
                                    name="vehicleNumber"
                                    onChange={(e) => {
                                        const value = e.target.value.toUpperCase(); // Convert to uppercase
                                        const regex = /^[A-Z0-9]*$/; // Allow only letters and numbers during typing

                                        // Update value only if it matches allowed characters
                                        if (regex.test(value)) {
                                            setManifestData({
                                                ...manifestData,
                                                vehicleNumber: value,
                                            });
                                        }
                                    }}
                                    onBlur={() => {
                                        const regex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/; // Full validation on blur
                                        if (!regex.test(manifestData?.vehicleNumber || "")) {
                                            alert("Enter Valid Vehicle Number");
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <h2 className="font-bold mb-2">Destination Hub Id</h2>
                                <select
                                    required
                                    onChange={(e) => {
                                        setManifestData({
                                            ...manifestData,
                                            destinationHubID: e.target.value,
                                        });
                                        const filterString = `status=Pending&status=Picked&sourceHubId=${user?.hub_id || ""
                                            }&destinationHubId=${e.target.value}&transport_type=${manifestData?.transport_type
                                            }`;
                                        fetchOrder(filterString);
                                    }}
                                    className="w-full p-2 border rounded mb-4"
                                    value={manifestData?.destinationHubID}
                                >
                                    <option value="">Select Destination Hub</option>
                                    {hubs
                                        ?.filter((item) => item._id !== manifestData?.sourceHubID) // Exclude the selected consignor
                                        .map((item) => (
                                            <option key={item?._id} value={item?._id}>
                                                {item?.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div>
                                <h2 className="font-bold mb-2">Transport Type</h2>
                                <select
                                    required
                                    onChange={(e) => {
                                        setManifestData({
                                            ...manifestData,
                                            transport_type: e.target.value,
                                        });
                                        const filterString = `status=Pending&status=Picked&sourceHubId=${user?.hub_id || ""
                                            }&destinationHubId=${manifestData?.destinationHubID
                                            }&transport_type=${e.target.value}`;
                                        fetchOrder(filterString);
                                    }}
                                    className="w-full p-2 border rounded mb-4"
                                    value={manifestData?.transport_type}
                                >
                                    {" "}
                                    <option value="">All</option>
                                    <option value="surface">Surface</option>
                                    <option value="train">Train</option>
                                    <option value="air">Air</option>
                                    <option value="sea">Sea</option>
                                </select>
                            </div>

                            <div>
                                <h2 className="font-bold mb-2">Estimated Delivery Date</h2>
                                <input
                                    onChange={(e) =>
                                        setManifestData({
                                            ...manifestData,
                                            estimatedDeliveryDate: e.target.value,
                                        })
                                    }
                                    value={manifestData?.estimatedDeliveryDate.split("T")[0]}
                                    className="w-full p-2 border rounded mb-4"
                                    placeholder="Estimated Delivery Date"
                                    type="date"
                                />
                            </div>
                            <div>
                                <h2 className="font-bold mb-2">Actual Weight</h2>
                                <input
                                    value={manifestData?.actualWeight}
                                    disabled
                                    onChange={(e) =>
                                        setManifestData({
                                            ...manifestData,
                                            actualWeight: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border rounded mb-4"
                                    placeholder="Estimated Delivery Date"
                                    type="number"
                                />
                            </div>
                            <div>
                                <h2 className="font-bold mb-2">Loader Weight</h2>
                                <input
                                    onChange={(e) =>
                                        setManifestData({
                                            ...manifestData,
                                            totalWeight: e.target.value,
                                        })
                                    }
                                    value={manifestData?.totalWeight}
                                    className="w-full p-2 border rounded mb-4"
                                    placeholder="Loader weight"
                                    type="number"
                                />
                            </div>
                            <div>
                                Individual Order Pcs : {manifestData?.no_ofIndividualOrder}{" "}
                                <br /> Total Pcs : {+manifestData?.no_ofIndividualOrder}
                            </div>
                        </div>
                        <div className="flex items-end justify-end">
                            <button
                                type="submit"
                                className="bg-green-500 mt-3 flex items-center justify-center w-90 m-4 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                            >
                                {id ? "Update Manifest" : "Create Manifest"}
                            </button>
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Search by Docket Number"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border rounded-lg px-4 py-2 w-full max-w-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            />

                            <div className="flex gap-6 items-start">
                                <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-4">
                                    {filteredOrder.length < 1 ? (
                                        <div className="w-full  d-none">  No Pending Orders</div>
                                    ) : (
                                        <div>
                                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                <caption className="p-5 text-[#1d4ed8] text-lg font-semibold text-left rtl:text-right bg-white dark:text-white dark:bg-gray-800">
                                                    Pending Orders
                                                </caption>

                                                <thead className="text-xs text-[#1d4ed8] uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-[#1d4ed8]">
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={handleCheckboxChange}
                                                                />
                                                            </label>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-[#1d4ed8]">
                                                            Docket Number
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
                                                            Status
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredOrder?.map((order, index) => (
                                                        <>
                                                            <tr
                                                                key={`${order._id}_${index}_order`}
                                                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                                            >
                                                                <th
                                                                    onClick={() =>
                                                                        setShowItems(
                                                                            showItems === order?._id
                                                                                ? ""
                                                                                : order?._id || ""
                                                                        )
                                                                    }
                                                                    scope="row"
                                                                    className="px-6 cursor-pointer py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                                                >
                                                                    {order.docketNumber}
                                                                </th>

                                                                <td className="px-6 py-4">
                                                                    {order.sourceHubId?.hub_code}
                                                                </td>
                                                                {/* <td className="px-6 py-4">{order.consignor?.city}</td> */}
                                                                <td className="px-6 py-4">
                                                                    {order.destinationHubId?.hub_code}
                                                                </td>
                                                                {/* <td className="px-6 py-4">{order.consignee?.city}</td> */}
                                                                <td className="px-6 py-4">
                                                                    {order.transport_type}
                                                                </td>
                                                                <td className="px-6 py-4">{order.status}</td>
                                                            </tr>

                                                            <tr>
                                                                {showItems === order?._id && (
                                                                    <td colSpan={6} className="px-6 py-3">
                                                                        <table className="w-full border border-gray-300 mt-2">
                                                                            <thead>
                                                                                <tr className="bg-gray-100 dark:bg-gray-700">
                                                                                    {" "}
                                                                                    <th className="px-4 py-2 border">
                                                                                        Item ID
                                                                                    </th>
                                                                                    <th className="px-4 py-2 border">
                                                                                        Height
                                                                                    </th>
                                                                                    <th className="px-4 py-2 border">
                                                                                        Length
                                                                                    </th>
                                                                                    <th className="px-4 py-2 border">
                                                                                        Width
                                                                                    </th>
                                                                                    <th className="px-4 py-2 border">
                                                                                        Weight
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {order?.items.map((item) => (
                                                                                    <tr
                                                                                        key={`${item.itemId}_items`}
                                                                                        className="border "
                                                                                    >
                                                                                        <td className="px-4 py-2 border">
                                                                                            {item.itemId}
                                                                                        </td>
                                                                                        <td className="px-4 py-2 border">
                                                                                            {item.dimension?.height || "N/A"}
                                                                                        </td>
                                                                                        <td className="px-4 py-2 border">
                                                                                            {item.dimension?.length || "N/A"}
                                                                                        </td>
                                                                                        <td className="px-4 py-2 border">
                                                                                            {item.dimension?.width || "N/A"}
                                                                                        </td>
                                                                                        <td className="px-4 py-2 border">
                                                                                            {item.weight || "N/A"}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        </>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>)}



                                </div>

                                <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-4">
                                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                        <caption className="p-5 text-[#1d4ed8] text-lg font-semibold text-left rtl:text-right bg-white dark:text-white dark:bg-gray-800">
                                            Manifest Orders
                                        </caption>

                                        <thead className="text-xs text-[#1d4ed8] uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-[#1d4ed8]">
                                                    Docket Number / Batch Id
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-[#1d4ed8]">
                                                    No Of Pieces
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-[#1d4ed8]">
                                                    Total Weight
                                                </th>

                                                <th scope="col" className="px-6 py-3">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {manifestData?.orderIDs?.map((order) => (
                                                <>
                                                    <tr
                                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                                        key={`${order}_manifest_order}`}
                                                    >
                                                        <th
                                                            scope="row"
                                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                                        >
                                                            {order?.docketNumber}
                                                        </th>
                                                        <th
                                                            scope="row"
                                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                                        >
                                                            {order?.items_count}
                                                        </th>
                                                        <th>{order?.total_weight}</th>

                                                        <td className="px-6 py-4">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    order?.items[0].status === "Manifested"
                                                                        ? deleteOrder(order?._id)
                                                                        : deleteOrderIdsFromTable([order?._id])
                                                                }
                                                                className="ml-4 font-medium text-red-600 dark:text-red-500 hover:underline"
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                </>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManifestDetailsModal;
