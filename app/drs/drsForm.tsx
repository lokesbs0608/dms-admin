/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { getOrders } from "../utils/orders";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { getEmployees } from "../utils/employees";
import {
    createDRS,
    deleteDRSOrderById,
    getDRSById,
    updateDRS,
} from "../utils/drs";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    id: string | undefined;
}

const DrsDetailsModal = ({ isOpen, onClose, id }: Props) => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [filteredOrder, setFilteredOrders] = useState<IOrderTable[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [orders, setOrders] = useState<IOrderTable[]>([]);
    const [isChecked, setIsChecked] = useState(false);

    const [drsData, setDrsData] = useState<IDRSForm>({
        orderIds: [],
        hubId: "",
        status: "Out for Delivery",
        deliveryBoyId: "",
        vehicleNumber: "",
        gpsLocation: "",
    });

    const [showItems, setShowItems] = useState("");

    useEffect(() => {
        // Check if hub_id is present
        if (!user?.hub_id) return;

        // Set the filter string with source_hub_id
        const filterString = `status=Reached Destination Hub&destinationHubId=${user.hub_id}`;
        setDrsData({ ...drsData, hubId: user?.hub_id });

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
                if (user?.hub_id) {
                    await fetchEmployees();
                }
                if (id) {
                    const resp = await getDRSById(id);
                    if (resp?._id) {
                        setDrsData({
                            ...drsData,
                            ...resp,
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [id, user]);

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees(
                `status=Active&role=delivery_boy&hub_id=${user?.hub_id}`
            ); // API endpoint to fetch hubs;
            setEmployees(response);
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
    const handleOrderIdsToDrd = async (orders: any[]) => {
        try {
            const formattedOrderIDs = orders.map(
                (order: { _id: string; docketNumber: string }) => ({
                    _id: order._id,
                    docketNumber: order?.docketNumber,
                })
            );

            // Update manifest data with the new orderIDs
            const updatedDrsData = {
                ...drsData,
                orderIds: [...drsData?.orderIds, ...formattedOrderIDs],
            };

            setDrsData(updatedDrsData);
        } catch (error) {
            console.error("Error processing order IDs:", error);
            throw new Error("Failed to process order IDs");
        }
    };

    const deleteOrder = async (idsToDelete: string) => {
        try {
            const filterString = `status=Pending&status=Picked&status=Reached Destination Hub&sourceHubId=${drsData.hubId || ""
                }`;

            const resp = await deleteDRSOrderById(drsData._id || "", idsToDelete);

            if (
                resp?.message ===
                "Order removed from manifest and status updated successfully."
            ) {
                toast.success(
                    "Order removed from manifest and status updated successfully"
                );

                setDrsData((prevData) => ({
                    ...prevData,
                    orderIDs: resp?.updatedManifest?.orderIDs || [], // Ensure it updates correctly
                }));

                console.log(resp?.updatedManifest?.orderIDs, "Updated order IDs");

                fetchOrder(filterString);
            }
        } catch (error) {
            console.error("Error deleting order IDs:", error);
        }
    };

    const deleteOrderIdsFromTable = (idsToDelete: string[]) => {
        console.log(idsToDelete, "idsToDelete");
        try {
            if (!drsData?.orderIds || !Array.isArray(drsData.orderIds)) {
                throw new Error("Manifest data or order IDs are invalid");
            }

            // Filter out the orders that should be deleted
            const updatedOrderIDs = drsData.orderIds.filter(
                (order: { _id: string }) => !idsToDelete.includes(order._id)
            );

            // Update state only if something is actually removed
            if (updatedOrderIDs.length !== drsData.orderIds.length) {
                const updatedDrsData = {
                    ...drsData,
                    orderIds: updatedOrderIDs,
                };
                setDrsData(updatedDrsData);
            }
            // Find IDs that are not found in filteredOrder
            const idsNotFound2 = idsToDelete.filter(
                (id) => !filteredOrder.some((item) => item?._id === id)
            );

            // If some IDs were not found locally, call deleteOrder for those IDs
            if (idsNotFound2.length > 0) {
                deleteOrder(idsNotFound2.join(",")); // Assuming deleteOrder expects a string of IDs
            }
        } catch (error) {
            console.error("Error deleting order IDs:", error);
            throw new Error("Failed to delete order IDs");
        }
    };

    // Function to check if all filtered orders exist in the orderIDs
    const checkAllOrdersExist = () => {
        return filteredOrder?.every((order) =>
            drsData?.orderIds?.some(
                (existingOrder) => existingOrder._id === order._id
            )
        );
    };

    // Set checkbox checked state based on whether all filtered orders exist in orderIDs
    useEffect(() => {
        const allOrdersExist = checkAllOrdersExist();
        setIsChecked(allOrdersExist);
    }, [filteredOrder, drsData.orderIds]);

    // Handle checkbox change
    const handleCheckboxChange = (e: { target: { checked: boolean } }) => {
        if (e.target.checked) {
            // If checked, add the filtered orders to drsData
            handleOrderIdsToDrd(filteredOrder);
        } else {
            // If unchecked, reset orderIDs
            setDrsData({
                ...drsData,
                orderIds: [],
            });
        }
    };

    const handleManifestOrder = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (!drsData?.orderIds) return toast.error("No order Selected");

        if (id) {
            try {
                const resp = await updateDRS(id, drsData);
                if (
                    resp?.message ===
                    "DRS updated successfully"
                ) {
                    toast.success(
                        "DRS created successfully and orders/items marked as Out for Delivery."
                    );
                    onClose();
                }
            } catch (error) {
                console.log(error);
            } finally {
            }
        } else {
            try {
                const resp = await createDRS(drsData);
                if (
                    resp?.message ===
                    "DRS created successfully and orders/items marked as Out for Delivery."
                ) {
                    toast.success(
                        "DRS created successfully and orders/items marked as Out for Delivery."
                    );
                    onClose();
                }
            } catch (error) {
                console.log(error);
            } finally {
            }
        }
    };

    const checkDuplicateOrderId = (orderId: string): boolean => {
        // Check if the orderID exists in the drsData orderIDs array
        const isDuplicate = drsData?.orderIds?.some(
            (order: { _id: string }) => order._id === orderId
        );
        return isDuplicate; // Returns true if duplicate found, false otherwise
    };
    const deleteFromManifestTable = (orderId: string) => {
        const updatedOrders = drsData.orderIds.filter(
            (item) => item?._id !== orderId
        );
        setDrsData({ ...drsData, orderIds: updatedOrders });
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
                        <h2 className="text-2xl font-bold">DRS Details</h2>
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
                                <h2 className="font-bold mb-2">Employee</h2>
                                <select
                                    required
                                    onChange={(e) =>
                                        setDrsData({
                                            ...drsData,
                                            deliveryBoyId: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border rounded mb-4"
                                    value={drsData?.deliveryBoyId}
                                >
                                    <option value="">Select Loader </option>
                                    {employees.map((item) => (
                                        <option key={item?._id} value={item?._id}>
                                            {item?.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <h2 className="font-bold mb-2">GPS Location</h2>
                                <input
                                    type="url" // Use "text" to avoid built-in browser formatting for "number"
                                    placeholder="Gps Location"
                                    className="w-full p-2 border mb-2 rounded"
                                    value={drsData?.gpsLocation}
                                    name="docketNumber"
                                    onChange={(e) => {
                                        setDrsData({
                                            ...drsData,
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
                                    value={drsData?.vehicleNumber || ""}
                                    name="vehicleNumber"
                                    onChange={(e) => {
                                        const value = e.target.value.toUpperCase(); // Convert to uppercase
                                        const regex = /^[A-Z0-9]*$/; // Allow only letters and numbers during typing

                                        // Update value only if it matches allowed characters
                                        if (regex.test(value)) {
                                            setDrsData({
                                                ...drsData,
                                                vehicleNumber: value,
                                            });
                                        }
                                    }}
                                    onBlur={() => {
                                        const regex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/; // Full validation on blur
                                        if (!regex.test(drsData?.vehicleNumber || "")) {
                                            alert("Enter Valid Vehicle Number");
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex items-end justify-end">
                            <button
                                type="submit"
                                className="bg-green-500 mt-3 flex items-center justify-center w-90 m-4 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                            >
                                {id ? "Update DRS" : "Create DRS"}
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
                                        <div className="w-full  d-none"> No Pending Orders</div>
                                    ) : (
                                        <div>
                                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                <caption className="p-5 text-[#1d4ed8] text-lg font-semibold text-left rtl:text-right bg-white dark:text-white dark:bg-gray-800">
                                                    Pending Orders
                                                </caption>

                                                <thead className="text-xs text-[#1d4ed8] uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                    <tr>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-[#1d4ed8]"
                                                        >
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={handleCheckboxChange}
                                                                />
                                                            </label>
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-[#1d4ed8]"
                                                        >
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
                                                                    scope="col"
                                                                    className="px-6 py-3 text-[#1d4ed8]"
                                                                >
                                                                    <label>
                                                                        <input
                                                                            type="checkbox"
                                                                            onChange={(e) =>
                                                                                e.target?.checked
                                                                                    ? handleOrderIdsToDrd([order])
                                                                                    : deleteFromManifestTable(
                                                                                        order?._id || ""
                                                                                    )
                                                                            }
                                                                            className="cursor-pointer"
                                                                            checked={
                                                                                checkDuplicateOrderId(
                                                                                    order?._id || ""
                                                                                ) || false
                                                                            }
                                                                        />
                                                                    </label>
                                                                </th>
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
                                        </div>
                                    )}
                                </div>

                                <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-4">
                                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                        <caption className="p-5 text-[#1d4ed8] text-lg font-semibold text-left rtl:text-right bg-white dark:text-white dark:bg-gray-800">
                                            DRS Orders
                                        </caption>

                                        <thead className="text-xs text-[#1d4ed8] uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-[#1d4ed8]">
                                                    Docket Number
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {drsData?.orderIds?.map((order) => (
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

                                                        <td className="px-6 py-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    deleteOrderIdsFromTable([order?._id]);
                                                                }}
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

export default DrsDetailsModal;
