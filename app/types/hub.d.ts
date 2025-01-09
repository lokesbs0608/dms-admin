interface IHub {
    name: string;
    address: string;
    documents_id?: string[]; // Array of Document references
    bank_details_id?: string; // Reference to Account
    manager_id: string; // Reference to Employee
    emergency_person_id: string, // Reference to Employee
    landline_number: string;
    hub_code: string;
    division: string;
    pincodes: string[];
    status: "Active" | "Inactive"; // Enum
    _id: string;
}