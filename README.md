# BankLedger Backend API

Backend service for a ledger-based banking workflow built with Node.js, Express, and MongoDB.

## Base URLs

- Production: `https://bankledger-backend.onrender.com`
- Local: `http://localhost:5001`

## Authentication

Authentication is JWT-based and supports either:

- HTTP-only cookie: `token`
- Authorization header: `Authorization: Bearer <jwt>`

### Protected Routes

- All `/api/v1/accounts/*` routes require authenticated user access.
- `/api/v1/transactions/*` routes require authentication, except system funding which requires a **system user** token.

## Standard Response Shape

Most endpoints return JSON with:

- `success: boolean`
- `message: string` (for errors and operation status)
- resource payload (such as `user`, `account`, or `transaction`)

Some routes currently return raw arrays/objects (for example `GET /api/v1/accounts/`). This is expected behavior based on current implementation.

## API Endpoints

---

### Health Check

#### `GET /`

Returns service status.

**Response (200)**

```json
"BankLedger-Backend is active"
```

---

### Auth

#### `POST /api/v1/auth/register`

Creates a new user account and sets auth token cookie.

**Request Body**

```json
{
  "email": "john.doe@example.com",
  "name": "John Doe",
  "password": "securePassword123"
}
```

**Success Response (201)**

```json
{
  "user": {
    "_id": "65f4c7b1e32c4c1234567890",
    "email": "john.doe@example.com",
    "name": "John Doe"
  },
  "success": true
}
```

**Possible Errors**

- `422` - User already exists with this email
- `500` - Internal server error

---

#### `POST /api/v1/auth/login`

Authenticates user credentials and sets auth token cookie.

**Request Body**

```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Success Response (200)**

```json
{
  "user": {
    "_id": "65f4c7b1e32c4c1234567890",
    "email": "john.doe@example.com",
    "name": "John Doe"
  },
  "success": true
}
```

**Possible Errors**

- `401` - Invalid credentials
- `500` - Internal server error

---

#### `POST /api/v1/auth/logout`

Logs out the current user, blacklists token, and clears cookie.

**Auth**

- Optional token; endpoint still returns success if token is missing.

**Success Response (200)**

```json
{
  "message": "User logged out successfully",
  "success": true
}
```

**Possible Errors**

- `500` - Internal server error

---

### Accounts (Authenticated User)

#### `POST /api/v1/accounts/`

Creates a new account for the authenticated user.

**Auth**

- Required (cookie or bearer token)

**Request Body**

- No body required.

**Success Response (201)**

```json
{
  "account": {
    "_id": "65f4c90ee32c4c1234567891",
    "user": "65f4c7b1e32c4c1234567890",
    "status": "ACTIVE",
    "currency": "USD",
    "createdAt": "2026-03-24T10:10:10.000Z",
    "updatedAt": "2026-03-24T10:10:10.000Z",
    "__v": 0
  },
  "success": true
}
```

**Possible Errors**

- `401` - Unauthorized access (missing/invalid token)
- `500` - Internal server error

---

#### `GET /api/v1/accounts/`

Returns all accounts for the authenticated user.

**Auth**

- Required (cookie or bearer token)

**Success Response (200)**

```json
[
  {
    "_id": "65f4c90ee32c4c1234567891",
    "user": "65f4c7b1e32c4c1234567890",
    "status": "ACTIVE",
    "currency": "USD",
    "createdAt": "2026-03-24T10:10:10.000Z",
    "updatedAt": "2026-03-24T10:10:10.000Z",
    "__v": 0
  }
]
```

**Possible Errors**

- `401` - Unauthorized access (missing/invalid token)
- `500` - Internal server error

---

#### `GET /api/v1/accounts/balance/:id`

Returns computed balance for a specific user-owned account.

**Auth**

- Required (cookie or bearer token)

**Path Params**

- `id` (string, required): Account ID

**Success Response (200)**

```json
{
  "accountId": "65f4c90ee32c4c1234567891",
  "balance": 5000,
  "success": true
}
```

**Possible Errors**

- `401` - Unauthorized access (missing/invalid token)
- `404` - Account not found
- `500` - Internal server error

---

### Transactions

#### `POST /api/v1/transactions/`

Creates a money transfer between two accounts using idempotency protection.

**Auth**

- Required (cookie or bearer token)

**Request Body**

```json
{
  "fromAccount": "65f4c90ee32c4c1234567891",
  "toAccount": "65f4ca2ce32c4c1234567892",
  "amount": 150,
  "idempotencyKey": "txn-20260324-0001"
}
```

**Success Response (201)**

```json
{
  "message": "Transaction completed successfully",
  "transaction": {
    "_id": "65f4cb7de32c4c1234567893",
    "fromAccount": "65f4c90ee32c4c1234567891",
    "toAccount": "65f4ca2ce32c4c1234567892",
    "status": "PENDING",
    "amount": 150,
    "idempotencyKey": "txn-20260324-0001",
    "createdAt": "2026-03-24T10:20:10.000Z",
    "updatedAt": "2026-03-24T10:20:10.000Z",
    "__v": 0
  },
  "success": true
}
```

**Idempotency Behavior**

- If same key already `COMPLETED`: `200` with existing transaction
- If same key already `PENDING`: `200` with processing message
- If same key already `FAILED` or `REVERSED`: `500` with retry message

**Possible Errors**

- `400` - Missing fields / invalid account / inactive account / insufficient balance
- `401` - Unauthorized access (missing/invalid token)
- `500` - Internal server error

---

#### `POST /api/v1/transactions/system/initial-funds`

Creates initial funding transaction from a system user account to target account.

**Auth**

- Required system-user token (cookie or bearer token)

**Request Body**

```json
{
  "toAccount": "65f4ca2ce32c4c1234567892",
  "amount": 10000,
  "idempotencyKey": "seed-20260324-001"
}
```

**Success Response (201)**

```json
{
  "message": "Initial funds transaction completed successfully",
  "transaction": {
    "_id": "65f4ccf5e32c4c1234567894",
    "fromAccount": "65f4c8a5e32c4c1234567888",
    "toAccount": "65f4ca2ce32c4c1234567892",
    "status": "COMPLETED",
    "amount": 10000,
    "idempotencyKey": "seed-20260324-001",
    "createdAt": "2026-03-24T10:25:10.000Z",
    "updatedAt": "2026-03-24T10:25:10.000Z",
    "__v": 0
  },
  "success": true
}
```

**Possible Errors**

- `400` - Missing fields / invalid target account / system user account not found
- `401` - Unauthorized access (missing/invalid token)
- `403` - Forbidden access (not a system user)
- `500` - Internal server error

## Environment Variables

Set the following in `.env`:

```env
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
```

Additional email-related variables may be required for email notifications depending on your deployment configuration.
