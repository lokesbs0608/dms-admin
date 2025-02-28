import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Export data to Excel with forced text format and date formatting
 * @param {Array} data - The array of objects containing the data
 * @param {Object} keys - The mapping of object keys to custom column names
 * @param {String} fileName - The name of the downloaded Excel file
 */
export const exportToExcel = (data, keys, fileName) => {
    if (!data || data.length === 0) {
        console.error("No data available for export.");
        return;
    }

    // Function to check if value matches the exact format YYYY-MM-DDT00:00:00.000+00:00
    const isMidnightISODate = (value) => {
        return /^\d{4}-\d{2}-\d{2}T00:00:00\.000[\+\-]\d{2}:\d{2}$/.test(value);
    };

    // Function to format ISO 8601 midnight dates to DD-MM-YYYY
    const formatMidnightISODate = (value) => {
        const date = new Date(value);
        return isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB"); // Convert only valid dates
    };

    // Transform data based on keys
    const formattedData = data.map((item) => {
        return Object.keys(keys).map((key) => {
            let value = key.includes(".")
                ? key
                    .split(".")
                    .reduce((o, k) => (o && o[k] !== undefined ? o[k] : ""), item) // Handle nested keys
                : item[key] !== undefined
                    ? item[key]
                    : "";
            // Format only ISO 8601 midnight datetime values
            if (isMidnightISODate(value)) {
                value = formatMidnightISODate(value);
            }

            return value;
        });
    });

    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet([]);

    // Add headers
    XLSX.utils.sheet_add_aoa(ws, [Object.values(keys)], { origin: "A1" });

    // Add data
    XLSX.utils.sheet_add_aoa(ws, formattedData, { origin: "A2" });

    // Set column formatting to text
    const wscols = Object.keys(keys).map(() => ({ wch: 20 })); // Column width
    ws["!cols"] = wscols;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Convert to binary and save
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const excelBlob = new Blob([excelBuffer], {
        type: "application/octet-stream",
    });

    saveAs(excelBlob, `${fileName}.xlsx`);
};
