'use server';

import services from "./services";
import { SessionUser } from "./types/common";

export interface AccessPermissions {
    canManageUsers: boolean;
    canManageRoles: boolean;
    canManagePermissions: boolean;
    canManagePermits: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
    canCreatePermits: boolean;
    canRevokePermits: boolean;
    canViewPermits: boolean;
    canManageStudents: boolean;
    canViewStudents: boolean;
    canExportData: boolean;
}

export async function getPermissions({ user }: { user: SessionUser }): Promise<AccessPermissions> {
    const permissions = await services.permission.getByRoleId(user.role?.id);

    if (!permissions.success || !permissions.data) {
        throw new Error("Failed to retrieve permissions for the user.");
    }

    const hasPermission = (perm: string): boolean => {
        return permissions.data!.some((p) => p.name === perm);
    };

    return {
        canManageUsers: hasPermission("manage_users"),
        canManageRoles: hasPermission("manage_roles"),
        canManagePermissions: hasPermission("manage_permissions"),
        canManagePermits: hasPermission("manage_permits"),
        canViewReports: hasPermission("view_reports"),
        canManageSettings: hasPermission("manage_settings"),
        canCreatePermits: hasPermission("create_permits"),
        canRevokePermits: hasPermission("revoke_permits"),
        canViewPermits: hasPermission("view_permits"),
        canManageStudents: hasPermission("manage_students"),
        canViewStudents: hasPermission("view_students"),
        canExportData: hasPermission("export_data"),
    };
}
