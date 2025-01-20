"use client";

import React, { useEffect, useState } from "react";
import { getOrders } from "../utils/orders";
import OrderDetailModal from "../components/atoms/orderModal";

const Orders = () => {
  const [hubs, setHubs] = useState<IOrderTable[]>([]);
  const [filteredHubs, setFilteredHubs] = useState<IOrderTable[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrderTable | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEmployees = async () => {
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
    fetchEmployees();
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
              <tr
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                key={order._id}
              >
                <th
                  scope="row"
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
                <td className="px-6 py-4">{order.status}</td>
                <td className="px-6 py-4">
                  <p
                    onClick={() => { setShowOrderModal(true); setSelectedOrder(order) }}
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



      <OrderDetailModal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} id={selectedOrder?._id} />



    </div>
  );
};

export default Orders;
