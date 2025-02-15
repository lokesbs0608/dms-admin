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

interface PopulatedOrder {
    _id: string;
    docket_number: string;
}

interface IDRSRecord {
    _id: string;
    hubId: Hub;
    deliveryBoyId?: Employee;
    vehicleNumber?: string;
    status: "Out for Delivery" | "Delivered";
    orderIds: PopulatedOrder[];
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

