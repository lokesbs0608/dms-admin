interface IContact {
    name: string;
    number: string;
    email: string;
    type: "Personal" | "Business" | "Emergency";
    designation: string;
}

interface ICustomer {
    _id: string; // Corresponds to MongoDB's `_id`
    name: string;
    address: string;
    company_name: string;
    accountId?: string; // References to other entities as string IDs
    documents: string[];
    email: string;
    status: "Active" | "Inactive" | "Archived";
    contacts: Contact[];
    type: string; // Default to "customer" unless overridden
    routeId?: string; // Route ID if applicable
    username: string;
    password?: string;
}
