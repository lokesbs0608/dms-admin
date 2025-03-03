/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from 'react';
import axios from 'axios';

const DocketNumberSearch = () => {
  const [docketNumber, setDocketNumber] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDocketDetails = async () => {
    if (!docketNumber) {
      setError('Please enter a docket number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_COMMON_BASE_URL}orders?docketNumber=${docketNumber}`);
      setData(response.data.orders[0]); // Assuming first order is relevant
    } catch (err) {
      setError('No details found for this docket number');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Docket Number Search</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter Docket Number"
          value={docketNumber}
          onChange={(e) => setDocketNumber(e.target.value)}
          className="border rounded p-2 flex-grow"
        />
        <button
          onClick={fetchDocketDetails}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {data && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Docket Details</h3>
          <table className="w-full border border-gray-300">
            <tbody>
              <tr>
                <td className="border px-4 py-2 font-semibold">Docket Number</td>
                <td className="border px-4 py-2">{data.docketNumber}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-semibold">Status</td>
                <td className="border px-4 py-2">{data.status}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-semibold">Origin Hub</td>
                <td className="border px-4 py-2">{data.sourceHubId?.name || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-semibold">Destination Hub</td>
                <td className="border px-4 py-2">{data.destinationHubId?.name || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-semibold">Consignor</td>
                <td className="border px-4 py-2">{data.consignor?.name || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-semibold">Consignee</td>
                <td className="border px-4 py-2">{data.consignee?.name || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-semibold">Total Items</td>
                <td className="border px-4 py-2">{data.items?.length || 0}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-semibold">Total Weight</td>
                <td className="border px-4 py-2">
                  {data.items?.reduce((sum, item) => sum + (item.weight || 0), 0)} kg
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocketNumberSearch;
