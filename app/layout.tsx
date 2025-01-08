import type { Metadata } from "next";
import {  Poppins } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/organisims/sideBar";
import { SidebarData } from "./constants/sidebar";



const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"], // Corrected "nomal" to "latin"
  weight: ["400", "500", "600", "700"], // Optional: Add specific weights if needed
});

export const metadata: Metadata = {
  title: "DMS",
  description: "Delivery Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={` ${poppins.variable}`}>
        <div className="md:flex">
          {/* Sidebar: 14% width for md, default width for smaller screens */}
          <aside className="md:w-[10%] md:w-1/7 lg:w-1/8 w-[100%]">
            <Sidebar items={SidebarData} />
          </aside>
          {/* Main content: remaining width */}
          <main className="flex-1 md:mt-0  mt-14 md:px-2 shadow">{children}</main>
        </div>
      </body>
    </html>
  );
}
