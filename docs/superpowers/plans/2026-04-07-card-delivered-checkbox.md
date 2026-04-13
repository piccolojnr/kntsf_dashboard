# Card Delivered Checkbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `cardDelivered` boolean field to the `Permit` model and expose it as a checkbox in the permits list table so staff can mark when a student's physical card has been handed over.

**Architecture:** Schema change adds `cardDelivered Boolean @default(false)` to the Prisma `Permit` model. A new `setCardDelivered` service function updates the field. The permits list client renders a "Card" checkbox column that calls this function and re-fetches.

**Tech Stack:** Prisma (MySQL), Next.js App Router server actions, React Query (`@tanstack/react-query`), Shadcn/ui checkbox

---

## File Map

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `cardDelivered Boolean @default(false)` to `Permit` model |
| `src/lib/services/permit.service.ts` | Add `setCardDelivered` exported function |
| `src/app/dashboard/permits/client.tsx` | Add "Card" column with checkbox |

---

### Task 1: Update Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma` (Permit model, ~line 73)

- [ ] **Step 1: Add field to Permit model**

In `prisma/schema.prisma`, inside the `Permit` model, add after `permitHash`:

```prisma
cardDelivered Boolean  @default(false)
```

The Permit model should now look like:

```prisma
model Permit {
  id            Int      @id @default(autoincrement())
  permitCode    String   @unique
  originalCode  String   @unique
  status        String   @default("active")
  startDate     DateTime @default(now())
  expiryDate    DateTime
  amountPaid    Float
  studentId     Int
  issuedById    Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  permitHash    String?
  cardDelivered Boolean  @default(false)
  payment       Payment?
  issuedBy      User?    @relation(fields: [issuedById], references: [id])
  student       Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@index([permitCode, status])
  @@index([permitHash, status])
  @@index([issuedById], map: "Permit_issuedById_fkey")
  @@index([studentId], map: "Permit_studentId_fkey")
}
```

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name add_card_delivered_to_permit
```

Expected output:
```
Applying migration `..._add_card_delivered_to_permit`
Your database is now in sync with your schema.
Generated Prisma Client
```

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(db): add cardDelivered field to Permit model"
```

---

### Task 2: Add setCardDelivered Service Function

**Files:**
- Modify: `src/lib/services/permit.service.ts`

- [ ] **Step 1: Add the function at the bottom of permit.service.ts** (before the private helper functions `generatePermitCode` and `generatePaymentReference`)

```typescript
export async function setCardDelivered(
  permitId: number,
  delivered: boolean
): Promise<ServiceResponse<{ id: number; cardDelivered: boolean }>> {
  try {
    const permit = await prisma.permit.update({
      where: { id: permitId },
      data: { cardDelivered: delivered },
      select: { id: true, cardDelivered: true }
    })
    return { success: true, data: permit }
  } catch (error: any) {
    log.error('Error updating card delivered status:', error)
    return handleError(error)
  }
}
```

This function is auto-exposed via `services.permit.setCardDelivered` because `src/lib/services/index.ts` imports `* as PermitService`.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to `cardDelivered` or `setCardDelivered`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/services/permit.service.ts
git commit -m "feat(permit): add setCardDelivered service function"
```

---

### Task 3: Add Card Delivered Checkbox to Permits Table

**Files:**
- Modify: `src/app/dashboard/permits/client.tsx`

- [ ] **Step 1: Add Checkbox import**

At the top of `src/app/dashboard/permits/client.tsx`, add to the existing imports:

```typescript
import { Checkbox } from "@/components/ui/checkbox";
```

- [ ] **Step 2: Add "Card" column header**

In the `<TableHeader>` section (there are two — one in the loading skeleton and one in the real table). In the **real table** (inside `{/* not loading */}` around line 624), add a new `<TableHead>` after "Issued By":

```tsx
<TableHead>Issued By</TableHead>
<TableHead>Card</TableHead>
{permissions.isExecutive && <TableHead>Actions</TableHead>}
```

Also add it to the **skeleton** table header (around line 574) so column widths match during loading:

```tsx
<TableHead>Issued By</TableHead>
<TableHead>Card</TableHead>
<TableHead>Actions</TableHead>
```

And add a skeleton cell in the skeleton rows (around line 605):

```tsx
<TableCell>
  <Skeleton className="w-4 h-4" />
</TableCell>
```

- [ ] **Step 3: Add checkbox cell in the data rows**

Inside the `permitsData?.data.map((permit) => { ... })` block, add a `<TableCell>` after the "Issued By" cell (around line 680):

```tsx
<TableCell>
  {permit.issuedBy?.username || "Unknown"}
</TableCell>
<TableCell>
  <Checkbox
    checked={permit.cardDelivered}
    disabled={!permissions.isExecutive}
    onCheckedChange={async (checked) => {
      try {
        const res = await services.permit.setCardDelivered(
          permit.id,
          checked === true
        );
        if (res.success) {
          queryClient.invalidateQueries({ queryKey: ["permits"] });
        } else {
          toast.error(res.error || "Failed to update card status");
        }
      } catch {
        toast.error("Failed to update card status");
      }
    }}
  />
</TableCell>
```

- [ ] **Step 4: Verify the page renders without TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Manually verify in the browser**

1. Navigate to `/dashboard/permits`
2. Confirm the "Card" column appears in the table
3. Click a checkbox — it should toggle and the row should re-render with the updated value
4. Log in as a non-executive user — checkbox should appear but be disabled (greyed out, not clickable)

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/permits/client.tsx
git commit -m "feat(permits): add card delivered checkbox to permits table"
```
