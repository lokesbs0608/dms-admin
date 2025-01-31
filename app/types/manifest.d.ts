

interface Batch {
    _id: string;
    items_count: string
    docketNumber?: string
    total_weight?: number | string
    // Add the other fields from your Batch model if needed
}

interface IManifest {
    _id?: string;
    loaderId: string;
    sourceHubID: string;
    destinationHubID: string;
    vehicleNumber: string;
    gpsLocation: string;
    estimatedDeliveryDate: string;  // You can change this to Date if using Date objects
    driverContactNumber: string;
    orderIDs: Batch[];
    batchIDs: Batch[];
    no_ofBatch: string;
    no_ofIndividualOrder: string;
    totalPcs: string;
    totalWeight: string;
    actualWeight: string;
    status: 'In Transit' | 'Delivered' | 'Pending';
    transport_type: string | "air" | "surface" | "train" | "sea";

}

interface IManifestTable {
    _id: string;
    loaderId: ILoader;
    sourceHubID: IHub;
    destinationHubID: Ihub;
    vehicleNumber: string;
    gpsLocation: string;
    estimatedDeliveryDate: string;  // You can change this to Date if using Date objects
    driverContactNumber: string;
    orderIDs: IOrder[];
    batchIDs: Batch[];
    no_ofBatch: number;
    no_ofIndividualOrder: number;
    totalPcs: number;
    totalWeight: string;
    actualWeight: string;
    status: 'In Transit' | 'Delivered' | 'Pending';
    transport_type: string | "air" | "surface" | "train" | "sea";

}
