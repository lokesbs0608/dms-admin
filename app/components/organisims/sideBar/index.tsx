"use client";

import React, { useState } from "react";
import Link from "next/link";

type SidebarItem = {
    label: string;
    href: string;
    icon?: React.ReactNode; // Optional for future icon support
};

type SidebarProps = {
    items: SidebarItem[];
};

const Sidebar: React.FC<SidebarProps> = ({ items }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <div className="relative md:min-h-screen">

            <div className="lg:hidden fixed top-0 left-0 z-50 bg-[#1d4ed8] text-white  rounded-md shadow-md hover:bg-[#285492] focus:outline-none w-[100%]">
                {/* Sidebar Toggle Button */}
                <div className="flex w-[100%] items-center justify-between px-5">
                    <button
                        className=""
                        onClick={toggleSidebar}
                        aria-label={isOpen ? "Close Sidebar" : "Open Sidebar"}
                    >
                        {isOpen ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16m-7 6h7"
                                />
                            </svg>
                        )}
                    </button>

                    <div className="p-4 text-center font-bold text-xl md:hidden">Speedo One</div>


                </div>

            </div>

            {/* Sidebar Content */}
            <aside
                className={`fixed top-0 left-0  bg-[#1d4ed8] text-white w-100 transform h-screen ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0 lg:static transition-transform duration-300 z-50`}
            >
                <div className="p-4 text-center font-bold md:block hidden text-xl">Speedo One</div>
                <nav className="w-[100%]">
                    <div className="space-y-4 mt-6 min-w-[100%] flex flex-col">
                        {items.map((item) => (

                            <Link
                                onClick={toggleSidebar}
                                key={item?.label}
                                href={item.href}
                                className=" p-2 px-3 mx-2  hover:bg-gray-900 rounded-md transition"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </nav>
            </aside>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                    aria-hidden="true"
                />
            )}
        </div>
    );
};

export default Sidebar;
