import { getCustomers } from "@/app/utils/customer";
import { getHubs } from "@/app/utils/hub";
import React, { useEffect, useState } from "react";

type Dimension = {
    height: string;
    width: string;
    length: string;
};

type Item = {
    weight: number | string | null;
    weightKg: number | string;
    dimension: Dimension | null;
};

const OrderForm: React.FC = () => {
    const [consignorId, setConsignorID] = useState<string | null>(null);
    const [consigneeId, setConsigneeID] = useState<string | null>(null);
    const [sourceHubId, setSourceHubId] = useState<string | null>(null);
    const [destinationHubId, setDestinationHubId] = useState<string | null>(null);
    const [consignor, setConsignor] = useState({
        name: "",
        companyName: "",
        address: "",
        city: "",
        pincode: "",
        number: "",
    });
    const [consignee, setConsignee] = useState({
        name: "",
        companyName: "",
        address: "",
        city: "",
        pincode: "",
        number: "",
    });
    const [items, setItems] = useState<Item[]>([]);
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [hubs, setHubs] = useState<IHub[]>([]);
    const [isAddingItems, setIsAddingItems] = useState<boolean>(false);
    const [tempItems, setTempItems] = useState<{
        weight: string;
        weightKg: number,
        weightGrams: number,
        dimension: Dimension;
        quantity: number;
    }>({
        weight: "",
        weightKg: 0,
        weightGrams: 0,
        dimension: { height: "", width: "", length: "" },
        quantity: 1,
    });

    const handleAddItems = (): void => {
        const { weight, dimension, quantity, weightGrams, weightKg } = tempItems;
        const totalWeight = (weightKg || 0) + (weightGrams || 0) / 1000;

        const dividedWeight = + totalWeight / quantity;
        const newItems: Item[] = Array.from({ length: quantity }, () => ({
            weight: dividedWeight.toFixed(3) || null,
            weightKg: "",
            dimension: weight ? null : { ...dimension },
        }));
        setItems((prevItems) => [...prevItems, ...newItems]);
        setIsAddingItems(false);
        setTempItems({
            weight: "",
            weightKg: 0,
            weightGrams: 0,
            dimension: { height: "", width: "", length: "" },
            quantity: 1,
        });
    };

    const handleRemoveItem = (index: number): void => {
        setItems(items.filter((_, i) => i !== index));
    };

    const fetchCustomers = async () => {
        try {
            const response = await getCustomers();
            setCustomers(response);
        } catch (error) {
            console.error("Error fetching customer:", error);
        }
    };


    const fetchHubs = async () => {
        try {
            const response = await getHubs(); // API endpoint to fetch hubs;
            setHubs(response);
        } catch (error) {
            console.error("Error fetching hubs:", error);
        }
    };

    // Fetch hubs from API
    useEffect(() => {
        fetchCustomers();
        fetchHubs()
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Create Order</h1>

            <div className="grid grid-cols-2 gap-6">
                <div className="mb-6">
                    <h2 className="font-bold mb-2">Docket Number</h2>
                    <input
                        type="text"
                        placeholder="Docket Number"
                        className="w-full p-2 border mb-2 rounded"
                    />
                </div>
                <div className="mb-6">
                    <h2 className="font-bold mb-2">Transport Type</h2>
                    <select
                        defaultValue={"surface"}
                        className="w-full p-2 border rounded"
                    >
                        <option value="surface">Surface</option>
                        <option value="train">Train</option>
                        <option value="air">Air</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                {/* Consignor Section */}
                <div className="mb-6">
                    <h2 className="font-bold mb-2">Consignor</h2>

                    <select
                        onChange={(e) => setConsignorID(e.target.value || null)}
                        className="w-full p-2 border rounded mb-4"
                    >
                        <option value="">Select Existing Customer</option>
                        {customers?.map((item) => (
                            <option key={item?._id} value={item?._id}>
                                {item?.company_name}
                            </option>
                        ))}
                    </select>

                    {!consignorId && (
                        <div>
                            <input
                                type="text"
                                placeholder="Company Name"
                                onChange={(e) =>
                                    setConsignor({ ...consignor, companyName: e.target.value })
                                }
                                value={consignor.companyName}
                                name="companyName"
                                id="companyName"
                                className="w-full p-2 border mb-2 rounded"
                            />
                            <input
                                type="text"
                                placeholder="Name"
                                className="w-full p-2 border mb-2 rounded"
                                onChange={(e) =>
                                    setConsignor({ ...consignor, name: e.target.value })
                                }
                                value={consignor.name}
                                name="name"
                                id="name"
                            />
                            <input
                                type="text"
                                placeholder="Address"
                                className="w-full p-2 border mb-2 rounded"
                                onChange={(e) =>
                                    setConsignor({ ...consignor, address: e.target.value })
                                }
                                value={consignor.address}
                                name="address"
                                id="address"
                            />
                            <input
                                type="text"
                                placeholder="City"
                                className="w-full p-2 border mb-2 rounded"
                                onChange={(e) =>
                                    setConsignor({ ...consignor, city: e.target.value })
                                }
                                value={consignor.city}
                                name="city"
                                id="city"
                            />
                            <input
                                type="text"
                                placeholder="Pincode"
                                className="w-full p-2 border mb-2 rounded"
                                onChange={(e) =>
                                    setConsignor({ ...consignor, pincode: e.target.value })
                                }
                                value={consignor.pincode}
                                name="pincode"
                                id="pincode"
                            />
                            <input
                                type="text"
                                placeholder="Phone Number"
                                className="w-full p-2 border mb-2 rounded"
                                onChange={(e) =>
                                    setConsignor({ ...consignor, number: e.target.value })
                                }
                                value={consignor.number}
                                name="number"
                                id="number"
                            />
                        </div>
                    )}
                </div>

                {/* Consignee Section */}
                <div className="mb-6">
                    <h2 className="font-bold mb-2">Consignee</h2>
                    <select
                        onChange={(e) => setConsigneeID(e.target.value || null)}
                        className="w-full p-2 border rounded mb-4"
                    >
                        <option value="">Select Existing Customer</option>
                        {customers
                            ?.filter((item) => item._id !== consignorId) // Exclude the selected consignor
                            .map((item) => (
                                <option key={item?._id} value={item?._id}>
                                    {item?.company_name}
                                </option>
                            ))}
                    </select>
                    {!consigneeId && (
                        <div>
                            <input
                                type="text"
                                placeholder="Company Name"
                                className="w-full p-2 border mb-2 rounded"
                                onChange={(e) =>
                                    setConsignee({ ...consignor, companyName: e.target.value })
                                }
                                value={consignee.companyName}
                                name="companyName"
                                id="companyName"
                            />
                            <input
                                type="text"
                                placeholder="Name"
                                className="w-full p-2 border mb-2 rounded"
                                onChange={(e) =>
                                    setConsignee({ ...consignee, name: e.target.value })
                                }
                                value={consignee.name}
                                name="name"
                                id="name"
                            />
                            <input
                                type="text"
                                placeholder="Address"
                                className="w-full p-2 border mb-2 rounded"
                                onChange={(e) =>
                                    setConsignee({ ...consignee, address: e.target.value })
                                }
                                value={consignee.address}
                                name="address"
                                id="address"
                            />
                            <input
                                type="text"
                                placeholder="City"
                                className="w-full p-2 border mb-2 rounded"
                                onChange={(e) =>
                                    setConsignee({ ...consignee, city: e.target.value })
                                }
                                value={consignee.city}
                                name="city"
                                id="city"
                            />
                            <input
                                type="text"
                                placeholder="Pincode"
                                className="w-full p-2 border mb-2 rounded"
                                onChange={(e) =>
                                    setConsignee({ ...consignee, pincode: e.target.value })
                                }
                                value={consignee.pincode}
                                name="pincode"
                                id="pincode"
                            />
                            <input
                                type="text"
                                placeholder="Phone Number"
                                className="w-full p-2 border mb-2 rounded"
                                onChange={(e) =>
                                    setConsignee({ ...consignee, number: e.target.value })
                                }
                                value={consignee.number}
                                name="number"
                                id="number"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Source/Destination Hub */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <h2 className="font-bold mb-2">Source Hub Id</h2>
                    <select
                        onChange={(e) => setSourceHubId(e.target.value || null)}
                        className="w-full p-2 border rounded mb-4"
                    >
                        <option value="">Select Source Hub</option>
                        {hubs
                            ?.filter((item) => item._id !== destinationHubId) // Exclude the selected consignor
                            .map((item) => (
                                <option key={item?._id} value={item?._id}>
                                    {item?.name}
                                </option>
                            ))}
                    </select>
                </div>
                <div>
                    <h2 className="font-bold mb-2">Destination Hub Id</h2>
                    <select
                        onChange={(e) => setDestinationHubId(e.target.value || null)}
                        className="w-full p-2 border rounded mb-4"
                    >
                        <option value="">Select Destination Hub</option>
                        {hubs
                            ?.filter((item) => item._id !== sourceHubId) // Exclude the selected consignor
                            .map((item) => (
                                <option key={item?._id} value={item?._id}>
                                    {item?.name}
                                </option>
                            ))}
                    </select>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                    <h2 className="font-bold mb-2">Payment Method</h2>
                    <select className="w-full p-2 border rounded">
                        <option value="">Select Payment Method</option>
                        <option value="prepaid">Prepaid</option>
                        <option value="cod">COD</option>
                    </select>
                </div>
            </div>

            {/* Items Section */}
            <div className="mb-6">
                <h2 className="font-bold mb-2">Items</h2>
                <button
                    className="p-2 bg-blue-500 text-white rounded mb-4"
                    onClick={() => setIsAddingItems(true)}
                >
                    Add Items
                </button>
                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <li
                            key={index}
                            className="flex justify-between items-center border p-2 rounded"
                        >
                            <span>
                                {item.weight
                                    ? `Item ${index + 1}: Weight ${item.weight}`
                                    : `Item ${index + 1}: Dimensions ${item.dimension?.height}x${item.dimension?.width
                                    }x${item.dimension?.length}`}
                            </span>
                            <button
                                className="text-red-500"
                                onClick={() => handleRemoveItem(index)}
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Adding Items Modal */}
            {isAddingItems && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                    <div className="relative bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Add Items</h2>
                        <div className="mb-4">
                            <label className="block mb-2">Weight :</label>
                            <div className="grid grid-cols-2 gap-6">
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded"
                                    value={tempItems.weightKg || ""}
                                    onChange={(e) =>
                                        setTempItems({
                                            ...tempItems,
                                            weightKg: parseFloat(e.target.value) || 0, // Parse to float or default to 0
                                        })
                                    }
                                    placeholder="KG"
                                />
                                <input
                                    type="number"
                                    maxLength={3} // Limit the number of characters entered
                                    max={999} // Ensure the maximum is 999
                                    className="w-full p-2 border rounded"
                                    value={tempItems.weightGrams || ""}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0; // Parse the input as an integer
                                        if (value <= 999) { // Allow only values less than or equal to 999
                                            setTempItems({
                                                ...tempItems,
                                                weightGrams: value,
                                            });
                                        }
                                    }}
                                    placeholder="Grams"
                                />

                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">Dimensions (if volumetric):</label>
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    type="number"
                                    placeholder="Height"
                                    className="p-2 border rounded"
                                    value={tempItems.dimension.height}
                                    onChange={(e) =>
                                        setTempItems({
                                            ...tempItems,
                                            dimension: {
                                                ...tempItems.dimension,
                                                height: e.target.value,
                                            },
                                        })
                                    }
                                />
                                <input
                                    type="number"
                                    placeholder="Width"
                                    className="p-2 border rounded"
                                    value={tempItems.dimension.width}
                                    onChange={(e) =>
                                        setTempItems({
                                            ...tempItems,
                                            dimension: {
                                                ...tempItems.dimension,
                                                width: e.target.value,
                                            },
                                        })
                                    }
                                />
                                <input
                                    type="number"
                                    placeholder="Length"
                                    className="p-2 border rounded"
                                    value={tempItems.dimension.length}
                                    onChange={(e) =>
                                        setTempItems({
                                            ...tempItems,
                                            dimension: {
                                                ...tempItems.dimension,
                                                length: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">Quantity:</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={tempItems.quantity}
                                onChange={(e) =>
                                    setTempItems({
                                        ...tempItems,
                                        quantity: Number(e.target.value),
                                    })
                                }
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="p-2 bg-gray-500 text-white rounded"
                                onClick={() => setIsAddingItems(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="p-2 bg-blue-500 text-white rounded"
                                onClick={handleAddItems}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <button className="p-3 bg-green-500 text-white rounded w-full">
                Create Order
            </button>
        </div>
    );
};

export default OrderForm;
