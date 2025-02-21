'use client'; // Mark this file as a client component

import { Poppins } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/organisims/sideBar";
import { SidebarData } from "./constants/sidebar";
import { useAuth } from "./hooks/useAuth"; // Hook for authentication
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuth(); // Fetch authentication status

  return (
    <html lang="en">
      <body className={`${poppins.variable}`}>
        <div className="md:flex">
          <Toaster />
          {/* Render Sidebar if authenticated */}
          {isAuthenticated && user?.type !== 'customer' && (
            <aside className="md:w-[10%] lg:w-[12%] w-full">
              <Sidebar items={SidebarData} />
            </aside>
          )}

          {/* Main content */}
          <main
            className={`flex-1 h-screen ${isAuthenticated ? "md:mt-0 md:px-2" : "mt-0"}`}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
