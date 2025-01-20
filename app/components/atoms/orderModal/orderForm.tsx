import { getCustomers } from "@/app/utils/customer";
import { getHubs } from "@/app/utils/hub";
import { createOrder, getOrderById, updateOrder } from "@/app/utils/orders";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Dimension = {
    height: string;
    width: string;
    length: string;
};

type Item = {
    weight: number | string | null;
    weightKg?: number | string;
    dimension: {
        height: string;
        width: string;
        length: string;
    };
    itemId: string;
    price?: string
};

interface Props {
    id: string | undefined
}


const OrderForm = ({ id }: Props) => {
    console.log(id)
    const [orderDetails, setOrderDetails] = useState<IOrder>({
        destinationHubId: "",
        docketNumber: "",
        payment_method: "",
        pickedVehicleNumber: "",
        sourceHubId: "",
        status: "Picked",
        transport_type: "surface",
        consignee: {
            address: "",
            city: "",
            companyName: "",
            name: "",
            number: "",
            pincode: "",
        },
        consignor: {
            address: "",
            city: "",
            companyName: "",
            name: "",
            number: "",
            pincode: "",
        },
        consigneeId: "",
        consignorId: "",
        items: [],
    });
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
        weightKg?: number;
        weightGrams?: number;
        dimension: Dimension;
        quantity: number;
        itemId: string;
    }>({
        weight: "",

        dimension: { height: "", width: "", length: "" },
        quantity: 1,
        itemId: "",
    });

    const handleAddItems = (): void => {
        const { dimension, quantity, weightGrams, weightKg } = tempItems;
        const totalWeight = (weightKg || 0) + (weightGrams || 0) / 1000;

        const dividedWeight = +totalWeight / quantity;

        // Generate new items based on the quantity
        const newItems: Item[] = Array.from({ length: quantity }, () => ({
            weight: dividedWeight.toFixed(3) || null,
            weightKg: "",
            dimension: { ...dimension },
            itemId: "", // Temporary placeholder for itemId
        }));

        // Combine existing items and new items, then regenerate itemIds for all
        const updatedItems = [...items, ...newItems].map((item, index) => ({
            ...item,
            itemId: `${orderDetails?.docketNumber} / ${index + 1}`, // Update itemId for all items
        }));

        // Update the state with the updated items
        setItems(updatedItems);

        // Reset the form state
        setIsAddingItems(false);
        setTempItems({
            weight: "",
            dimension: { height: "", width: "", length: "" },
            quantity: 1,
            itemId: "",
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
    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchCustomers();
                await fetchHubs();

                if (id) {
                    const resp = await getOrderById(id);
                    setOrderDetails(resp);
                    setItems(resp?.items)
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [id]);



    const validateForm = () => {
        const errors = [];

        // Docket number validation
        if (!orderDetails.docketNumber.trim()) {
            errors.push("Docket number is required.");
        }

        // Vehicle number validation
        const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
        if (!vehicleRegex.test(orderDetails.pickedVehicleNumber)) {
            errors.push("Enter a valid vehicle number (e.g., KA 02 KR 0232).");
        }

        const phoneRegex = /^[6-9][0-9]{9}$/;
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!orderDetails?.consigneeId) {
            // Phone number validation
            if (!phoneRegex.test(orderDetails?.consignee?.number || '')) {
                errors.push("Enter a valid consignee phone number.");
            }

            if (!pincodeRegex.test(orderDetails?.consignee?.pincode || "")) {
                errors.push("Enter a valid consignee pincode.");
            }
            if (!orderDetails?.consignee?.address?.trim()) {
                errors.push("Consignee address is required.");
            }
        }
        if (!orderDetails?.consignorId) {

            if (!phoneRegex.test(orderDetails?.consignor?.number || "")) {
                errors.push("Enter a valid consignor phone number.");
            }


            if (!pincodeRegex.test(orderDetails?.consignor?.pincode || '')) {
                errors.push("Enter a valid consignor pincode.");
            }

            // Address validation

            if (!orderDetails?.consignor?.address?.trim()) {
                errors.push("Consignor address is required.");
            }
        }
        // Return errors
        return errors;
    };

    const handleOrderCreate = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();


        // Validate the form
        const errors = validateForm();
        if (errors.length > 0) {
            // Show errors using toast
            errors.forEach((error) => toast.error(error));
            return;
        }


        const obj: IOrder = {
            ...orderDetails,
            consignor: consignor,
            consignee: consignee,
            items: items
        };


        if (id) {
            try {
                const resp = await updateOrder(id, obj);
                if (resp) {
                    toast.success(resp?.message)
                }

            } catch (error) {
                console.log(error);
            }
        } else {
            try {
                const resp = await createOrder(obj);
                if (resp) {
                    toast.success(resp?.message)
                }

            } catch (error) {
                console.log(error);
            }
        }

    };

    return (
        <form onSubmit={handleOrderCreate} className="p-4">
            <h1 className="text-2xl font-bold mb-6">Create Order</h1>

            <div className="grid grid-cols-3 gap-6">
                <div className="mb-6">
                    <h2 className="font-bold mb-2">Docket Number</h2>
                    <input
                        type="text" // Use "text" to avoid built-in browser formatting for "number"
                        placeholder="Docket Number"
                        className="w-full p-2 border mb-2 rounded"
                        value={orderDetails?.docketNumber}
                        name="docketNumber"
                        required
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                            setOrderDetails({ ...orderDetails, docketNumber: value });
                        }}
                    />
                </div>

                <div className="mb-6">
                    <h2 className="font-bold mb-2">Vehicle Number</h2>
                    <input
                        type="text"
                        placeholder="KA02KR0232"
                        className="w-full p-2 border mb-2 rounded"
                        value={orderDetails?.pickedVehicleNumber || ""}
                        name="pickedVehicleNumber"
                        required
                        onChange={(e) => {
                            const value = e.target.value.toUpperCase(); // Convert to uppercase
                            const regex = /^[A-Z0-9]*$/; // Allow only letters and numbers during typing

                            // Update value only if it matches allowed characters
                            if (regex.test(value)) {
                                setOrderDetails({
                                    ...orderDetails,
                                    pickedVehicleNumber: value,
                                });
                            }
                        }}
                        onBlur={() => {
                            const regex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/; // Full validation on blur
                            if (!regex.test(orderDetails?.pickedVehicleNumber || "")) {
                                alert('Enter Valid Vehicle Number')
                            }
                        }}
                    />
                </div>

                <div className="mb-6">
                    <h2 className="font-bold mb-2">Transport Type</h2>
                    <select
                        required
                        name={"transport_type"}
                        value={orderDetails?.transport_type}
                        onChange={(e) =>
                            setOrderDetails({
                                ...orderDetails,
                                transport_type: e.target.value,
                            })
                        }
                        className="w-full p-2 border rounded"
                    >
                        <option value="surface">Surface</option>
                        <option value="train">Train</option>
                        <option value="air">Air</option>
                        <option value="sea">Sea</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                {/* Consignor Section */}
                <div className="mb-6">
                    <h2 className="font-bold mb-2">Consignor</h2>

                    <select
                        name="consignorId"
                        onChange={(e) =>
                            setOrderDetails({ ...orderDetails, consignorId: e.target.value })
                        }
                        className="w-full p-2 border rounded mb-4"
                        value={orderDetails?.consignorId}
                    >
                        <option value="">Select Existing Customer</option>
                        {customers
                            ?.filter((item) => item._id !== orderDetails?.consigneeId) // Exclude the selected consignor
                            .map((item) => (
                                <option key={item?._id} value={item?._id}>
                                    {item?.company_name}
                                </option>
                            ))}
                    </select>

                    {!orderDetails?.consignorId && (
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
                                required
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
                                required
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
                                required
                            />
                            <input
                                type="text"
                                placeholder="City"
                                className="w-full p-2 border mb-2 rounded"
                                onChange={(e) =>
                                    setConsignor({ ...consignor, city: e.target.value })
                                }
                                value={consignor.city}
                                required
                                name="city"
                                id="city"
                            />
                            <input
                                type="text"
                                placeholder="Pincode"
                                className="w-full p-2 border mb-2 rounded"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const regex = /^[1-9][0-9]{0,5}$/; // Validates up to 6 digits and starts with 1-9

                                    // Allow input only if it matches the regex or is empty
                                    if (regex.test(value) || value === "") {
                                        setConsignor({ ...consignor, pincode: value });
                                    }
                                }}
                                value={consignor.pincode || ""}
                                required
                                name="pincode"
                                id="pincode"
                            />

                            <input
                                type="text"
                                placeholder="Phone Number"
                                required
                                className="w-full p-2 border mb-2 rounded"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const regex = /^[6-9][0-9]{0,9}$/; // Allows 10 digits starting with 6-9

                                    // Update value only if it matches the regex or is empty
                                    if (regex.test(value) || value === "") {
                                        setConsignor({ ...consignor, number: value });
                                    }
                                }}
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
                        required
                        onChange={(e) =>
                            setOrderDetails({ ...orderDetails, consigneeId: e.target.value })
                        }
                        className="w-full p-2 border rounded mb-4"
                        value={orderDetails?.consigneeId}
                    >
                        <option value="">Select Existing Customer</option>
                        {customers
                            ?.filter((item) => item._id !== orderDetails?.consignorId) // Exclude the selected consignor
                            .map((item) => (
                                <option key={item?._id} value={item?._id}>
                                    {item?.company_name}
                                </option>
                            ))}
                    </select>
                    {!orderDetails?.consigneeId && (
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
                                required
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
                                required
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
                                required
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
                                required
                            />

                            <input
                                type="text"
                                placeholder="Pincode"
                                className="w-full p-2 border mb-2 rounded"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const regex = /^[1-9][0-9]{0,5}$/; // Validates up to 6 digits and starts with 1-9

                                    // Allow input only if it matches the regex or is empty
                                    if (regex.test(value) || value === "") {
                                        setConsignee({ ...consignee, pincode: value });
                                    }
                                }}
                                value={consignee.pincode || ""}
                                required
                                name="pincode"
                                id="pincode"
                            />
                            <input
                                type="text"
                                placeholder="Phone Number"
                                className="w-full p-2 border mb-2 rounded"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const regex = /^[6-9][0-9]{0,9}$/; // Allows 10 digits starting with 6-9

                                    // Update value only if it matches the regex or is empty
                                    if (regex.test(value) || value === "") {
                                        setConsignee({ ...consignee, number: value });
                                    }
                                }}
                                value={consignee.number || ""}
                                name="number"
                                required
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
                        required
                        value={orderDetails?.sourceHubId}
                        onChange={(e) =>
                            setOrderDetails({ ...orderDetails, sourceHubId: e.target.value })
                        }
                        className="w-full p-2 border rounded mb-4"
                    >
                        <option value="">Select Source Hub</option>
                        {hubs
                            ?.filter((item) => item._id !== orderDetails?.destinationHubId) // Exclude the selected consignor
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
                        required
                        onChange={(e) =>
                            setOrderDetails({
                                ...orderDetails,
                                destinationHubId: e.target.value,
                            })
                        }
                        className="w-full p-2 border rounded mb-4"
                        value={orderDetails?.destinationHubId}
                    >
                        <option value="">Select Destination Hub</option>
                        {hubs
                            ?.filter((item) => item._id !== orderDetails?.sourceHubId) // Exclude the selected consignor
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
                    <select
                        required
                        value={orderDetails?.payment_method}
                        onChange={(e) =>
                            setOrderDetails({
                                ...orderDetails,
                                payment_method: e.target.value,
                            })
                        }
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select Payment Method</option>
                        <option value="prepaid">Prepaid</option>
                        <option value="btp">BTP</option>
                        <option value="cash">Cash</option>
                        <option value="to_pay">To Pay</option>
                    </select>
                </div>
            </div>
            {orderDetails?.docketNumber && (
                <div className="mb-6">
                    <h2 className="font-bold mb-2">Items</h2>
                    <button
                        type="button"
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
                                <span> {item?.itemId} </span>
                                <span>{` Weight ${item.weight}`}</span>
                                <span>{` Dimension :  H:${item.dimension?.height || "NA"}, L:${item.dimension?.length || "NA"
                                    } W:${item.dimension?.width || "NA"}`}</span>

                                <button
                                    type="button"
                                    className="text-red-500"
                                    onClick={() => handleRemoveItem(index)}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

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
                                    required
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
                                        if (value <= 999) {
                                            // Allow only values less than or equal to 999
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
                                required
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
                                type="button"
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
            <button
                disabled={
                    !orderDetails?.docketNumber || orderDetails?.items?.length < 0
                }
                type="submit"
                className="p-3 bg-green-500 text-white rounded w-full"
            >
                {id ? "Update Order" : "Create Order"}
            </button>
        </form>
    );
};

export default OrderForm;
