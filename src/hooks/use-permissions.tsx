import { useAuth } from '@/lib/auth/auth.context'

export function usePermissions() {
  const { hasPermission } = useAuth()

  return {
    canManageUsers: () => hasPermission('manage_users'),
    canManageRoles: () => hasPermission('manage_roles'),
    canManagePermissions: () => hasPermission('manage_permissions'),
    canManagePermits: () => hasPermission('manage_permits'),
    canViewReports: () => hasPermission('view_reports'),
    canManageSettings: () => hasPermission('manage_settings'),
    canCreatePermits: () => hasPermission('create_permits'),
    canRevokePermits: () => hasPermission('revoke_permits'),
    canViewPermits: () => hasPermission('view_permits'),
    canManageStudents: () => hasPermission('manage_students'),
    canViewStudents: () => hasPermission('view_students'),
    canExportData: () => hasPermission('export_data')
  }
}
