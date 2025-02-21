/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { getOrders } from "../utils/orders";
import OrderDetailModal from "../components/atoms/orderModal";
import { useAuth } from "../hooks/useAuth";

const Orders = () => {
  const { user } = useAuth()
  const [hubs, setHubs] = useState<IOrderTable[]>([]);
  const [filteredHubs, setFilteredHubs] = useState<IOrderTable[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrderTable | null>(null);
  const [showItems, setShowItems] = useState('')
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState("sourceHubId"); // Tracks the selected option
  const [selectedStatus, setSelectedStatus] = useState(""); // Selected status option
  const [filterString, setFilterString] = useState<string>(`sourceHubId=${user?.hub_id}`);

  const fetchOrders = async () => {

    try {
      const response = await getOrders(filterString); // API endpoint to fetch hubs;
      setHubs(response);
      setFilteredHubs(response); // Initially, filtered hubs are the same
    } catch (error) {
      console.error("Error fetching hubs:", error);
    }
  };

  // Fetch hubs from API
  useEffect(() => {
    if (!user?.hub_id) return
    fetchOrders();
  }, [filterString]);

  useEffect(() => {
    if (!user?.hub_id) return
    setFilterString(`sourceHubId=${user?.hub_id}`)
  }, [user?.hub_id])

  // Filter hubs based on search query
  useEffect(() => {
    const filtered = hubs?.filter((hub) =>
      hub?.docketNumber?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    );
    setFilteredHubs(filtered);
  }, [searchQuery, hubs]);


  const handleFilter = (type: string) => {

    let hubFilter = "";
    switch (type) {
      case "inbound":
        hubFilter = `sourceHubId=${user?.hub_id}`;
        break;
      case "outbound":
        hubFilter = `destinationHubId=${user?.hub_id}`;
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


  return (
    <div className="h-screen overflow-auto py-2 ">
      <div className="flex items-center justify-start gap-4 mx-2">
        <input
          type="text"
          placeholder="Search by Docket Number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full max-w-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex gap-4">
          <button
            onClick={() => handleFilter("inbound")}
            className={`px-4 transition-all py-2 rounded-lg font-medium bg-blue-200 text-blue-600 ${selectedOption.includes('sourceHubId')  ? "opacity-100" : " scale-50 opacity-40 "
              } hover:bg-blue-500 hover:text-white`}
          >
            In Bound
          </button>
          <button
            onClick={() => handleFilter("outbound")}
            className={`px-4 transition-all py-2 rounded-lg font-medium bg-green-100 opacity-80 text-green-600 ${selectedOption.includes('destinationHubId') ? "opacity-100" : " scale-50 opacity-40 "
              } hover:bg-green-500 hover:text-white`}
          >
            Out Bound
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
                Source Hub Id
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
            {filteredHubs?.map((order, index) => (
              < >
                <tr

                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  key={order._id || index} // Fallback to index if _id is missing
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
                  {/* <td className="px-6 py-4">{order.sourceHubId?.name}</td> */}
                  <td className="px-6 py-4">{order.sourceHubId?.hub_code}</td>
                  {/* <td className="px-6 py-4">{order.consignor?.city}</td> */}
                  {/* <td className="px-6 py-4">{order.destinationHubId?.name}</td> */}
                  <td className="px-6 py-4">{order.destinationHubId?.hub_code}</td>
                  {/* <td className="px-6 py-4">{order.consignee?.city}</td> */}
                  <td className="px-6 py-4">{order.transport_type}</td>
                  <td className="px-6 py-4">{order.payment_method}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order?.status}
                      disabled={order?.status === 'Manifested'}
                      className={`px-3 py-2 border-2 rounded-md w-full focus:outline-none transition-all ${statusOptions.find((opt) => opt.value === order?.status)?.color || "text-gray-700 border-gray-300"}`}
                    >
                      {statusOptions.map((option) => (
                        <option key={`${option.value}_table_status`} className={`${option?.color || "text-gray-700 border-gray-300"}`} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <p
                      hidden={order?.status === 'Manifested'}
                      onClick={() => { setShowOrderModal(true); setSelectedOrder(order); }}
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    >
                      Edit
                    </p>

                  </td>
                </tr><tr>
                  {showItems === order?._id && (

                    <td key={`${order?._id}_items`} colSpan={6} className="px-6 py-3">
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

                </tr>
              </>

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
 
  { label: "Reached Source", value: "Reached_Source_Hub", color: "text-teal-600 border-teal-600" },
  { label: "In Transit", value: "In Transit", color: "text-yellow-600 border-yellow-600" },
  { label: "Reached Destination", value: "Reached Destination Hub", color: "text-orange-600 border-orange-600" },
 
  { label: "Pending", value: "Pending", color: "text-gray-600 border-gray-600" },
  { label: "Out For Delivery", value: "Out_For_Delivery", color: "text-purple-600 border-purple-600" },
  { label: "Delivered", value: "Delivered", color: "text-green-700 border-green-700" },
  { label: "Cancelled", value: "Cancelled", color: "text-red-600 border-red-600" },
  { label: "Manifested", value: "Manifested", color: "text-indigo-600 border-indigo-600" },
];