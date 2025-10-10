# Knutsford University SRC Dashboard - Development Guide

## Development Environment Setup

### Prerequisites

Before starting development, ensure you have:

- **Node.js** 18.0+ (LTS recommended)
- **npm** 9.0+ or **yarn** 1.22+
- **Git** for version control
- **MySQL** 8.0+ for database
- **VS Code** (recommended) with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Prisma
  - TypeScript Importer
  - Auto Rename Tag

### Initial Setup

#### 1. Clone Repository

```bash
git clone <repository-url>
cd kntsf_dashboard_fork
```

#### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

#### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

#### 4. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

#### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3001` to see the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Protected dashboard routes
│   │   ├── students/      # Student management pages
│   │   ├── permits/       # Permit management pages
│   │   ├── news/          # News management pages
│   │   ├── events/        # Event management pages
│   │   ├── documents/      # Document management pages
│   │   ├── newsletter/    # Newsletter management pages
│   │   ├── polls/         # Poll management pages
│   │   ├── games/         # Game management pages
│   │   └── settings/      # System settings pages
│   ├── auth/              # Authentication pages
│   │   └── login/         # Login page
│   └── api/               # API routes
│       ├── auth/          # Authentication endpoints
│       ├── students/      # Student API endpoints
│       ├── permits/       # Permit API endpoints
│       ├── payments/      # Payment API endpoints
│       ├── events/        # Event API endpoints
│       ├── documents/     # Document API endpoints
│       ├── newsletter/     # Newsletter API endpoints
│       ├── polls/         # Poll API endpoints
│       ├── games/         # Game API endpoints
│       └── config/        # Configuration API endpoints
├── components/            # Reusable components
│   ├── app/              # Feature-specific components
│   │   ├── students/      # Student management components
│   │   ├── permits/       # Permit management components
│   │   ├── news/          # News management components
│   │   ├── events/        # Event management components
│   │   ├── documents/      # Document management components
│   │   ├── newsletter/    # Newsletter management components
│   │   ├── polls/         # Poll management components
│   │   └── games/         # Game management components
│   ├── ui/                # Base UI components (shadcn/ui)
│   ├── layouts/           # Layout components
│   ├── common/            # Shared components
│   ├── editor/            # Rich text editor components
│   └── form/              # Form components
├── lib/                   # Utilities and services
│   ├── auth/              # Authentication utilities
│   ├── services/          # Business logic services
│   ├── prisma/            # Database client
│   └── utils.ts           # Helper functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── middleware.ts          # Next.js middleware
```

## Development Standards

### Code Style Guidelines

#### TypeScript Configuration

```typescript
// Use strict type checking
interface Student {
    id: number;
    studentId: string;
    name: string;
    email: string;
    course?: string;
    level?: string;
}

// Prefer interfaces over types for objects
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// Use enums for constants
enum UserRole {
    ADMIN = "admin",
    EXECUTIVE = "executive",
    STAFF = "staff",
}
```

#### React Component Standards

```typescript
// Use functional components with TypeScript
interface StudentCardProps {
    student: Student;
    onEdit: (student: Student) => void;
    onDelete: (id: number) => void;
}

export function StudentCard({ student, onEdit, onDelete }: StudentCardProps) {
    // Component logic here
    return (
        <div className="p-4 border rounded-lg">
            {/* Component JSX */}
        </div>
    );
}
```

#### API Route Standards

```typescript
// API route with proper error handling
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

        // Business logic here

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Invalid request" },
            { status: 400 },
        );
    }
}
```

### Database Development

#### Prisma Schema Guidelines

```prisma
// Use descriptive model names
model Student {
  id          Int      @id @default(autoincrement())
  studentId   String   @unique
  name        String
  email       String   @unique
  course      String?
  level       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Use proper relationships
  permits     Permit[]
  payments    Payment[]
  
  // Add indexes for performance
  @@index([studentId])
  @@index([email])
}
```

#### Migration Best Practices

```bash
# Create migration
npx prisma migrate dev --name add_student_indexes

# Reset database (development only)
npx prisma migrate reset

# Generate client after schema changes
npx prisma generate
```

### Component Development

#### Component Structure

```typescript
// components/app/students/StudentForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. Define validation schema
const StudentFormSchema = z.object({
    studentId: z.string().min(1, "Student ID is required"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
});

type StudentFormData = z.infer<typeof StudentFormSchema>;

// 2. Define component props
interface StudentFormProps {
    student?: Student;
    onSubmit: (data: StudentFormData) => Promise<void>;
    onCancel: () => void;
}

// 3. Component implementation
export function StudentForm({ student, onSubmit, onCancel }: StudentFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<StudentFormData>({
        resolver: zodResolver(StudentFormSchema),
        defaultValues: student || {},
    });

    const handleSubmit = async (data: StudentFormData) => {
        setIsLoading(true);
        try {
            await onSubmit(data);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Form fields */}
        </form>
    );
}
```

#### Custom Hooks

```typescript
// hooks/use-students.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/lib/services/student.service";

export function useStudents() {
    return useQuery({
        queryKey: ["students"],
        queryFn: studentService.getAll,
    });
}

export function useCreateStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: studentService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
        },
    });
}
```

### API Development

#### Service Layer Pattern

```typescript
// lib/services/student.service.ts
import { prisma } from "@/lib/prisma";
import { CreateStudentData, Student } from "@/types/student";

