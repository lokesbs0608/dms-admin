import React from "react";
import OrderForm from "./orderForm";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    id: string | undefined
}

const OrderDetailModal = ({ isOpen, onClose, id }: Props) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-end ">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"

            ></div>

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-5xl h-[100vh] overflow-y-auto shadow-lg rounded-lg">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Order Details</h2>
                        <button
                            className="p-2 bg-red-500 text-white rounded"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>

                    {/* OrderForm Component */}
                    <OrderForm onChange={() => onClose()} id={id} />
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
