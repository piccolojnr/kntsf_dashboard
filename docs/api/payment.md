# Payment API Documentation

## Base URL

```
https://your-domain.com/api
```

## Authentication

All endpoints require authentication unless specified otherwise.

## Endpoints

### 1. Initiate Payment

Initiates a new payment for a permit.

**Endpoint:** `POST /payments/initiate`

**Request Body:**

```typescript
{
  "studentId": string,          // Required: Student's ID
  "studentData": {             // Optional: Required if student doesn't exist
    "name": string,
    "email": string,
    "course": string,
    "level": string,
    "number": string
  },
  "amount": number,            // Required: Payment amount
  "currency": string,          // Optional: Defaults to "GHS"
  "metadata": {                // Optional: Additional payment metadata
    "permitType": string,
    "issuedById": number
  }
}
```

**Response:**

```typescript
{
  "checkoutUrl": string,       // Paystack checkout URL
  "reference": string,         // Payment reference
  "status": "PENDING"          // Initial payment status
}
```

**Error Responses:**

- `400 Bad Request`: Invalid input data
- `500 Internal Server Error`: Server error

### 2. Verify Payment

Verifies the status of a payment and creates permit if successful.

**Endpoint:** `GET /payments/verify/:reference`

**Parameters:**

- `reference`: Payment reference (in URL)

**Response:**

```typescript
{
  "status": "SUCCESS" | "FAILED" | "PENDING",
  "message": string,
  "payment": {
    "id": number,
    "amount": number,
    "currency": string,
    "status": string,
    "paymentReference": string,
    "paystackRef": string,
    "student": {
      "id": number,
      "studentId": string,
      "name": string,
      "email": string,
      "course": string,
      "level": string
    }
  },
  "permit": {                  // Only present if payment successful
    "id": number,
    "permitCode": string,
    "originalCode": string,
    "status": string,
    "startDate": string,
    "expiryDate": string,
    "student": {
      // Student details
    },
    "issuedBy": {
      // Issuer details
    }
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid reference or payment not found
- `500 Internal Server Error`: Server error

### 3. Payment Webhook

Handles Paystack payment notifications.

**Endpoint:** `POST /payments/webhook`

**Headers:**

- `x-paystack-signature`: Paystack webhook signature

**Request Body:**

```typescript
{
  "event": string,            // e.g., "charge.success"
  "data": {
    "reference": string,
    "status": string,
    // Other Paystack webhook data
  }
}
```

**Response:**

```typescript
{
  "success": true
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid signature
- `400 Bad Request`: Invalid webhook data
- `500 Internal Server Error`: Server error

## Payment Status Flow

1. **PENDING**
   - Initial state when payment is initiated
   - Payment is being processed

2. **SUCCESS**
   - Payment completed successfully
   - Permit is automatically created
   - Student can access permit details

3. **FAILED**
   - Payment failed or was rejected
   - No permit is created
   - Student can retry payment

4. **CANCELLED**
   - Payment was cancelled by user
   - No permit is created
   - Student can initiate new payment

## Error Codes

| Code | Description                      |
| ---- | -------------------------------- |
| 400  | Bad Request - Invalid input data |
| 401  | Unauthorized - Invalid signature |
| 404  | Not Found - Resource not found   |
| 500  | Internal Server Error            |

## Rate Limiting

- Payment initiation: 10 requests per minute
- Payment verification: 30 requests per minute
- Webhook endpoints: No rate limiting

## Security Considerations

1. All endpoints use HTTPS
2. Webhook signature verification
3. Payment reference validation
4. Student data validation
5. Amount validation

## Testing

For testing purposes, use Paystack test keys and test card numbers:

- Test Card: 4084 0840 8408 4081
- Expiry: Any future date
- CVV: Any 3 digits
- PIN: Any 4 digits
- OTP: Any 6 digits
