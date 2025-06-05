import { getServerSession } from "next-auth";
import { authConfig } from "./auth.config";
import { redirect } from "next/navigation";
import { SessionUser } from "../types/common";

export async function getSession() {
    return await getServerSession(authConfig);
}

export async function getCurrentUser() {
    const session = await getSession();
    return session?.user as SessionUser;
}

export async function requireAuth() {
    const session = await getSession();

    if (!session?.user) {
        redirect("/auth/login");
    }

    return session;
} 