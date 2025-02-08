"use client";

import React, { useEffect, useState } from "react";
import { getOrders } from "../utils/orders";
import OrderDetailModal from "../components/atoms/orderModal";

const Orders = () => {
  const [hubs, setHubs] = useState<IOrderTable[]>([]);
  const [filteredHubs, setFilteredHubs] = useState<IOrderTable[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrderTable | null>(null);
  const [showItems, setShowItems] = useState('')
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await getOrders(); // API endpoint to fetch hubs;
      setHubs(response);
      setFilteredHubs(response); // Initially, filtered hubs are the same
    } catch (error) {
      console.error("Error fetching hubs:", error);
    }
  };

  // Fetch hubs from API
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter hubs based on search query
  useEffect(() => {
    const filtered = hubs?.filter((hub) =>
      hub?.docketNumber?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    );
    setFilteredHubs(filtered);
  }, [searchQuery, hubs]);





  return (
    <div className="h-screen overflow-auto py-2 ">
      <div className="flex items-center justify-between mx-2">
        <input
          type="text"
          placeholder="Search by Docket Number"
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
            Orders
          </caption>

          <thead className="text-xs text-[#1d4ed8] uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3 text-[#1d4ed8]">
                Docket No.
              </th>
              <th scope="col" className="px-6 py-3 text-[#1d4ed8]">
                Consigner Name
              </th>
              <th scope="col" className="px-6 py-3 text-[#1d4ed8]">
                Consignee Name
              </th>
              <th scope="col" className="px-6 py-3">
                Source
              </th>
              <th scope="col" className="px-6 py-3">
                Source Hub Id
              </th>
              <th scope="col" className="px-6 py-3">
                Destination
              </th>
              <th scope="col" className="px-6 py-3">
                Destination Hub Id
              </th>
              <th scope="col" className="px-6 py-3">
                Transport Type
              </th>
              <th scope="col" className="px-6 py-3">
                Payment Method
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
              <><tr

                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                key={order._id}
              >
                <th
                  scope="row"
                  onClick={() => setShowItems(showItems === order?._id ? '' : order?._id || '')}
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {order.docketNumber}
                </th>
                <td className="px-6 py-4">{order.consignor?.name}</td>
                <td className="px-6 py-4">{order.consignee?.name}</td>
                <td className="px-6 py-4">{order.sourceHubId?.name}</td>
                <td className="px-6 py-4">{order.sourceHubId?.hub_code}</td>
                {/* <td className="px-6 py-4">{order.consignor?.city}</td> */}
                <td className="px-6 py-4">{order.destinationHubId?.name}</td>
                <td className="px-6 py-4">{order.destinationHubId?.hub_code}</td>
                {/* <td className="px-6 py-4">{order.consignee?.city}</td> */}
                <td className="px-6 py-4">{order.transport_type}</td>
                <td className="px-6 py-4">{order.payment_method}</td>
                <td className="px-6 py-4">
                  <select
                    value={order?.status}
                    disabled={order?.status ==='Manifested'}
                    className={`px-3 py-2 border-2 rounded-md w-full focus:outline-none transition-all ${statusOptions.find((opt) => opt.value === order?.status)?.color || "text-gray-700 border-gray-300"}`}
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
                   hidden={order?.status ==='Manifested'}
                    onClick={() => { setShowOrderModal(true); setSelectedOrder(order); }}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    Edit
                  </p>

                </td>
              </tr><tr>
                  {showItems === order?._id && (

                    <td colSpan={6} className="px-6 py-3">
                      <table className="w-full border border-gray-300 mt-2">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-700">

                            <th className="px-4 py-2 border">Item ID</th>
                            <th className="px-4 py-2 border">Height</th>
                            <th className="px-4 py-2 border">Length</th>
                            <th className="px-4 py-2 border">Width</th>
                            <th className="px-4 py-2 border">Weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order?.items.map((item) => (
                            <tr key={item.itemId} className="border-b">

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

                </tr></>

            ))}
          </tbody>
        </table>
      </div>



      <OrderDetailModal isOpen={showOrderModal} onClose={() => { setShowOrderModal(false); setSelectedOrder(null); fetchOrders() }} id={selectedOrder?._id} />



    </div>
  );
};

export default Orders;

const statusOptions = [
  { label: "Picked", value: "Picked", color: "text-blue-600 border-blue-600" },
  { label: "Reached Source Branch", value: "Reached_Source_Branch", color: "text-green-600 border-green-600" },
  { label: "Reached Source Hub", value: "Reached_Source_Hub", color: "text-teal-600 border-teal-600" },
  { label: "In Transit", value: "In Transit", color: "text-yellow-600 border-yellow-600" },
  { label: "Reached Destination Hub", value: "Reached Destination Hub", color: "text-orange-600 border-orange-600" },
  { label: "Reached Destination Branch", value: "Reached Destination Branch", color: "text-orange-500 border-orange-500" },
  { label: "Pending", value: "Pending", color: "text-gray-600 border-gray-600" },
  { label: "Out For Delivery", value: "Out_For_Delivery", color: "text-purple-600 border-purple-600" },
  { label: "Delivered", value: "Delivered", color: "text-green-700 border-green-700" },
  { label: "Cancelled", value: "Cancelled", color: "text-red-600 border-red-600" },
  { label: "Manifested", value: "Manifested", color: "text-indigo-600 border-indigo-600" },
];