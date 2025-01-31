/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { getHubs } from "../utils/hub";
import { getOrderById, getOrders } from "../utils/orders";
import { getLoader } from "../utils/loader";
import { useAuth } from "../hooks/useAuth";
import {
    createBatch,
    deleteBatchItems,
    getBatchOrder,
} from "../utils/manifest";
import toast from "react-hot-toast";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    id: string | undefined;
}
interface Batch {
    _id: string;
    items_count: string;
    docketNumber?: string;
    // Add the other fields from your Batch model if needed
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
        batchIDs: [],
        destinationHubID: "",
        driverContactNumber: "",
        estimatedDeliveryDate: "",
        gpsLocation: "",
        loaderId: "",
        no_ofBatch: "",
        no_ofIndividualOrder: "",
        orderIDs: [],
        sourceHubID: "",
        status: "Pending",
        totalPcs: "",
        totalWeight: "",
        transport_type: "",
        vehicleNumber: "",
    });
    const [batchOrder, setBatchOrder] = useState<IBatch[]>([]);

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
                await fetchBatchOrder();

                if (id) {
                    const resp = await getOrderById(id);
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
    const fetchBatchOrder = async () => {
        try {
            const resp = await getBatchOrder(`status=Picked`);
            if (resp?.message === "No batches found") {
                setBatchOrder([]);
                setManifestData({ ...manifestData, batchIDs: [] });
                return;
            } else {
                // Define the temporary array to hold batch orders
                const temp: IOrderReference[] = [];
                const batchIDs: Batch[] = [];

                // Array of static colors for batch orders with lighter shades
                const colors = [
                    "#FFB3B3",
                    "#A5D6A7",
                    "#81D4FA",
                    "#FFF176",
                    "#D1C4E9",
                    "#FFCC80",
                    "#80DEEA",
                    "#C8E6C9",
                ];

                // Loop through the ordersIDs of the response and format data
                resp.forEach(
                    (
                        batch: {
                            ordersIDs: { parent_id: { _id: string }; items: [] }[];
                            _id: string;
                        },
                        index: number
                    ) => {
                        const color = colors[index % colors.length]; // Cycle through colors based on index

                        batch?.ordersIDs?.forEach(
                            (order: { parent_id: { _id: string }; items: [] }) => {
                                const ordersIDs = {
                                    parent_id: order.parent_id?._id, // Assuming parent_id is part of the order
                                    items: order.items, // Assuming items is an array in the order
                                    _id: batch._id, // Adding batch _id to the orders
                                    color: color, // Adding color to each batch order
                                };
                                temp.push(ordersIDs); // Push the formatted order to the temporary array
                                batchIDs.push({
                                    _id: batch?._id,
                                    items_count: order?.items?.length.toString(),
                                });
                            }
                        );
                    }
                );
                setManifestData({ ...manifestData, batchIDs: batchIDs });

                // Now transform the temp array into the correct format for batch order
                const primary: IBatch[] = [];
                temp.forEach((items) => {
                    const ordersIDs = {
                        ordersIDs: [items], // Wrap the items inside an ordersIDs array
                    };
                    primary.push(ordersIDs);
                });

                // Set the state with the transformed batch order data
                setBatchOrder(primary);


            }
        } catch (error) {
            console.log(error);
        }
    };

    // Filter hubs based on search query
    useEffect(() => {
        const filtered = orders?.filter((hub) =>
            hub?.docketNumber.toLowerCase()?.includes(searchQuery?.toLowerCase())
        );
        setFilteredOrders(filtered);
    }, [orders, searchQuery]);

    const createBatchOrder = (parentID: string, item: Item) => {
        const orderIDItems = manifestData?.orderIDs?.filter((order) => order?._id); // Get all matching orders
        const filterOrderItems = filteredOrder?.filter((order) => orderIDItems.some(o => o._id === order._id));

        // Find the order in orderIDItems that matches the parentID
        const matchingOrder = orderIDItems.find(o => o._id?.toString() === parentID);
        const matchingFilterOrder = filterOrderItems?.find(order => order._id === parentID);

        // Get the total count of items for this specific parentID from orderIDItems
        const orderItemsCount = matchingOrder ? +matchingOrder.items_count || 0 : 0;

        // Get total count of items for this specific parentID from batchOrder
        const batchItemsCount = batchOrder?.reduce((total, batch) => {
            return total + (batch.ordersIDs?.reduce((sum, order) =>
                order.parent_id === parentID ? sum + (order.items?.length || 0) : sum
                , 0) || 0);
        }, 0) || 0;

        // Get total count of items for this specific parentID from filteredOrder
        const filterOrderItemsCount = matchingFilterOrder ? matchingFilterOrder.items.length || 0 : 0;

        console.log(`ParentID: ${parentID} | Total: ${orderItemsCount + batchItemsCount} | Allowed: ${filterOrderItemsCount}`);

        // ✅ FIX: Allow batch if manifest data count is 0 (items_count === 0)
        if (orderItemsCount > 0 && (orderItemsCount + batchItemsCount) >= filterOrderItemsCount) {
            return toast.error(`Batch Cannot be created for Parent ID: ${parentID} due to docket number already in manifest Table`);
        }



        setBatchOrder((prevBatchOrder: IBatch[]) => {
            // Check if there is an order with the given parentID in the batch
            const existingOrder = prevBatchOrder.find((batch) =>
                batch.ordersIDs?.some((order) => order.parent_id === parentID)
            );

            if (existingOrder) {
                return prevBatchOrder
                    .map((batch) => {
                        if (batch.ordersIDs) {
                            // Find the specific order within ordersIDs
                            const updatedOrders = batch.ordersIDs
                                .map((order) => {
                                    if (order.parent_id === parentID) {
                                        const itemExists = order.items?.some(
                                            (existingItem: { itemId: string | undefined }) =>
                                                existingItem.itemId === item.itemId
                                        );

                                        if (itemExists) {
                                            // If the item exists, remove it (same parentId and itemId)
                                            const updatedItems = order.items?.filter(
                                                (existingItem: { itemId: string | undefined }) =>
                                                    existingItem.itemId !== item.itemId
                                            );
                                            return updatedItems?.length
                                                ? { ...order, items: updatedItems }
                                                : undefined; // Remove order if items are empty
                                        } else {
                                            // If the item does not exist, add it
                                            return {
                                                ...order,
                                                items: [...(order.items || []), item],
                                            };
                                        }
                                    }
                                    return order;
                                })
                                .filter((order) => order !== undefined) as IOrderReference[]; // Remove undefined orders

                            return { ...batch, ordersIDs: updatedOrders };
                        }
                        return batch;
                    })
                    .filter((batch) => batch.ordersIDs?.length); // Remove batches with no orders
            } else {
                // If the parentID does not exist, create a new OrderReference
                const newOrder: IOrderReference = {
                    parent_id: parentID,
                    items: [item],
                };
                const newBatch: IBatch = { ordersIDs: [newOrder] };
                return [...prevBatchOrder, newBatch];
            }
        });
    };
    const isItemChecked = (parentID: string, itemId: string) => {
        // Find the batch that contains the specific order with the parentID and itemId
        const existingOrder = batchOrder.find((batch) =>
            batch.ordersIDs?.some(
                (order) =>
                    order.parent_id === parentID &&
                    order.items?.some(
                        (item: { itemId: string }) => item.itemId === itemId
                    )
            )
        );

        // If an order is found, retrieve the color from the corresponding batch and return both found status and color
        if (existingOrder) {
            const orderWithColor = existingOrder?.ordersIDs?.find(
                (order) =>
                    order.parent_id === parentID &&
                    order.items?.some(
                        (item: { itemId: string }) => item.itemId === itemId
                    )
            );

            // Return true and the color associated with the batch
            const color = orderWithColor?.color || "#FFFFFF"; // Default color if not found
            return { found: true, color, batchId: orderWithColor?._id || null };
        }

        // Return false and no color if not found
        return { found: false, color: "#FFFFFF" };
    };

    const handleBatchCreate = async () => {
        try {
            await createBatch(batchOrder);
            fetchBatchOrder();
        } catch (error) {
            console.log(error);
        }
    };
    const handleRemoveItems = async (batchId: string, itemID: string) => {
        try {
            const encodedItemId = encodeURIComponent(itemID);
            await deleteBatchItems(batchId, encodedItemId);
            fetchBatchOrder();
        } catch (error) {
            console.log(error);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleOrderIdsToManifest = async (orders: any[]) => {
        try {
            console.log(":Formatted Order", orders);

            const formattedOrderIDs = orders.map(
                (order: { _id: string; docketNumber: string; items: Item[] }) => ({
                    _id: order._id,
                    items: order?.items || [],
                    docketNumber: order?.docketNumber,
                })
            );

            // Initialize a Map with existing manifest data
            const updatedOrderIDsMap = new Map<string, Batch>(
                (manifestData?.orderIDs || []).map((order: Batch) => [order._id, order])
            );

            // Process each order and update the map
            formattedOrderIDs.forEach((order) => {
                const { _id, items: newItems, docketNumber } = order;

                // Check if an existing batch matches the `_id`
                const batchOrdersIDs = batchOrder?.[0]?.ordersIDs || [];
                const existingBatch = batchOrdersIDs.find(
                    (batch: IOrderReference) => batch?.parent_id === _id
                );

                if (existingBatch) {
                    const existingItems = new Set(
                        existingBatch.items.map((item: Item) => item.itemId)
                    );

                    // Filter out duplicate items
                    const uniqueItems = newItems.filter(
                        (item: Item) => !existingItems.has(item.itemId)
                    );

                    // Remove the existing `_id` and replace it with the new data
                    updatedOrderIDsMap.delete(_id);
                    if (uniqueItems.length > 0) {
                        updatedOrderIDsMap.set(_id, {
                            _id,
                            items_count: uniqueItems.length.toString(),
                            docketNumber,
                        });
                    }
                } else {
                    // If no matching parent_id exists, ensure no duplicate `_id`
                    updatedOrderIDsMap.delete(_id);
                    updatedOrderIDsMap.set(_id, {
                        _id,
                        items_count: newItems.length.toString(),
                        docketNumber,
                    });
                }
            });

            // Convert Map back to an array for manifestData
            const updatedOrderIDs = Array.from(updatedOrderIDsMap.values());

            // Update manifest data with the new orderIDs
            const updatedManifestData = {
                ...manifestData,
                orderIDs: updatedOrderIDs,
            };

            setManifestData(updatedManifestData);
        } catch (error) {
            console.error("Error processing order IDs:", error);
            throw new Error("Failed to process order IDs");
        }
    };

    const deleteOrderIds = (idsToDelete: string[]) => {
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
    const deleteBatchIds = (batchIdsToDelete: string[]) => {
        try {
            console.log("Batch IDs to delete:", batchIdsToDelete);

            if (!manifestData?.batchIDs || !Array.isArray(manifestData.batchIDs)) {
                throw new Error("Manifest data or batch IDs are invalid");
            }

            // Filter out batches with matching _id
            const updatedBatchIDs = manifestData.batchIDs.filter(
                (batch: { _id: string }) => !batchIdsToDelete.includes(batch._id)
            );

            // Update the manifest data with the filtered batch IDs
            const updatedManifestData = {
                ...manifestData,
                batchIDs: updatedBatchIDs,
            };

            // Update the state
            setManifestData(updatedManifestData);
            console.log(
                "Updated Manifest Data after batch deletion:",
                updatedManifestData
            );
        } catch (error) {
            console.error("Error deleting batch IDs:", error);
            throw new Error("Failed to delete batch IDs");
        }
    };

    const checkDuplicateOrderId = (orderId: string): boolean => {
        // Check if the orderID exists in the manifestData orderIDs array
        const isDuplicate = manifestData?.orderIDs?.some(
            (order: { _id: string }) => order._id === orderId
        );

        return isDuplicate; // Returns true if duplicate found, false otherwise
    };

    // Function to check if all filtered orders exist in the orderIDs
    const checkAllOrdersExist = () => {
        return filteredOrder.every((order) =>
            manifestData.orderIDs.some(
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

    const validateAllCounts = () => {
        // Get total count from orderIDs
        const orderItemsCount = manifestData?.orderIDs?.reduce(
            (total, order) => total + (+order.items_count || 0),
            0
        ) || 0;

        // Get total count from batchOrder
        const batchItemsCount = batchOrder?.reduce((total, batch) => {
            return total + (batch.ordersIDs?.reduce((sum, order) => sum + (order.items?.length || 0), 0) || 0);
        }, 0) || 0;

        // Call this function to find unique parent IDs
        const uniqueIds = findUniqueParentIDs();

        // Calculate the total item count for these unique parent IDs from filteredOrder
        const uniqueParentItemsCount = uniqueIds.reduce((total, parentID) => {
            const filteredItemsCount = filteredOrder
                ?.filter(order => order._id === parentID) // Filter orders by parentID
                .reduce((sum, order) => sum + (order.items?.length || 0), 0) || 0;

            return total + filteredItemsCount;
        }, 0);
        // Get total count from filteredOrder
        const orderListItemsCount = filteredOrder?.reduce(
            (total, order) => total + (order.items?.length || 0),
            0
        ) || 0;

        console.log(`OrderIDs Items Count: ${orderItemsCount}`);
        console.log(`BatchOrder Items Count: ${batchItemsCount}`);
        console.log(`FilteredOrder Items Count: ${uniqueParentItemsCount}`);

        // ✅ Condition: The sum of orderItemsCount and batchItemsCount should be <= orderListItemsCount
        if (orderItemsCount + batchItemsCount <= orderListItemsCount) {
            return true;
        }

        toast.error("Batch Cannot be created due to count mismatch.");
    };

    const findUniqueParentIDs = () => {
        // Extract parent IDs from orderIDs (manifestData)
        const orderParentIDs = new Set(manifestData?.orderIDs?.map(order => order._id));

        // Extract parent IDs from batchOrder
        const batchParentIDs = new Set(batchOrder?.flatMap(batch => batch.ordersIDs?.map(order => order.parent_id) || []));

        // Find intersection (common parent IDs in both orderIDs and batchOrder)
        const commonParentIDs = [...orderParentIDs].filter(parentID => batchParentIDs.has(parentID));

        console.log("Unique Parent IDs found in both orderIDs and batchOrder:", commonParentIDs);

        return commonParentIDs;
    };

    useEffect(() => {
        validateAllCounts()
    }, [manifestData])




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

                    <div>
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
                                    placeholder="Vehicle Number"
                                    className="w-full p-2 border mb-2 rounded"
                                    value={manifestData?.driverContactNumber}
                                    name="driverContactNumber"
                                    required
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
                                    required
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
                                    required
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
                                    className="w-full p-2 border rounded mb-4"
                                    placeholder="Estimated Delivery Date"
                                    type="date"
                                />
                            </div>
                            <div>
                                <h2 className="font-bold mb-2">Actual Weight</h2>
                                <input
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
                                    className="w-full p-2 border rounded mb-4"
                                    placeholder="Estimated Delivery Date"
                                    type="number"
                                />
                            </div>
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Search by Docket Number"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border rounded-lg px-4 py-2 w-full max-w-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div>
                                {batchOrder?.length >= 1 && (
                                    <button
                                        onClick={() => handleBatchCreate()}
                                        className="bg-green-500 mt-3 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                                    >
                                        Create Batch
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-6 items-start">
                                <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-4">
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
                                                            scope="col"
                                                            className="px-6 py-3 text-[#1d4ed8]"
                                                        >
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    onChange={(e) =>
                                                                        e.target?.checked
                                                                            ? handleOrderIdsToManifest([order])
                                                                            : deleteOrderIds([order?._id || ""])
                                                                    }
                                                                    className="cursor-pointer"
                                                                    checked={
                                                                        checkDuplicateOrderId(order?._id || "") ||
                                                                        false
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
                                                                                Action
                                                                            </th>
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
                                                                                style={{
                                                                                    background: `${isItemChecked(
                                                                                        order?._id || "",
                                                                                        item?.itemId
                                                                                    )?.color || "#FFFFFF"
                                                                                        }`, // Default to white if no color is found
                                                                                }}
                                                                            >
                                                                                <th scope="col" className="px-6 py-3 ">
                                                                                    {!isItemChecked(
                                                                                        order?._id || "",
                                                                                        item?.itemId
                                                                                    )?.batchId ? (
                                                                                        <label>
                                                                                            <input
                                                                                                key={item?.itemId}
                                                                                                checked={
                                                                                                    isItemChecked(
                                                                                                        order?._id || "",
                                                                                                        item?.itemId
                                                                                                    )?.found
                                                                                                }
                                                                                                onChange={() =>
                                                                                                    createBatchOrder(
                                                                                                        order?._id || "",
                                                                                                        item
                                                                                                    )
                                                                                                }
                                                                                                type="checkbox"
                                                                                            />
                                                                                        </label>
                                                                                    ) : (
                                                                                        <div
                                                                                            onClick={() =>
                                                                                                handleRemoveItems(
                                                                                                    isItemChecked(
                                                                                                        order?._id || "",
                                                                                                        item?.itemId
                                                                                                    )?.batchId || "",
                                                                                                    item?.itemId
                                                                                                )
                                                                                            }
                                                                                            className="text-red-500 cursor-pointer"
                                                                                        >
                                                                                            Remove
                                                                                        </div>
                                                                                    )}
                                                                                </th>
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

                                                <th scope="col" className="px-6 py-3">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {manifestData?.batchIDs?.map((order) => (
                                                <>
                                                    <tr
                                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                                        key={`${order}_manifest_order}`}
                                                    >
                                                        <th
                                                            scope="row"
                                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                                        >
                                                            {order?._id}
                                                        </th>
                                                        <th
                                                            scope="row"
                                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                                        >
                                                            {order?.items_count}
                                                        </th>

                                                        <td className="px-6 py-4">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteBatchIds([order?._id || ""])
                                                                }
                                                                className="ml-4 font-medium text-red-600 dark:text-red-500 hover:underline"
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                </>
                                            ))}
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

                                                        <td className="px-6 py-4">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteOrderIds([order?._id || ""])
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManifestDetailsModal;
