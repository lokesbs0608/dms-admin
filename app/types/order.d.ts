// Frontend Types for Order Schema

interface IAddressDetails {
    companyName: string | null;
    name: string | null;
    address: string | null;
    city: string | null;
    pincode: string | null;
    number: string | null;
}

interface ItemDetails {
    _id?: string;
    weight: number | string | null;
    weightKg?: number | string;
    dimension: {
        height: string;
        width: string;
        length: string;
    };
    price?: string;
    itemId: string;
    status:
    | "Picked"
    | "Reached_Source_Branch"
    | "Reached_Source_Hub"
    | "In Transit"
    | "Reached_Destination_Hub"
    | "Reached_Destination_Branch"
    | "Pending"
    | "Out_For_Delivery"
    | "Delivered"
    | "Cancelled"
    | "Manifested";
}

interface IHistoryDetails {
    status: string;
    timestamp?: Date;
    location?: string | null;
    details?: string | null;
}

interface IOrder {
    _id?: string;
    consignorId?: string;
    consigneeId?: string;
    consignor?: IAddressDetails;
    consignee?: IAddressDetails;
    docketNumber: string;
    transport_type: string | "air" | "surface" | "train" | "sea";
    payment_method: string;
    sourceBranchId?: string;
    destinationBranchId?: string;
    sourceHubId: string;
    destinationHubId: string;
    status:
    | "Picked"
    | "Reached_Source_Branch"
    | "Reached_Source_Hub"
    | "In Transit"
    | "Reached_Destination_Hub"
    | "Reached_Destination_Branch"
    | "Pending"
    | "Out_For_Delivery"
    | "Delivered"
    | "Cancelled";
    deliveredLocation?: string | null;
    deliveredDate?: Date | null;
    deliveredTime?: string | null;
    history?: HistoryDetails[];
    items: ItemDetails[];
    direct_to_loader?: boolean;
    delivered_by?: string | null;
    pickedVehicleNumber: string;
    drsId?: string | null;
}

interface IOrderTable {
    _id?: string;
    consignorId?: string;
    consigneeId?: string;
    consignor?: IAddressDetails;
    consignee?: IAddressDetails;
    docketNumber: string;
    transport_type: string | "air" | "surface" | "train" | "sea";
    payment_method: string;
    sourceBranchId?: string;
    destinationBranchId?: string;
    sourceHubId: IHub;
    destinationHubId: IHub;
    status:
    | "Picked"
    | "Reached_Source_Branch"
    | "Reached_Source_Hub"
    | "In Transit"
    | "Reached_Destination_Hub"
    | "Reached_Destination_Branch"
    | "Pending"
    | "Out_For_Delivery"
    | "Delivered"
    | "Cancelled";
    deliveredLocation?: string | null;
    deliveredDate?: Date | null;
    deliveredTime?: string | null;
    history?: HistoryDetails[];
    items: ItemDetails[];
    direct_to_loader?: boolean;
    delivered_by?: string | null;
    pickedVehicleNumber: string;
    drsId?: string | null;
}

// Define the Item type
interface Item {
    itemId?: string;
}

// Define the OrderReference type
interface IOrderReference {
    parent_id?: string; // Reference to the Order ID
    items?: Item[]; // Array of items in the order
    total_weight?: number | string | null;
    _id?: string;
}

// Define the Batch type
interface IBatch {
    _id?: string; // Unique ID of the batch
    ordersIDs?: OrderReference[]; // Array of orders with items
    createdBy?: string; // User ID who created the batch
    updatedBy?: string; // User ID who last updated the batch
    createdAt?: string; // Creation timestamp
    updatedAt?: string; // Last update timestamp
}
