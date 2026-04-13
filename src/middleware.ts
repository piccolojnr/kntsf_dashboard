import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getConfiguredElectionAppUrl, getConfiguredElectionSubdomain, getMainDomainUrl } from "@/lib/election-url";

function isIpv4Host(hostname: string) {
    return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

function supportsSubdomain(hostname: string) {
    return Boolean(hostname) && hostname !== "localhost" && !isIpv4Host(hostname) && hostname.includes(".");
}

function splitHost(host: string) {
    const [hostname, port] = host.split(":");
    return { hostname, port };
}

function stripElectionSubdomain(hostname: string, subdomain: string) {
    const prefix = `${subdomain}.`;
    return hostname.startsWith(prefix) ? hostname.slice(prefix.length) : hostname;
}

function withHost(url: URL, host: string) {
    const nextUrl = new URL(url.toString());
    nextUrl.host = host;
    return nextUrl;
}

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const electionAppUrl = getConfiguredElectionAppUrl();
    const electionSubdomain = getConfiguredElectionSubdomain();
    const isElectionPath = pathname === "/elections" || pathname.startsWith("/elections/");
    const hostHeader = req.headers.get("host") || req.nextUrl.host;
    const { hostname, port } = splitHost(hostHeader);

    if (electionAppUrl) {
        try {
            const configuredElectionUrl = new URL(electionAppUrl);
            const electionHost = port ? `${configuredElectionUrl.hostname}:${port}` : configuredElectionUrl.hostname;
            const isElectionHost = hostname === configuredElectionUrl.hostname;

            if (!isElectionHost && isElectionPath) {
                return NextResponse.redirect(withHost(req.nextUrl, electionHost));
            }

            if (isElectionHost && !isElectionPath) {
                return NextResponse.redirect(new URL(getMainDomainUrl(pathname), req.url));
            }
        } catch {
            // Fall through to subdomain inference or normal routing.
        }
    } else if (electionSubdomain && supportsSubdomain(hostname)) {
        const mainHostname = stripElectionSubdomain(hostname, electionSubdomain);
        const electionHostname = `${electionSubdomain}.${mainHostname}`;
        const mainHost = port ? `${mainHostname}:${port}` : mainHostname;
        const electionHost = port ? `${electionHostname}:${port}` : electionHostname;
        const isElectionHost = hostname === electionHostname;

        if (!isElectionHost && isElectionPath) {
            return NextResponse.redirect(withHost(req.nextUrl, electionHost));
        }

        if (isElectionHost && !isElectionPath) {
            return NextResponse.redirect(withHost(req.nextUrl, mainHost));
        }
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

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
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)",
    ],
};
