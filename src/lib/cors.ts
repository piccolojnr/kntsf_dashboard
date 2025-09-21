import { NextRequest, NextResponse } from "next/server";

export function addCorsHeaders(response: NextResponse) {
    // Allow requests from the landing page domain
    const allowedOrigins = [
        "http://localhost:3000", // Landing page dev server
        "https://knutsfordsrc.com", // Production landing page
        process.env.NEXT_PUBLIC_LANDING_URL || "http://localhost:3000"
    ];


    response.headers.set("Access-Control-Allow-Origin", allowedOrigins.join(","));
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");

    return response;
}

export function handleCors(request: NextRequest) {
    // Handle preflight requests
    if (request.method === "OPTIONS") {
        const response = new NextResponse(null, { status: 200 });
        return addCorsHeaders(response);
    }

    return null;
}
