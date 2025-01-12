/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ContactForm = ({
    contacts,
    setContacts,
}: {
    contacts: IContact[];
    setContacts: any;
}) => {
    const [showContactFrom, setShowContactForm] = useState(false);
    const [contact, setContact] = useState({
        name: "",
        number: "",
        email: "",
        type: "Personal",
        designation: "",
    });

    const handleChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setContact({
            ...contact,
            [name]: value,
        });
    };

    const handleAddContact = () => {
        if (!showContactFrom) {
            setShowContactForm(!showContactFrom);
            return;
        }

        if (
            !contact.name ||
            !contact.number ||
            !contact.type ||
            !contact.designation
        ) {
            toast.error("Please fill all required fields!");
            return;
        }
        setContacts([...contacts, contact]);
        setContact({
            name: "",
            number: "",
            email: "",
            type: "Personal",
            designation: "",
        });
        toast.success("Contact added!");
        setShowContactForm(false);
    };

    const handleRemoveContact = (index: number) => {
        const updatedContacts = contacts.filter((_, i) => i !== index);
        setContacts(updatedContacts);
        toast.success("Contact removed!");
    };

    return (
        <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Contact Details</h3>
            {showContactFrom && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={contact.name}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Number</label>
                        <input
                            type="text"
                            name="number"
                            value={contact.number}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={contact.email}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Type</label>
                        <select
                            name="type"
                            value={contact.type}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                            required
                        >
                            <option value="Personal">Personal</option>
                            <option value="Business">Business</option>
                            <option value="Emergency">Emergency</option>
                            <option value="Office">Office</option>
                            <option value="Support">Support</option>
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium">Designation</label>
                        <input
                            type="text"
                            name="designation"
                            value={contact.designation}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border rounded"
                            required
                        />
                    </div>
                </div>
            )}
            <div className="flex gap-4 items-center">
                <button
                    type="button"
                    onClick={handleAddContact}
                    className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2"
                >
                    Add Contact
                </button>
                {showContactFrom && (
                    <button
                        type="button"
                        onClick={() => setShowContactForm(false)}
                        className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2"
                    >
                        Close
                    </button>

                )}

            </div>


            {contacts.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-lg font-medium">Added Contacts</h4>
                    <ul className="mt-4">
                        {contacts.map((contact, index) => (
                            <li
                                key={index}
                                className="flex justify-between items-center border-b py-2"
                            >
                                <span>{contact.name}</span>
                                <span>{contact.email}</span>
                                <span>{contact.number}</span>
                                <span>{contact.designation}</span>
                                <span>{contact.type}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveContact(index)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ContactForm;
