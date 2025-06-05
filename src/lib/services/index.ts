import * as AuditService from "./audit.service";
import * as AuthService from "./auth.service";
import * as  DashboardService from "./dashboard.service";
import * as EmailService from "./email.service";
import * as  PermissionService from "./permission.service";
import * as  PermitService from "./permit.service";
import * as  RoleService from "./role.service";
import * as  SettingsService from "./settings.service";
import * as  StudentService from "./student.service";
import * as  UserService from "./user.service";
import * as  ReportService from "./report.service";


const services = {
    audit: AuditService,
    auth: AuthService,
    dashboard: DashboardService,
    permission: PermissionService,
    role: RoleService,
    permit: PermitService,
    settings: SettingsService,
    student: StudentService,
    user: UserService,
    email: EmailService,
    report: ReportService

}

export default services;
