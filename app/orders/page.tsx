/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { getOrders, updateOrderDocket } from "../utils/orders";
import OrderDetailModal from "../components/atoms/orderModal";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Loading from "../components/loader";
import { exportToExcel } from "../utils/uploadToEcxel";

const Orders = () => {
  const { user } = useAuth();
  const [hubs, setHubs] = useState<IOrderTable[]>([]);
  const [filteredHubs, setFilteredHubs] = useState<IOrderTable[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrderTable | null>(null);
  const [showItems, setShowItems] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState("sourceHubId"); // Tracks the selected option
  const [selectedStatus, setSelectedStatus] = useState(""); // Selected status option
  const [filterString, setFilterString] = useState<string>(
    `sourceHubId=${user?.hub_id}`
  );

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Function to trigger file input click
  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Use optional chaining to handle null cases
    if (file) {
      handleUpload(file);
    }
  };

  // Upload Image to Server
  const handleUpload = async (file: File) => {
    // Define 'file' as a 'File' type
    if (!file) {
      alert("Please select an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const response = await axios.post<{ imageUrl: string; message: string }>(
        "http://localhost:5000/api/upload-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (!selectedOrder?._id) {
        console.error("Order ID is missing");
        return;
      }
      const resp = await updateOrderDocket(selectedOrder._id, {
        docket_url: response?.data?.imageUrl,
      });
      if (resp?.message === "docket_url updated successfully!") {
        toast.success(response?.data?.message);
        fetchOrders();
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Image upload failed!");
    } finally {
      setUploading(false);
    }
  };

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
    if (!user?.hub_id) return;
    fetchOrders();
  }, [filterString]);

  useEffect(() => {
    if (!user?.hub_id) return;
    setFilterString(`sourceHubId=${user?.hub_id}`);
  }, [user?.hub_id]);

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
    console.log(newFilterString);
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const statusValue = event.target.value;
    setSelectedStatus(statusValue);

    const newFilterString =
      statusValue === "all"
        ? `${selectedOption}`
        : `status=${statusValue}&${selectedOption}`;

    setFilterString(newFilterString);
    console.log(newFilterString);
  };

  const handleDownload = () => {
    const updatedFilteredOrder = filteredHubs.map((order) => ({
      ...order, // Spread existing order properties
      total_pcs: order.items?.length || 0, // Ensure it defaults to 0 if undefined
      total_weight: order.items?.reduce(
        (sum, items) => sum + (Number(items?.weight) || 0), // Convert weight to a number
        0
      )
    }));

    const keys = {
      docketNumber: "Docket Number",
      "consignor.name": "Consignor Name",
      "consignee.name": "Consignee Name",
      "sourceHubId.name": "Origin Hub",
      "destinationHubId.name": "Destination Hub",
      transport_type: "Transport Type",
      payment_method: "Payment Method",
      total_pcs: "Total Pieces",
      total_weight: "Total Weight",
      status: "Order Status",
      amount: "Total Amount",
      docket_url: "Acknowledgement",
      pickup_date: "Pickup Date",
      delivery_date: "Delivered Date",
    };

    // Format current date in "DD-MM-YYYY" format
    const currentDate = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    const fileName = `Orders_Report_${currentDate}`;

    exportToExcel(updatedFilteredOrder, keys, fileName);
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
            className={`px-4 transition-all py-2 rounded-lg font-medium bg-blue-200 text-blue-600 ${selectedOption.includes("sourceHubId")
              ? "opacity-100"
              : " scale-50 opacity-40 "
              } hover:bg-blue-500 hover:text-white`}
          >
            Out Bound
          </button>
          <button
            onClick={() => handleFilter("outbound")}
            className={`px-4 transition-all py-2 rounded-lg font-medium bg-green-100 opacity-80 text-green-600 ${selectedOption.includes("destinationHubId")
              ? "opacity-100"
              : " scale-50 opacity-40 "
              } hover:bg-green-500 hover:text-white`}
          >
            In Bound
          </button>
        </div>
        <select
          id="status"
          value={selectedStatus}
          onChange={handleStatusChange}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value={"all"}>All</option>
          {statusOptions.map((option) => (
            <option
              key={`${option.value}_table_status`}
              className={`${option?.color || "text-gray-700 border-gray-300"}`}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
        <p
          onClick={() => handleDownload()}
          className="text-white  cursor-pointer  bg-indigo-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-4 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
                Origin Hub
              </th>

              <th scope="col" className="px-6 py-3">
                Destination Hub
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
                Acknowledgement
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredHubs?.map((order, index) => (
              <>
                <tr
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  key={order._id || index} // Fallback to index if _id is missing
                >
                  <th
                    scope="row"
                    onClick={() =>
                      setShowItems(
                        showItems === order?._id ? "" : order?._id || ""
                      )
                    }
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {order.docketNumber}
                  </th>
                  <td className="px-6 py-4">{order.consignor?.name}</td>
                  <td className="px-6 py-4">{order.consignee?.name}</td>
                  {/* <td className="px-6 py-4">{order.sourceHubId?.name}</td> */}
                  <td className="px-6 py-4">{order.sourceHubId?.name}</td>
                  {/* <td className="px-6 py-4">{order.consignor?.city}</td> */}
                  {/* <td className="px-6 py-4">{order.destinationHubId?.name}</td> */}
                  <td className="px-6 py-4">{order.destinationHubId?.name}</td>
                  {/* <td className="px-6 py-4">{order.consignee?.city}</td> */}
                  <td className="px-6 py-4">{order.transport_type}</td>
                  <td className="px-6 py-4">{order.payment_method}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order?.status}
                      disabled={order?.status === "Manifested"}
                      className={`px-3 py-2 border-2 rounded-md w-full focus:outline-none transition-all ${statusOptions.find((opt) => opt.value === order?.status)
                        ?.color || "text-gray-700 border-gray-300"
                        }`}
                    >
                      {statusOptions.map((option) => (
                        <option
                          key={`${option.value}_table_status`}
                          className={`${option?.color || "text-gray-700 border-gray-300"
                            }`}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p
                      hidden={order?.status === "Manifested"}
                      className="flex items-center justify-center"
                    >
                      {order?.docket_url ? (
                        <Link href={order?.docket_url} target="_blank">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 25.6 25.6"
                            className="icon"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12.8 4c8 0 12.8 8.8 12.8 8.8s-4.8 8.8-12.8 8.8S0 12.8 0 12.8 4.8 4 12.8 4m0 1.6c-5.632 0-9.603 5.202-10.92 7.2C3.195 14.797 7.166 20 12.8 20c5.632 0 9.603-5.202 10.92-7.2-1.315-1.997-5.286-7.2-10.92-7.2m0 1.6a5.6 5.6 0 1 1 0 11.2 5.6 5.6 0 0 1 0-11.2m0 1.6a4.005 4.005 0 0 0-4 4c0 2.205 1.794 4 4 4s4-1.795 4-4-1.794-4-4-4" />
                          </svg>
                        </Link>
                      ) : (
                        <div className="p-4 flex flex-col items-center">
                          {/* Hidden Input Field */}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="hidden"
                          />

                          {/* Clickable Upload Icon */}
                          <div
                            onClick={() => {
                              setSelectedOrder(order);
                              handleIconClick();
                            }}
                            className="cursor-pointer p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 1 1"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M.747.375H.75A.2.2 0 0 1 .882.43a.19.19 0 0 1 0 .265A.2.2 0 0 1 .75.75H.625V.687H.75a.125.125 0 0 0 0-.25H.693L.685.383A.16.16 0 0 0 .552.25a.155.155 0 0 0-.163.094L.368.392.317.38.283.375a.15.15 0 0 0-.11.046.156.156 0 0 0 .11.267h.156v.063H.283A.22.22 0 0 1 .119.679.22.22 0 0 1 .094.42.22.22 0 0 1 .241.316a.2.2 0 0 1 .092.003A.22.22 0 0 1 .562.19a.22.22 0 0 1 .185.185M.643.616.561.534v.34H.499V.536l-.08.08L.375.572.509.438h.044l.135.134z"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p
                      hidden={order?.status === "Manifested"}
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
                <tr>
                  {showItems === order?._id && (
                    <td
                      key={`${order?._id}_items`}
                      colSpan={6}
                      className="px-6 py-3"
                    >
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

      <OrderDetailModal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedOrder(null);
          fetchOrders();
        }}
        id={selectedOrder?._id}
      />
      <Loading loading={uploading} />
    </div>
  );
};

export default Orders;

const statusOptions = [
  { label: "Picked", value: "Picked", color: "text-blue-600 border-blue-600" },

  {
    label: "Reached Origin Hub",
    value: "Reached Source Hub",
    color: "text-teal-600 border-teal-600",
  },
  {
    label: "In Transit",
    value: "In Transit",
    color: "text-yellow-600 border-yellow-600",
  },
  {
    label: "Reached Destination Hub",
    value: "Reached Destination Hub",
    color: "text-orange-600 border-orange-600",
  },

  {
    label: "Pending",
    value: "Pending",
    color: "text-gray-600 border-gray-600",
  },
  {
    label: "Out For Delivery",
    value: "Out for Delivery",
    color: "text-purple-600 border-purple-600",
  },
  {
    label: "Delivered",
    value: "Delivered",
    color: "text-green-700 border-green-700",
  },
  {
    label: "Cancelled",
    value: "Cancelled",
    color: "text-red-600 border-red-600",
  },
  {
    label: "Manifested",
    value: "Manifested",
    color: "text-indigo-600 border-indigo-600",
  },
  { label: "RTO", value: "RTO", color: "text-red-600 border-red-600" },
];
