// Type for Contact
interface IContact {
    name: string; // Contact person name
    number: string; // Phone number
    type: "Office" | "Personal" | "Support"; // Type of contact
    email?: string; // Email address (optional)
}

// Type for Organization
interface IOrganization {
    _id?: string; // Optional for new organization creation
    company_name: string; // Name of the company
    head_office_address: string; // Address of the head office
    website?: string; // Website (optional)
    contacts: IContact[]; // Array of contacts
    email: string; // Email address
    documents_ids?: string[]; // Array of document IDs (optional)
    bank_id?: string; // Bank ID (optional)
    created_by?: string; // Created by employee ID (optional)
    updated_by?: string; // Updated by employee ID (optional)
    createdAt?: string; // Auto-generated timestamp (optional)
    updatedAt?: string; // Auto-generated timestamp (optional)
}
