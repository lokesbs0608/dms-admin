/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { getHubs } from "../utils/hub";
import { getOrderById, getOrders } from "../utils/orders";
import { getLoader } from "../utils/loader";
import { useAuth } from "../hooks/useAuth";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    id: string | undefined;
}

const ManifestDetailsModal = ({ isOpen, onClose, id }: Props) => {
    const { user } = useAuth()
    const [hubs, setHubs] = useState<IHub[]>([]);
    const [loader, setLoader] = useState<ILoader[]>([]);
    const [filteredOrder, setFilteredOrders] = useState<IOrderTable[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [orders, setOrders] = useState<IOrderTable[]>([]);
    const [orderFilterString, setOrderFilterString] = useState(`status=Pending,Picked`);
    const [orderDetails, setOrderDetails] = useState<IManifest>({
        _id: "",
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

    const [showItems, setShowItems] = useState('')




    useEffect(() => {
        // Check if hub_id is present
        if (!user?.hub_id) return;

        // Set the filter string with source_hub_id
        const filterString = `status=Pending&status=Picked&sourceHubId=${user.hub_id}`;
        setOrderFilterString(filterString);
        setManifestData({ ...manifestData, sourceHubID: user?.hub_id })

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

    // Filter hubs based on search query
    useEffect(() => {
        const filtered = orders?.filter((hub) =>
            hub?.docketNumber.toLowerCase()?.includes(searchQuery?.toLowerCase())
        );
        setFilteredOrders(filtered);
    }, [orders, searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-end ">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-[80%] h-[100vh] overflow-y-auto shadow-lg rounded-lg">
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
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <h2 className="font-bold mb-2">Loader</h2>
                                <select
                                    required
                                    onChange={(e) =>
                                        setManifestData({
                                            ...orderDetails,
                                            loaderId: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border rounded mb-4"
                                    value={orderDetails?.loaderId}
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
                                    value={orderDetails?.driverContactNumber}
                                    name="driverContactNumber"
                                    required
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const regex = /^[6-9][0-9]{0,9}$/; // Allows 10 digits starting with 6-9

                                        // Update value only if it matches the regex or is empty
                                        if (regex.test(value) || value === "") {
                                            setOrderDetails({
                                                ...orderDetails,
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
                                    value={orderDetails?.gpsLocation}
                                    name="docketNumber"
                                    required
                                    onChange={(e) => {
                                        setOrderDetails({
                                            ...orderDetails,
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
                                    value={orderDetails?.vehicleNumber || ""}
                                    name="vehicleNumber"
                                    required
                                    onChange={(e) => {
                                        const value = e.target.value.toUpperCase(); // Convert to uppercase
                                        const regex = /^[A-Z0-9]*$/; // Allow only letters and numbers during typing

                                        // Update value only if it matches allowed characters
                                        if (regex.test(value)) {
                                            setOrderDetails({
                                                ...orderDetails,
                                                vehicleNumber: value,
                                            });
                                        }
                                    }}
                                    onBlur={() => {
                                        const regex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/; // Full validation on blur
                                        if (!regex.test(orderDetails?.vehicleNumber || "")) {
                                            alert("Enter Valid Vehicle Number");
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <h2 className="font-bold mb-2">Destination Hub Id</h2>
                                <select
                                    required
                                    onChange={(e) =>
                                        setManifestData({
                                            ...manifestData,
                                            destinationHubID: e.target.value,
                                        })
                                    }
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
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Search by Docket Number"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border rounded-lg px-4 py-2 w-full max-w-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            />

                            <div className="flex gap-12 items-start">
                                <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-4">
                                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                        <caption className="p-5 text-[#1d4ed8] text-lg font-semibold text-left rtl:text-right bg-white dark:text-white dark:bg-gray-800">
                                            Pending Orders
                                        </caption>

                                        <thead className="text-xs text-[#1d4ed8] uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-[#1d4ed8]">
                                                    <label>
                                                        <input type="checkbox" />
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
                                        <tbody  >
                                            {filteredOrder?.map((order, index) => (
                                                <>

                                                    <tr
                                                        key={`${order._id}_${index}_order`}
                                                      
                                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                                    >
                                                        <th scope="col" className="px-6 py-3 text-[#1d4ed8]">
                                                            <label>
                                                                <input type="checkbox" className="cursor-pointer" />

                                                            </label>
                                                        </th>
                                                        <th
                                                          onClick={() => setShowItems(showItems === order?._id ? '' : order?._id || '')}
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
                                                        <td className="px-6 py-4">{order.transport_type}</td>
                                                        <td className="px-6 py-4">{order.status}</td>
                                                    </tr>

                                                    <tr  >
                                                        {showItems === order?._id && (

                                                            <td colSpan={6} className="px-6 py-3">
                                                                <table className="w-full border border-gray-300 mt-2">
                                                                    <thead>
                                                                        <tr className="bg-gray-100 dark:bg-gray-700">
                                                                            <th scope="col" className="px-6 py-3 text-[#1d4ed8]">
                                                                                <label>
                                                                                    <input type="checkbox"  className="cursor-pointer"/>

                                                                                </label>
                                                                            </th>
                                                                            <th className="px-4 py-2 border">Item ID</th>
                                                                            <th className="px-4 py-2 border">Height</th>
                                                                            <th className="px-4 py-2 border">Length</th>
                                                                            <th className="px-4 py-2 border">Width</th>
                                                                            <th className="px-4 py-2 border">Weight</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {order?.items.map((item) => (
                                                                            <tr key={`${item.itemId}_items`} className="border-b">
                                                                                <th scope="col" className="px-6 py-3 text-[#1d4ed8]">
                                                                                    <label>
                                                                                        <input type="checkbox" />

                                                                                    </label>
                                                                                </th>
                                                                                <td className="px-4 py-2 border">{item.itemId}</td>
                                                                                <td className="px-4 py-2 border">{item.dimension?.height || "N/A"}</td>
                                                                                <td className="px-4 py-2 border">{item.dimension?.length || "N/A"}</td>
                                                                                <td className="px-4 py-2 border">{item.dimension?.width || "N/A"}</td>
                                                                                <td className="px-4 py-2 border">{item.weight || "N/A"}</td>
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
                                                <th scope="col" className="px-6 py-3">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrder?.map((order) => (
                                                <><tr
                                                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                                    key={`${order._id}_manifest_order}`}
                                                >

                                                    <th
                                                        scope="row"
                                                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
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
                                                    <td className="px-6 py-4">{order.transport_type}</td>
                                                    <td className="px-6 py-4">{order.status}</td>
                                                    <td className="px-6 py-4">
                                                        <button
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
