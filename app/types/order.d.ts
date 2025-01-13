// Frontend Types for Order Schema

interface IAddressDetails {
    company_name: string | null;
    name: string | null;
    address: string | null;
    city: string | null;
    pincode: string | null;
    number: string | null;
}

interface ItemDetails {
    weight: number | string | null;
    dimension: {
        height: number;
        width: number;
        length: number;
    };
    price: number;
    itemId: string;
}

interface IHistoryDetails {
    status: string;
    timestamp?: Date;
    location?: string | null;
    details?: string | null;
}

interface IOrder {
    consignorId?: string ;
    consigneeId?: string ;
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
    created_by?: string | null;
    updated_by?: string | null;
    pickedVehicleNumber: string;
    drsId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
