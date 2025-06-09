# Permit API Documentation

## Base URL

```
https://your-domain.com/api
```

## Authentication

All endpoints require authentication unless specified otherwise.

## Permit Creation Flow

Permits are automatically created when a payment is successful. The creation
process is handled by the payment verification system.

### Permit Status Flow

1. **active**
   - Permit is valid and can be used
   - Created after successful payment
   - Valid until expiry date

2. **revoked**
   - Permit has been manually revoked
   - No longer valid for use
   - Can be reactivated by admin

3. **expired**
   - Permit has reached its expiry date
   - No longer valid for use
   - New payment required for renewal

4. **pending**
   - Initial state during creation
   - Temporary state before activation

## Permit Data Structure

```typescript
{
  "id": number,
  "permitCode": string,        // Hashed permit code
  "originalCode": string,      // Original permit code
  "status": string,           // active, revoked, expired, pending
  "startDate": string,        // ISO date string
  "expiryDate": string,       // ISO date string
  "amountPaid": number,
  "student": {
    "id": number,
    "studentId": string,
    "name": string,
    "email": string,
    "course": string,
    "level": string
  },
  "issuedBy": {
    "id": number,
    "username": string,
    "email": string
  },
  "payment": {
    "id": number,
    "paymentReference": string,
    "amount": number,
    "currency": string,
    "status": string
  }
}
```

## Security Features

1. **Permit Code Generation**
   - Unique permit codes generated for each permit
   - Original code is hashed before storage
   - Original code is only available during creation

2. **Expiry Management**
   - Permits have a fixed validity period
   - Automatic status update on expiry
   - Clear renewal process

3. **Access Control**
   - Role-based access to permit operations
   - Audit logging for all permit actions
   - Secure permit verification

## Best Practices

1. **Permit Usage**
   - Always verify permit status before use
   - Check expiry date during verification
   - Maintain audit trail of permit usage

2. **Error Handling**
   - Handle expired permits gracefully
   - Provide clear error messages
   - Log all verification attempts

3. **Data Protection**
   - Never expose original permit codes
   - Encrypt sensitive permit data
   - Regular security audits

## Integration Guidelines

1. **Payment Integration**
   - Ensure payment verification before permit creation
   - Handle failed payments appropriately
   - Maintain payment-permit relationship

2. **Student Management**
   - Validate student data before permit creation
   - Handle student updates properly
   - Maintain student-permit history

3. **Audit Logging**
   - Log all permit-related actions
   - Track permit status changes
   - Monitor permit usage patterns

## Testing Guidelines

1. **Permit Creation**
   - Test with various payment scenarios
   - Verify permit code generation
   - Check expiry date calculation

2. **Status Management**
   - Test status transitions
   - Verify expiry handling
   - Check revocation process

3. **Security Testing**
   - Test permit code hashing
   - Verify access controls
   - Check audit logging

## Error Handling

| Error Type     | Description                 | Resolution               |
| -------------- | --------------------------- | ------------------------ |
| Invalid Permit | Permit not found or invalid | Verify permit reference  |
| Expired Permit | Permit has expired          | Initiate renewal process |
| Revoked Permit | Permit has been revoked     | Contact support          |
| Invalid Status | Unexpected permit status    | Check permit details     |

## Monitoring and Maintenance

1. **Regular Checks**
   - Monitor permit expiry dates
   - Track permit usage patterns
   - Review audit logs

2. **System Health**
   - Monitor permit creation process
   - Track verification performance
   - Check error rates

3. **Security Updates**
   - Regular security audits
   - Update encryption methods
   - Review access controls