export const studentService = {
    async getAll(page = 1, limit = 10, search = "") {
        const skip = (page - 1) * limit;

        const where = search
            ? {
                OR: [
                    { name: { contains: search } },
                    { studentId: { contains: search } },
                    { email: { contains: search } },
                ],
            }
            : {};

        const [students, total] = await Promise.all([
            prisma.student.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.student.count({ where }),
        ]);

        return {
            students,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    },

    async create(data: CreateStudentData) {
        return prisma.student.create({
            data,
        });
    },

    async update(id: number, data: Partial<CreateStudentData>) {
        return prisma.student.update({
            where: { id },
            data,
        });
    },

    async delete(id: number) {
        return prisma.student.delete({
            where: { id },
        });
    },
};
```

### Testing Guidelines

#### Unit Testing

```typescript
// __tests__/components/StudentCard.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { StudentCard } from "@/components/app/students/StudentCard";

const mockStudent = {
    id: 1,
    studentId: "STU001",
    name: "John Doe",
    email: "john@example.com",
};

describe("StudentCard", () => {
    it("renders student information", () => {
        render(<StudentCard student={mockStudent} />);

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("STU001")).toBeInTheDocument();
    });

    it("calls onEdit when edit button is clicked", () => {
        const mockOnEdit = jest.fn();
        render(<StudentCard student={mockStudent} onEdit={mockOnEdit} />);

        fireEvent.click(screen.getByText("Edit"));
        expect(mockOnEdit).toHaveBeenCalledWith(mockStudent);
    });
});
```

#### API Testing

```typescript
// __tests__/api/students.test.ts
import { createMocks } from "node-mocks-http";
import handler from "@/app/api/students/route";

describe("/api/students", () => {
    it("returns students list", async () => {
        const { req, res } = createMocks({
            method: "GET",
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData())).toHaveProperty("students");
    });
});
```

### Performance Optimization

#### Database Optimization

```typescript
// Use select to limit fields
const students = await prisma.student.findMany({
    select: {
        id: true,
        studentId: true,
        name: true,
        email: true,
    },
});

// Use include for relationships
const studentWithPermits = await prisma.student.findUnique({
    where: { id },
    include: {
        permits: {
            where: { status: "active" },
        },
    },
});
```

#### React Optimization

```typescript
// Use React.memo for expensive components
export const StudentCard = React.memo(({ student }: StudentCardProps) => {
    // Component logic
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
    return students.reduce((acc, student) => acc + student.score, 0);
}, [students]);

// Use useCallback for event handlers
const handleEdit = useCallback((student: Student) => {
    setEditingStudent(student);
}, []);
```

### Security Best Practices

#### Input Validation

```typescript
// Use Zod for validation
import { z } from "zod";

const CreateStudentSchema = z.object({
    studentId: z.string().min(1).max(20),
    name: z.string().min(1).max(100),
    email: z.string().email(),
});

// Sanitize inputs
import DOMPurify from "dompurify";

const sanitizedContent = DOMPurify.sanitize(userInput);
```

#### Authentication

```typescript
// Check authentication in API routes
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Protected logic here
}
```

### Deployment Preparation

#### Build Optimization

```bash
# Analyze bundle size
npm run build
npm run analyze

# Check for TypeScript errors
npm run type-check

# Run linting
npm run lint

# Run tests
npm run test
```

#### Environment Variables

```bash
# Production environment variables
DATABASE_URL="mysql://user:password@host:port/database"
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://your-domain.com"
PAYSTACK_SECRET_KEY="sk_live_..."
CLOUDINARY_URL="cloudinary://..."
```

### Git Workflow

#### Branch Strategy

```bash
# Feature development
git checkout -b feature/student-bulk-import
git add .
git commit -m "feat: add student bulk import functionality"
git push origin feature/student-bulk-import

# Bug fixes
git checkout -b fix/permit-verification-bug
git add .
git commit -m "fix: resolve permit verification issue"
git push origin fix/permit-verification-bug
```

#### Commit Message Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

### Code Review Checklist

#### Before Submitting PR

- [ ] Code follows TypeScript best practices
- [ ] Components are properly typed
- [ ] API routes have proper error handling
- [ ] Database queries are optimized
- [ ] Security measures are implemented
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Environment variables are properly configured

#### Review Guidelines

- [ ] Code is readable and well-documented
- [ ] Performance implications are considered
- [ ] Security vulnerabilities are addressed
- [ ] Code reusability is maximized
- [ ] Error handling is comprehensive
- [ ] User experience is considered

---

_This development guide ensures consistent, high-quality code development for
the SRC Dashboard. Follow these standards to maintain code quality and team
collaboration._
