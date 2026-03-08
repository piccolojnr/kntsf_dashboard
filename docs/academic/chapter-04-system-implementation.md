# CHAPTER FOUR: SYSTEM IMPLEMENTATION

## 4.1 Introduction

This chapter describes the implementation of the Knutsford University SRC Dashboard. It covers the programming languages and technologies applied (with justification), frameworks and development tools, coding evidence in the form of snippets, testing results, and deployment and user/system documentation.

## 4.2 Programming Languages and Technologies Applied

- **JavaScript/TypeScript**: TypeScript was chosen for type safety, better tooling, and fewer runtime errors in a large codebase. All application and API code is written in TypeScript.
- **Node.js**: The runtime for the Next.js server and API routes; version 18+ for current LTS and security support.
- **MySQL**: Relational database for users, students, permits, payments, events, news, documents, polls, and configuration. Chosen for reliability, ACID compliance, and wide hosting support.
- **React**: UI library for building the dashboard interface; component-based structure and rich ecosystem (forms, tables, routing) support rapid development.

**Justification**: TypeScript and React are widely used in industry and well documented; Next.js provides both server-rendered pages and API routes in one project, simplifying deployment. MySQL and Prisma offer a clear data model and migrations for maintainability.

## 4.3 Frameworks and Development Platforms/Tools

- **Next.js 16**: React framework with App Router; server and client components; API routes under `app/api/`; middleware for auth and protection.
- **Prisma**: ORM for MySQL; schema in `prisma/schema.prisma`; migrations for versioned database changes; generated type-safe client.
- **NextAuth.js**: Authentication (credentials, session, JWT); role stored in session for RBAC.
- **Tailwind CSS**: Utility-first styling; consistent spacing, colours, and responsive breakpoints.
- **Radix UI**: Accessible primitives for dialogs, dropdowns, forms, etc., used as the base for dashboard components.
- **React Hook Form + Zod**: Form state and validation; Zod schemas shared with API for consistent validation.
- **TanStack Query**: Server state and caching for list and detail views; invalidation after mutations.
- **Lexical**: Rich text editor for news and newsletter content.
- **Paystack**: Payment gateway API for initiating and verifying transactions (GHS).
- **Cloudinary**: Image and file upload and delivery.
- **Nodemailer / React Email**: Sending transactional and newsletter emails.

Development tools: Git, npm/pnpm, VS Code (or similar), Prisma Studio for database inspection.

## 4.4 Coding Evidence (Snippets)

### 4.4.1 Permit model and relation (Prisma schema)

```prisma
model Permit {
  id           Int      @id @default(autoincrement())
  permitCode   String   @unique
  originalCode String   @unique
  status       String   @default("active")
  startDate    DateTime @default(now())
  expiryDate   DateTime
  amountPaid   Float
  studentId    Int
  issuedById   Int?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  permitHash   String?
  payment      Payment?
  issuedBy     User?    @relation(fields: [issuedById], references: [id])
  student      Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  @@index([permitCode, status])
  @@index([studentId], map: "Permit_studentId_fkey")
}
```

### 4.4.2 API route pattern (validation and error handling)

```typescript
// Example pattern for API route with Zod validation
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateStudentSchema = z.object({
  studentId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateStudentSchema.parse(body);
    // ... create student via service layer
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
```

### 4.4.3 Service layer (database access)

```typescript
// Example: fetching permits with student and payment
const permits = await prisma.permit.findMany({
  where: { status: "active" },
  include: {
    student: true,
    payment: true,
    issuedBy: { select: { name: true, email: true } },
  },
  orderBy: { createdAt: "desc" },
});
```

Additional snippets (e.g. permit creation, Paystack callback, verification endpoint) can be added from the actual codebase in the report or in an appendix.

## 4.5 Testing Results/Evidence

*(Present in table or list form where possible.)*

| Test area | Method | Result / Notes |
|-----------|--------|-----------------|
| User login | Manual / UAT | Admin, executive, and staff roles can log in and see correct menus. |
| Student CRUD | Manual / UAT | Create, read, update, delete student records; validation prevents invalid email/duplicate ID. |
| Permit creation | Manual / UAT | Create permit linked to student; payment flow (test mode) completes; permit and payment stored correctly. |
| Permit verification | Manual / UAT | Entering valid code returns permit and student info; expired/invalid code returns appropriate message. |
| Event/News creation | Manual / UAT | Content can be created, edited, and published; appears on intended pages. |
| Poll creation and vote | Manual / UAT | Poll can be created with options; student can vote; results display correctly. |
| Role-based access | Manual | Unauthorised routes redirect to login or show access denied. |
| API validation | Manual / integration | Invalid payloads return 400 with validation messages. |

*(Expand with actual test runs, screenshots, or automated test results if available.)*

## 4.6 Deployment (User/System Documentation)

- **Environment**: Production requires Node.js 18+, MySQL 8.0+, and environment variables for `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, Paystack keys, Cloudinary URL, and SMTP settings. See project `docs/DEPLOYMENT_GUIDE.md` and `.env.example` (if present).
- **Build**: `prisma generate && next build` (or equivalent); output is a Node server or static/standalone as per Next.js configuration.
- **Run**: `next start` (or host’s equivalent) on the configured port.
- **Database**: Run Prisma migrations against the production database before or during deployment.
- **User documentation**: The project includes user-facing documentation (e.g. in `docs/` or `dash.md`) describing dashboard navigation, roles, and main workflows (e.g. creating a permit, verifying a permit, managing events and news). Operators and administrators can use this for training and reference.

*(Add specific deployment platform (e.g. Vercel, VPS) and any CI/CD or backup steps if applicable.)*
