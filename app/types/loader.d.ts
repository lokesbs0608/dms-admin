interface ILocation {
    address: string;
    city: string;
    state: string;
    pincode: string;
}

interface ILoader {
    _id: string; // Optional because MongoDB generates it
    code: string;
    name: string;
    documents_ids: string[]; // Array of Document IDs
    location: ILocation; // Nested location details
    account_id?: string; // Account Object ID
    status: "Active" | "Inactive"; // Enum for status
    company_name: string;
    email: string;
    username: string;
    password?: string; // Optional when fetching loaders (should not expose hashed password)
    website?: string; // Optional field
    tags?: string[]; // Array of tags
    created_by?: string; // Employee Object ID
    updated_by?: string; // Employee Object ID
    createdAt?: string; // Automatically added by Mongoose
    updatedAt?: string; // Automatically added by Mongoose
}
