import { NextResponse } from "next/server";

// Define the login route
const loginRoute = "/login"; // Define login route here

// Define public routes that can be accessed without authentication
const publicRoutes = ["/login", "/docket-number"];

// Function to check if the current path is a public route
const isPublicRoute = (path: string) => {
    return publicRoutes.some(
        (route) => path === route || path.startsWith(`${route}/`)
    );
};

export default async function middleware(req: { nextUrl?: string | URL; headers: { get: (arg0: string) => string; }; }) {
    // Ensure nextUrl is a URL object
    const url = req.nextUrl instanceof URL ? req.nextUrl : new URL(req.nextUrl as string, "http://localhost");

    const path = url.pathname;

    // If nextUrl is undefined, return the default response
    if (!path) {
        return NextResponse.next();
    }

    // Parse cookies
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
        cookieHeader.split("; ").map((cookie) => cookie.split("="))
    );

    const token = cookies["token"]; // Replace "token" with your cookie name for the auth token

    // Check if the token exists
    if (token) {
        // If the user is authenticated and trying to access the login page, redirect to home or another page
        if (path === loginRoute) {
            return NextResponse.redirect(new URL("/", req.nextUrl)); // Redirect to home page
        }
    } else if (!isPublicRoute(path)) {
        // If the token is not present and it's not a public route, redirect to the login page
        return NextResponse.redirect(new URL(loginRoute, req.nextUrl));
    }

    // Default behavior: Proceed to the requested page
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"], // Exclude API and static routes
};
