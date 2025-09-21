import * as AuditService from "./audit.service";
import * as AuthService from "./auth.service";
import * as  DashboardService from "./dashboard.service";
import * as EmailService from "./email.service";
import * as  PermitService from "./permit.service";
import * as  RoleService from "./role.service";
import * as  SettingsService from "./settings.service";
import * as  StudentService from "./student.service";
import * as  UserService from "./user.service";
import * as  ReportService from "./report.service";
import * as  ConfigService from "./config.service";
import * as  NewsletterService from "./newsletter.service";
import * as  DocumentService from "./document.service";
import * as  IdeaService from "./idea.service";
import * as  PaymentService from "./payment.service";
import * as  PollService from "./poll.service";

const services = {
    audit: AuditService,
    auth: AuthService,
    dashboard: DashboardService,
    role: RoleService,
    permit: PermitService,
    settings: SettingsService,
    student: StudentService,
    user: UserService,
    email: EmailService,
    report: ReportService,
    config: ConfigService,
    newsletter: NewsletterService,
    document: DocumentService,
    idea: IdeaService,
    payment: PaymentService,
    poll: PollService,
}

export default services;
