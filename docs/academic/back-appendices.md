# APPENDICES

*(Per KUC guideline: Back matter follows after References. Start on a fresh page with the word "APPENDICES" centred. List each appendix with a title.)*

---

## Appendix 1: Code Snippets

The following snippets are extracted from the project repository to support Chapter 4 (System Implementation).

### A1.1 Permit verification API (GET by permit code)

*File: `src/app/api/permits/[permitCode]/route.ts`*

```typescript
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma/client'
import { BASE_URL } from '@/lib/constants'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ permitCode: string }> }
) {
    try {
        const { permitCode } = await params
        if (!permitCode) {
            return NextResponse.json(
                { error: 'Permit code is required' },
                { status: 400 }
            )
        }
        const permit = await prisma.permit.findUnique({
            where: { originalCode: permitCode },
            include: { student: true }
        })
        if (!permit) {
            return NextResponse.json(
                { error: 'Permit not found' },
                { status: 404 }
            )
        }
        return NextResponse.json({
            success: true,
            data: permit,
            permitCode,
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`${BASE_URL}/permits/verify?code=${permitCode}`)}&size=200x200`,
        })
    } catch (error) {
        console.error('Error fetching permit:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
```

### A1.2 Payment verification API (GET by reference)

*File: `src/app/api/payments/verify/[reference]/route.ts`*

```typescript
import { NextResponse } from 'next/server'
import { PaymentVerificationService } from '@/services/payment-verification.service'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ reference: string }> }
) {
    const { reference } = await params
    try {
        if (!reference) {
            return NextResponse.json(
                { error: 'Payment reference is required' },
                { status: 400 }
            )
        }
        const result = await PaymentVerificationService.verifyPayment(reference)
        return NextResponse.json(result)
    } catch (error) {
        console.error('Payment verification error:', error)
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message, reference, details: 'Check server logs for more information' },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
```

### A1.3 Student creation API with Zod validation

*File: `src/app/api/students/route.ts`*

```typescript
import { NextResponse } from 'next/server'
import services from '@/lib/services'
import { z } from 'zod'

const studentSchema = z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    course: z.string().min(1, 'Course is required'),
    level: z.string().min(1, 'Level is required'),
    number: z.string().min(1, 'Number is required')
})

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const validation = studentSchema.safeParse(data)
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            )
        }
        const response = await services.student.create(data)
        if (!response) {
            return NextResponse.json(response, { status: 500 })
        }
        return NextResponse.json(response)
    } catch (error) {
        console.error('Error creating student:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
```

### A1.4 Permit creation logic (service layer)

*File: `src/lib/services/permit.service.ts` (excerpt)*

```typescript
export async function create(permitData: PermitData): Promise<PermitResponse> {
  try {
    const session = await getSession()
    const student = await prisma.student.findUnique({
      where: { studentId: permitData.studentId }
    })
    if (!student) {
      return { success: false, error: 'Student not found' }
    }
    const code = generatePermitCode()
    const yearPrefix = new Date().getFullYear().toString().slice(-2)
    const permitCode = `${yearPrefix}-${code}`
    const hashedCode = await bcrypt.hash(permitCode, 10)
    const permitHash = permitCode.slice(-6)

    const config = await prisma.config.findFirst({
      where: { id: 1 },
      include: { permitConfig: true }
    })
    if (!config) {
      return { success: false, error: 'Configuration not found' }
    }

    const permit = await prisma.permit.create({
      data: {
        permitCode: hashedCode,
        originalCode: permitCode,
        permitHash: permitHash,
        payment: permitData.paymentId ? { connect: { id: permitData.paymentId } } : undefined,
        expiryDate: config.permitConfig?.expirationDate || permitData.expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        amountPaid: config.permitConfig?.defaultAmount || permitData.amountPaid || 100,
        studentId: student.id,
        issuedById: permitData.isSecret ? null : (session ? parseInt((session.user as any).id) : null),
        status: 'active'
      },
      include: {
        student: true,
        issuedBy: { select: { username: true } }
      }
    })

    const verificationUrl = `${BASE_URL}/permits/verify?code=${permitCode}`
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(verificationUrl)}&size=200x200`
    // ... email notification logic
    return { success: true, data: permit, permitCode, qrCode }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

### A1.5 Payment verification service (permit creation on success)

*File: `src/services/payment-verification.service.ts` (excerpt)*

```typescript
// After gateway.verifyTransaction(verificationReference):
await prisma.payment.update({
    where: { id: payment.id },
    data: {
        status: verificationResult.status,
        metadata: { ...payment.metadata, verificationResponse: verificationResult.gatewayResponse },
    },
})
// If payment is successful, create permit
if (verificationResult.status === 'SUCCESS' && !payment.permitId) {
    const res = await services.permit.create({
        studentId: payment.student.studentId + "",
        paymentId: payment.id,
    })
    permit = res.data || null
}
```

---

## Appendix 2: Database Schema (Prisma)

The following is the Prisma schema defining the MySQL database structure for the SRC Dashboard. It supports users and roles, students, permits and payments, content (news, events, documents, newsletters), polls, student ideas, and configuration.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id                  Int               @id @default(autoincrement())
  username            String            @unique
  email               String            @unique
  password            String
  roleId              Int
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
  biography           String?           @db.Text
  category            String?
  position            String?
  positionDescription String?           @db.Text
  socialLinks         Json?
  name                String            @default("")
  image               String?
  index               Int               @default(0)
  published           Boolean           @default(true)
  auditLogs           AuditLog[]
  Document            Document[]
  Event               Event[]
  newsArticles        NewsArticle[]
  Newsletter          Newsletter[]
  permits             Permit[]
  recoveryTokens      RecoveryToken[]
  StudentIdea         StudentIdea[]
  role                Role              @relation(fields: [roleId], references: [id])
  studentSouvenirs    StudentSouvenir[]
  @@index([roleId], map: "User_roleId_fkey")
}

model Role {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  users       User[]
}

model Student {
  id               Int               @id @default(autoincrement())
  studentId        String            @unique
  name             String?
  email            String?
  course           String?
  level            String?
  number           String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  deletedAt        DateTime?
  GameUser         GameUser?
  payments         Payment[]
  permits          Permit[]
  pollOptions      PollOption[]
  pollVotes        PollVote[]
  StudentIdea      StudentIdea[]
  studentSouvenirs StudentSouvenir[]
  @@index([studentId])
  @@index([email])
}

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
  @@index([permitHash, status])
  @@index([issuedById], map: "Permit_issuedById_fkey")
  @@index([studentId], map: "Permit_studentId_fkey")
}

model AuditLog {
  id        Int      @id @default(autoincrement())
  action    String
  userId    Int
  details   String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  @@index([userId], map: "AuditLog_userId_fkey")
}

model RecoveryToken {
  id        Int      @id @default(autoincrement())
  userId    Int
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  @@index([userId], map: "RecoveryToken_userId_fkey")
}

model Payment {
  id               Int           @id @default(autoincrement())
  studentId        Int
  amount           Float
  currency         String        @default("GHS")
  paymentReference String        @unique
  gatewayRef       String?       @unique
  status           PaymentStatus @default(PENDING)
  permitId         Int?          @unique
  metadata         Json?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  permit           Permit?       @relation(fields: [permitId], references: [id])
  student          Student       @relation(fields: [studentId], references: [id])
  @@index([studentId], map: "Payment_studentId_fkey")
}

model NewsArticle {
  id            Int       @id @default(autoincrement())
  title         String
  slug          String    @unique
  content       String    @db.Text
  excerpt       String    @db.Text
  image         String
  category      String
  categoryColor String
  featured      Boolean   @default(false)
  published     Boolean   @default(false)
  publishedAt   DateTime?
  authorId      Int
  readTime      String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  images        Json?
  author        User      @relation(fields: [authorId], references: [id])
  @@index([authorId], map: "NewsArticle_authorId_fkey")
}

model Event {
  id               Int       @id @default(autoincrement())
  title            String
  slug             String    @unique
  description      String    @db.Text
  excerpt          String    @db.Text
  image            String
  date             DateTime
  time             String
  location         String
  category         String
  categoryColor    String
  featured         Boolean   @default(false)
  published        Boolean   @default(false)
  publishedAt      DateTime?
  maxAttendees     Int       @default(0)
  currentAttendees Int       @default(0)
  organizerId      Int
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  images           Json?
  organizer        User      @relation(fields: [organizerId], references: [id])
  @@index([organizerId], map: "Event_organizerId_fkey")
}

model Config {
  id             Int             @id @default(autoincrement())
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  contactInfo    ContactInfo?
  permitConfig   PermitConfig?
  semesterConfig SemesterConfig?
}

model ContactInfo {
  id          Int      @id @default(autoincrement())
  email       String?
  phone       String?
  address     String?  @db.Text
  website     String?
  configId    Int      @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  socialLinks Json?
  config      Config   @relation(fields: [configId], references: [id])
}

model SemesterConfig {
  id              Int      @id @default(autoincrement())
  currentSemester String
  academicYear    String
  startDate       DateTime
  endDate         DateTime
  isActive        Boolean  @default(true)
  configId        Int      @unique
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  config          Config   @relation(fields: [configId], references: [id])
}

model PermitConfig {
  id                  Int      @id @default(autoincrement())
  expirationDate      DateTime @default(now())
  defaultAmount       Float    @default(0)
  currency            String   @default("GHS")
  configId            Int      @unique
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  enablePermitRequest Boolean  @default(false)
  config              Config   @relation(fields: [configId], references: [id])
}

model NewsletterSubscriber {
  id        Int                @id @default(autoincrement())
  email     String             @unique
  name      String?
  studentId Int
  status    SubscriptionStatus @default(PENDING)
  token     String             @unique
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt
}

model Newsletter {
  id        Int              @id @default(autoincrement())
  title     String
  content   String           @db.Text
  status    NewsletterStatus @default(DRAFT)
  sentAt    DateTime?
  sentById  Int
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  sentBy    User             @relation(fields: [sentById], references: [id])
  @@index([sentById], map: "Newsletter_sentById_fkey")
}

model Document {
  id           Int      @id @default(autoincrement())
  title        String
  description  String?  @db.Text
  category     String
  fileUrl      String
  fileType     String
  fileSize     Int
  downloads    Int      @default(0)
  isPublic     Boolean  @default(true)
  uploadedById Int
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  uploadedBy   User     @relation(fields: [uploadedById], references: [id])
  @@index([uploadedById], map: "Document_uploadedById_fkey")
}

model StudentIdea {
  id           Int        @id @default(autoincrement())
  title        String
  description  String     @db.Text
  category     String
  status       IdeaStatus @default(PENDING)
  studentId    Int
  reviewedById Int?
  reviewNotes  String?    @db.Text
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  reviewedBy   User?      @relation(fields: [reviewedById], references: [id])
  student      Student    @relation(fields: [studentId], references: [id], onDelete: Cascade)
  @@index([reviewedById], map: "StudentIdea_reviewedById_fkey")
  @@index([studentId], map: "StudentIdea_studentId_fkey")
}

model Poll {
  id          Int          @id @default(autoincrement())
  title       String
  description String?      @db.Text
  startAt     DateTime
  endAt       DateTime
  showResults Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  type        PollType     @default(FIXED_OPTIONS)
  options     PollOption[]
  votes       PollVote[]
  @@index([startAt, endAt])
  @@index([showResults])
  @@index([type])
}

model PollOption {
  id          Int          @id @default(autoincrement())
  text        String
  pollId      Int
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  createdById Int?
  status      OptionStatus  @default(ACTIVE)
  createdBy   Student?     @relation(fields: [createdById], references: [id])
  poll        Poll         @relation(fields: [pollId], references: [id], onDelete: Cascade)
  votes       PollVote[]
  @@index([pollId])
  @@index([createdById])
  @@index([status])
}

model PollVote {
  id        Int        @id @default(autoincrement())
  pollId    Int
  optionId  Int
  studentId Int
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  option    PollOption @relation(fields: [optionId], references: [id], onDelete: Cascade)
  poll      Poll       @relation(fields: [pollId], references: [id], onDelete: Cascade)
  student   Student    @relation(fields: [studentId], references: [id], onDelete: Cascade)
  @@unique([pollId, studentId])
  @@index([pollId])
  @@index([studentId])
  @@index([optionId], map: "PollVote_optionId_fkey")
}

enum PaymentStatus { PENDING SUCCESS FAILED CANCELLED }
enum SubscriptionStatus { PENDING ACTIVE UNSUBSCRIBED }
enum NewsletterStatus { DRAFT SCHEDULED SENT FAILED }
enum IdeaStatus { PENDING UNDER_REVIEW APPROVED REJECTED IMPLEMENTED }
enum PollType { FIXED_OPTIONS DYNAMIC_OPTIONS }
enum OptionStatus { ACTIVE MERGED }
```

*Additional models in the full schema (not shown above for brevity): GameUser, LeaderboardPeriod, LeaderboardEntry, GamePasswordResetToken, Souvenir, StudentSouvenir.*

---

## Appendix 3: Screenshots / User Interface

*(Optional: Include screenshots of the dashboard—e.g. login, dashboard home, permit creation, permit verification, student list—to support Chapters 3 and 4. Insert figures here when compiling.)*

---

## Appendix 4: Environment Variables

The following environment variables are used by the SRC Dashboard. Set these in `.env.local` (development) or your deployment platform (e.g. Vercel). Do not commit secret values to version control.

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL connection string (e.g. `mysql://user:password@host:3306/database`) | Yes |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js session encryption | Yes |
| `NEXTAUTH_URL` | Full URL of the application (e.g. `http://localhost:3001` or `https://yourdomain.com`) | Yes |
| `NEXT_PUBLIC_APP_URL` | Public base URL used for links in emails and QR codes | Yes |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key for client-side payment initiation | If using Paystack |
| `PAYSTACK_SECRET_KEY` | Paystack secret key for server-side verification | If using Paystack |
| `PAYMENT_GATEWAY` | Which gateway to use: `paystack` or `expresspay` | Yes (payment) |
| `EXPRESSPAY_MERCHANT_ID` | ExpressPay merchant ID | If using ExpressPay |
| `EXPRESSPAY_API_KEY` | ExpressPay API key | If using ExpressPay |
| `EXPRESSPAY_API_BASE_URL` | ExpressPay API base URL (e.g. sandbox or production) | If using ExpressPay |
| `EXPRESSPAY_API_CHECKOUT_URL` | ExpressPay checkout URL | If using ExpressPay |
| `CLOUDINARY_URL` | Full Cloudinary URL (`cloudinary://api_key:api_secret@cloud_name`) | If using Cloudinary |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Alternative to `CLOUDINARY_URL` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Alternative to `CLOUDINARY_URL` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Alternative to `CLOUDINARY_URL` |
| `SMTP_HOST` | SMTP server host (e.g. `smtp.gmail.com`) | If sending email |
| `SMTP_PORT` | SMTP port (e.g. `587` or `465`) | If sending email |
| `SMTP_USER` | SMTP username / email | If sending email |
| `SMTP_PASS` | SMTP password or app password | If sending email |
| `SMTP_FROM` / `SMTP_FROM_ADDRESS` | From address for outgoing emails | If sending email |
| `CONTACT_FORM_RECEIVER` | Email address to receive contact form submissions | Optional |
| `JWT_SECRET` | Secret for JWT signing (e.g. game or API tokens) | If using JWT |
| `KNUTSFORD_LOGO_URL` | Full URL to university logo for email templates | Optional |
| `NEXT_PUBLIC_LANDING_URL` | Landing page URL for CORS or redirects | Optional |
| `APP_BASE_URL` | Alternative app base URL | Optional |
| `NODE_ENV` | `development` or `production` | Set by host / build |

---

*Add or remove appendices as needed for your report. Ensure each appendix is referred to in the main text where relevant.*
