/* eslint-disable @typescript-eslint/no-unused-vars */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const generateDeliveryRunSheetPDF = (orderData: IDRSRecord) => {
    const doc = new jsPDF();

    // Format Date and Time
    const createdAtDate = new Date(orderData.createdAt);
    const formattedDate = createdAtDate.toLocaleDateString("en-GB");  // Format date (e.g., 18/02/2025)
    const formattedTime = createdAtDate.toLocaleTimeString("en-GB");  // Format time (e.g., 14:30:00)

    // Add Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("SPEEDO-ONE EXPRESS SERVICE", 10, 10);
    doc.setFontSize(14);
    doc.text("DELIVERY RUN SHEET", 80, 20);

    // Date, Time, No.
    doc.setFontSize(12);
    doc.text(`Date: ${formattedDate}`, 150, 10);
    doc.text(`Time: ${formattedTime}`, 150, 15);
    doc.text(`No.: ${orderData._id}`, 150, 20);

    // Delivery Area, Branch
    doc.text(`DEL. AREA: ${orderData.hubId?.name || "-"}`, 10, 30);
    doc.text(`Hub: ${orderData.hubId?.name || "-"}`, 150, 30);

    // Employee Name
    doc.text(`EMP. NAME: ${orderData.deliveryBoyId?.name || "-"}`, 10, 40);

    // Table Data
    const tableColumn = [
        "Sr. No",
        "AWB Number",
        "PCS",
        "Weight",
        "Consignee Name",
        "Payment Method / Amount",
        "Time",
        "Receiver Name and Seal"
    ];

    const tableRows = orderData.orderIds.map((order, index) => [
        index + 1,
        order.docketNumber || "-",
        order.itemsCount || "-",
        order.totalWeight || "-",
        order.consignee?.name || "-",
        `${order?.payment_method} / ${order?.amount}`,
        "",
        ""
    ]);

    autoTable(doc, {
        startY: 50,
        head: [tableColumn],
        body: tableRows,
        styles: {
            fontSize: 10,
            cellPadding: 2,
            minCellHeight: 20, // This ensures that each cell has a minimum height
            lineWidth: 0.1, // Border width
            lineColor: [0, 0, 0], // Border color (black)
        },
        columnStyles: {
            0: { cellWidth: 10 }, // Adjust width as needed
            1: { cellWidth: 25 },
            2: { cellWidth: 10 },
            3: { cellWidth: 20 },
            4: { cellWidth: 30 },
            5: { cellWidth: 20 },
            6: { cellWidth: 15 },
            7: { cellWidth: 50 },
        },
        theme: "striped", // Optional, just for better readability
        showHead: "everyPage", // Repeat header on each page
        didDrawPage: function (data) {
            // Calculate the position for the footer
            const finalY = doc.internal.pageSize.height - 25; // Adjust the footer's position based on the page height

            // Footer
            doc.setFontSize(12);
            doc.text("C/MENTS DELIVERED: ________________", 10, finalY);
            doc.text("C/MENTS UNDELIVERED: ________________", 10, finalY + 5);
            doc.text("TOTAL AMOUNT COLLECTION RS: ________________", 10, finalY + 10);
            doc.text("COURIER'S SIGNATURE: ________________", 10, finalY + 20);
            doc.text("SUPERVISOR'S SIGNATURE: ________________", 100, finalY + 20);
        },
    });

    // Save PDF
    doc.save("Delivery_Run_Sheet.pdf");
};

export default generateDeliveryRunSheetPDF;
