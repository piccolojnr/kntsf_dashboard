# Card Delivered Checkbox — Design Spec

**Date:** 2026-04-07
**Status:** Approved

## Summary

Add a `cardDelivered` boolean field to the `Permit` model so staff can mark when a student's physical permit card has been handed over. A checkbox in the permits list table provides the UI for toggling this state.

## Schema

Add to the `Permit` model in `prisma/schema.prisma`:

```prisma
cardDelivered Boolean @default(false)
```

Run a Prisma migration to apply the change.

## Service

Add `setCardDelivered(permitId: number, delivered: boolean)` to `src/lib/services/permit.service.ts`:

- Calls `prisma.permit.update({ where: { id: permitId }, data: { cardDelivered: delivered } })`
- Returns a `ServiceResponse<Permit>`

## UI

In `src/app/dashboard/permits/client.tsx`:

- Add a **"Card"** column header to the permits table (after "Issued By", before "Actions")
- Each row renders a checkbox: `checked={permit.cardDelivered}`, `disabled={!permissions.isExecutive}`
- On change, call `setCardDelivered` and invalidate the `["permits"]` React Query cache key
- Non-executive users see the checkbox as read-only (disabled)

## Out of Scope

- No timestamp for when the card was delivered
- No audit log entry for this action
- No delivery status on the permit detail page (can be added later)
