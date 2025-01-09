interface IEmployee {
    _id: string;
    name: string;
    gender: "Male" | "Female" | "Other";
    username: string;
    email: string;
    role: string;
    date_of_joining: Date;
    location: {
        address: string;
        city: string;
        state: string;
        pincode: string;
    };
    status: "Active" | "Inactive";
    section: string;
    account_id: string;
    documents_id: string[];
    branch_id: string;
    hub_id: string;
    ref_id: string;
    remarks: string;
}