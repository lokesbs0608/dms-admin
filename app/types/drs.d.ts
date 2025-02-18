interface Order {
    _id: string;
    docket_number: string;
}

interface IDRSForm {
    hubId: string;
    deliveryBoyId?: string;
    vehicleNumber?: string;
    status: "Out for Delivery" | "Delivered";
    orderIds: Order[];
    gpsLocation: string,
    created_by?: string;
    updated_by?: string;
    _id?: string
}



interface Hub {
    _id: string;
    name: string;
}

interface Employee {
    _id: string;
    name: string;
}

// Consignee Details
interface Consignee {
    name: string;
    address: string;
    city: string;
    pincode: string;
    number: string;
    company_name?: string | null;
}

// Dimensions of an Item
interface Dimension {
    height: number | null;
    width: number | null;
    length: number | null;
}

// Individual Item Details
interface Item {
    _id: string;
    itemId: string;
    weight: number;
    status: string;
    dimension: Dimension;
}

// Main Delivery Order Structure
interface DeliveryOrder {
    _id: string;
    consignee: Consignee;
    items: Item[];
    itemsCount: number;
    totalWeight: number;
    docketNumber: string;
    payment_method: string;
    amount?: string


}

interface IDRSRecord {
    _id: string;
    hubId: Hub;
    deliveryBoyId?: Employee;
    vehicleNumber?: string;
    status: "Out for Delivery" | "Delivered";
    orderIds: DeliveryOrder[];
    created_by?: Employee;
    updated_by?: Employee;
    createdAt: string;
    updatedAt: string;
    gpsLocation: string
}

interface TableColumn {
    key: keyof DRSRecord | string;
    label: string;
}

