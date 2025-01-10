interface IRoute {
    _id: string; // Unique identifier for the route (MongoDB _id)
    hub_id: string; // Reference to the Hub entity
    branch_id: string; // Reference to the Branch entity
    pincodes: string[]; // Array of pincode strings
    areas: string[]; // Array of area names
    route_code: string; // Unique route code
    from: string; // Starting point of the route
    via: string; // Intermediate point(s) on the route
    to: string; // Destination of the route
    status: "Active" | "Inactive"
}


interface IRouteDetails {
    _id: string; // Unique identifier for the route (MongoDB _id)
    hub_id: IHub // Reference to the Hub entity
    branch_id: string; // Reference to the Branch entity
    pincodes: string[]; // Array of pincode strings
    areas: string[]; // Array of area names
    route_code: string; // Unique route code
    from: string; // Starting point of the route
    via: string; // Intermediate point(s) on the route
    to: string; // Destination of the route
    status: "Active" | "Inactive"
}
