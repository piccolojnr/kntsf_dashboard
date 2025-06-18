'use server';

import { SessionUser } from "./types/common";

export interface AccessRoles {
    isAdmin: boolean;
    isPro: boolean;
    isExecutive: boolean;
}

export async function getRole({ user }: { user: SessionUser }): Promise<AccessRoles> {
    const hasRole = (role: string): boolean => {
        return user.role.name === role;
    };

    return {
        isAdmin: hasRole("admin"),
        isPro: hasRole("pro") || hasRole("admin"),
        isExecutive: hasRole("executive") || hasRole("pro") || hasRole("admin"),
    };
}
