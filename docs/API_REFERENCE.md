# Knutsford University SRC Dashboard - API Reference

## API Overview

The SRC Dashboard provides a comprehensive REST API for managing all aspects of
university operations. All endpoints are protected by authentication and require
appropriate role-based permissions.

**Base URL**: `https://your-domain.com/api`

**Authentication**: Bearer Token (JWT)

## Authentication Endpoints

### POST `/api/auth/[...nextauth]`

- **Description**: NextAuth.js authentication handler
- **Methods**: GET, POST
- **Authentication**: Not required
- **Purpose**: Login, logout, session management

## Student Management

### GET `/api/students`

- **Description**: Retrieve all students with pagination
- **Query Parameters**:
  - `page` (number): Page number
  - `limit` (number): Items per page
  - `search` (string): Search by name or student ID
- **Response**: Paginated student list with metadata

### GET `/api/students/[studentId]`

- **Description**: Get specific student details
- **Parameters**: `studentId` (string)
- **Response**: Student profile with permits and payment history

### POST `/api/students`

- **Description**: Create new student record
- **Body**: Student information (name, email, course, level)
- **Response**: Created student object

### PUT `/api/students/[studentId]`

- **Description**: Update student information
- **Body**: Updated student data
- **Response**: Updated student object

## Permit Management

### GET `/api/permits/status`

- **Description**: Check permit status by code
- **Query Parameters**: `code` (string): Permit code
- **Response**: Permit status and details

### GET `/api/permits/[permitCode]`

- **Description**: Get permit details by code
- **Parameters**: `permitCode` (string)
- **Response**: Full permit information

### POST `/api/permits`

- **Description**: Create new permit
- **Body**: Student ID, amount, expiry date
- **Response**: Created permit with QR code

### PUT `/api/permits/[permitCode]`

- **Description**: Update permit status
- **Body**: Status update (active, revoked, expired)
- **Response**: Updated permit object

## Payment Processing

### POST `/api/payments/initiate`

- **Description**: Initiate payment for permit
- **Body**: Student ID, amount, permit ID
- **Response**: Payment reference and Paystack details

### GET `/api/payments/verify/[reference]`

- **Description**: Verify payment status
- **Parameters**: `reference` (string): Payment reference
- **Response**: Payment verification result

### POST `/api/payments/webhook`

- **Description**: Paystack webhook handler
- **Body**: Paystack webhook payload
- **Response**: Webhook processing confirmation

## Event Management

### GET `/api/events`

- **Description**: Retrieve all events
- **Query Parameters**:
  - `featured` (boolean): Filter featured events
  - `category` (string): Filter by category
  - `published` (boolean): Filter published events
- **Response**: Event list with metadata

### GET `/api/events/[slug]`

- **Description**: Get specific event by slug
- **Parameters**: `slug` (string)
- **Response**: Event details with organizer information

### POST `/api/events`

- **Description**: Create new event
- **Body**: Event details (title, description, date, location)
- **Response**: Created event object

### PUT `/api/events/[slug]`

- **Description**: Update event information
- **Body**: Updated event data
- **Response**: Updated event object

## Document Management

### GET `/api/documents`

- **Description**: Retrieve all documents
- **Query Parameters**:
  - `category` (string): Filter by category
  - `public` (boolean): Filter public documents
- **Response**: Document list with metadata

### GET `/api/documents/[id]`

- **Description**: Get specific document
- **Parameters**: `id` (number)
- **Response**: Document details and download URL

### GET `/api/documents/[id]/download`

- **Description**: Download document file
- **Parameters**: `id` (number)
- **Response**: File download

### POST `/api/documents`

- **Description**: Upload new document
- **Body**: Form data with file and metadata
- **Response**: Created document object

## Newsletter Management

### GET `/api/newsletter/subscribe`

- **Description**: Subscribe to newsletter
- **Query Parameters**: `email` (string)
- **Response**: Subscription confirmation

### POST `/api/newsletter/subscribe`

- **Description**: Create newsletter subscription
- **Body**: Email and name
- **Response**: Subscription created

