import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const pathname = req.nextUrl.pathname;

    if (!token && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (token && pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

// Protect all routes under /dashboard and /api except for the auth routes
export const config = {
    matcher: [
        // private routes
        "/dashboard/:path*",
        "/api/:path*",
    ],
};