### GET `/api/newsletter/confirm/[token]`

- **Description**: Confirm email subscription
- **Parameters**: `token` (string)
- **Response**: Confirmation status

### POST `/api/newsletter/unsubscribe`

- **Description**: Unsubscribe from newsletter
- **Body**: Email address
- **Response**: Unsubscription confirmation

## Polling System

### GET `/api/polls/active`

- **Description**: Get currently active polls
- **Response**: Active poll list

### GET `/api/polls/[id]`

- **Description**: Get specific poll details
- **Parameters**: `id` (number)
- **Response**: Poll with options and current results

### GET `/api/polls/[id]/results`

- **Description**: Get poll results
- **Parameters**: `id` (number)
- **Response**: Poll results with vote counts

### POST `/api/polls`

- **Description**: Create new poll
- **Body**: Poll details and options
- **Response**: Created poll object

### POST `/api/polls/vote`

- **Description**: Submit poll vote
- **Body**: Poll ID, option ID, student ID
- **Response**: Vote confirmation

### POST `/api/polls/student-vote`

- **Description**: Student vote submission
- **Body**: Poll ID, option ID, student information
- **Response**: Vote confirmation

### POST `/api/polls/add-option`

- **Description**: Add option to dynamic poll
- **Body**: Poll ID, option text, student ID
- **Response**: New option created

### POST `/api/polls/merge-options`

- **Description**: Merge similar poll options
- **Body**: Poll ID, option IDs to merge
- **Response**: Merged options

## Gaming System

### GET `/api/games`

- **Description**: Get game leaderboards
- **Response**: Current leaderboard data

### POST `/api/games/register`

- **Description**: Register game user
- **Body**: Username, password, student ID
- **Response**: Registration confirmation

### POST `/api/games/login`

- **Description**: Game user login
- **Body**: Username, password
- **Response**: Game session token

### GET `/api/games/user`

- **Description**: Get game user profile
- **Authentication**: Required
- **Response**: User profile and statistics

### GET `/api/games/previous-winner`

- **Description**: Get previous period winner
- **Response**: Winner information and statistics

## Executive Management

### GET `/api/executives`

- **Description**: Get SRC executive members
- **Query Parameters**:
  - `category` (string): Filter by category
  - `published` (boolean): Filter published executives
- **Response**: Executive list with profiles

## Student Ideas

### POST `/api/ideas`

- **Description**: Submit student idea
- **Body**: Title, description, category, student ID
- **Response**: Idea submission confirmation

### GET `/api/ideas`

- **Description**: Get student ideas
- **Query Parameters**:
  - `status` (string): Filter by status
  - `category` (string): Filter by category
- **Response**: Idea list with metadata

## Configuration

### GET `/api/config`

- **Description**: Get system configuration
- **Response**: System settings and contact information

### PUT `/api/config`

- **Description**: Update system configuration
- **Body**: Configuration updates
- **Response**: Updated configuration

## Contact Management

### POST `/api/contact`

- **Description**: Submit contact form
- **Body**: Name, email, subject, message
- **Response**: Contact submission confirmation

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
    "success": false,
    "error": "Error message",
    "code": "ERROR_CODE"
}
```

### Pagination Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Authentication Headers

All protected endpoints require the following header:

```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

- **General API**: 100 requests per minute per IP
- **Authentication**: 5 attempts per minute per IP
- **Payment endpoints**: 10 requests per minute per user

## Error Codes

| Code               | Description                       |
| ------------------ | --------------------------------- |
| `UNAUTHORIZED`     | Invalid or missing authentication |
| `FORBIDDEN`        | Insufficient permissions          |
| `NOT_FOUND`        | Resource not found                |
| `VALIDATION_ERROR` | Invalid request data              |
| `RATE_LIMITED`     | Too many requests                 |
| `SERVER_ERROR`     | Internal server error             |

## Webhooks

### Paystack Webhook

- **Endpoint**: `/api/payments/webhook`
- **Purpose**: Payment status updates
- **Authentication**: Paystack signature verification

---

_This API provides comprehensive access to all dashboard functionality while
maintaining security and performance standards._
