# Hexalabs REST API Documentation

**Version:** 1.0.0  
**Base URL:** `https://api.hexalabs.com/v1`  
**Authentication:** API Key or JWT Bearer Token

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
6. [Code Examples](#code-examples)

---

## Getting Started

### Base URL

```
Production: https://api.hexalabs.com/v1
Development: http://localhost:3000/api/v1
```

### Quick Start

1. **Create API Key** (via dashboard or API)
2. **Get JWT Token** (exchange API key for token)
3. **Make API Requests** (use JWT token)

---

## Authentication

### Methods

Hexalabs API supports two authentication methods:

#### 1. API Key Authentication

**Headers:**
```http
X-API-Key: hxl_live_abc123xyz789
X-API-Secret: secret_xyz789abc123
```

**Or Bearer format:**
```http
Authorization: Bearer hxl_live_abc123:secret_xyz789
```

#### 2. JWT Token Authentication (Recommended)

**Header:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Getting a JWT Token

**Endpoint:** `POST /auth/token`

**Request:**
```json
{
  "apiKey": "hxl_live_abc123xyz789",
  "apiSecret": "secret_xyz789abc123",
  "grantType": "api_key"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

### Refreshing Tokens

**Endpoint:** `POST /auth/token`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "grantType": "refresh_token"
}
```

---

## Rate Limiting

### Tiers

| Tier | Requests/Hour | Requests/Day |
|------|---------------|--------------|
| Free | 100 | 1,000 |
| Basic | 1,000 | 10,000 |
| Premium | 10,000 | 100,000 |
| Enterprise | 100,000 | 1,000,000 |

### Rate Limit Headers

Every response includes:

```http
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9847
X-RateLimit-Reset: 1737460800
```

### Rate Limit Exceeded (429)

```json
{
  "error": "Rate limit exceeded",
  "message": "You have exceeded your premium tier rate limit",
  "limit": 10000,
  "remaining": 0,
  "reset": 1737460800,
  "retryAfter": 3456
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Resource not found",
  "code": "NOT_FOUND",
  "details": {
    "resourceId": "123"
  },
  "timestamp": "2026-01-21T15:00:00Z",
  "path": "/api/v1/labs/123"
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `BAD_REQUEST` | 400 | Invalid request format |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

---

## API Endpoints

### API Keys

#### List API Keys
```http
GET /api-keys
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "key_123",
      "apiKey": "hxl_live_abc123",
      "name": "Production Key",
      "scopes": ["labs:read", "labs:write"],
      "tier": "premium",
      "status": "active",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 3
}
```

#### Create API Key
```http
POST /api-keys
```

**Request:**
```json
{
  "name": "Production API Key",
  "description": "Main production key",
  "scopes": ["labs:read", "labs:write"],
  "tier": "premium",
  "environment": "production"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "key_123",
    "apiKey": "hxl_live_abc123xyz789",
    "apiSecret": "secret_xyz789abc123",
    "name": "Production API Key",
    "scopes": ["labs:read", "labs:write"],
    "tier": "premium"
  },
  "warning": "Save the API secret now - it will not be shown again!"
}
```

#### Update API Key
```http
PATCH /api-keys/:id
```

#### Revoke API Key
```http
DELETE /api-keys/:id
```

---

### Labs

#### List Labs
```http
GET /labs?page=1&limit=20&topic=Windows%20Server
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `topic` (string): Filter by topic
- `search` (string): Search query
- `sortBy` (string): Sort field (price, title, popularity)
- `order` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ws011wv-2025",
      "title": "Windows Server 2025 Administration",
      "description": "Comprehensive Windows Server 2025 training",
      "price": 5664.75,
      "currency": "INR",
      "duration": "180 days",
      "launches": 10,
      "topic": "Windows Server"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### Get Lab Details
```http
GET /labs/:labCode
```

#### Purchase Lab
```http
POST /labs/purchase
```

**Request:**
```json
{
  "labCode": "ws011wv-2025",
  "userId": "user@example.com",
  "quantity": 1,
  "paymentMethod": "razorpay"
}
```

#### Launch Lab
```http
POST /labs/:purchaseId/launch
```

**Response:**
```json
{
  "labId": "lab-696f9-ws011wv-2025-tzmts",
  "status": "provisioning",
  "estimatedReadyTime": "2-3 minutes",
  "labUrl": "https://hexalabs.com/lab/696f9572871234d830085169/connect",
  "credentials": {
    "username": "lab-user",
    "password": "auto-generated"
  }
}
```

#### Delete Lab
```http
DELETE /labs/:purchaseId
```

---

### Users

#### Get User
```http
GET /users/:userId
```

#### Get User's Labs
```http
GET /users/:userId/labs
```

#### Create User
```http
POST /users
```

---

### Orders

#### List Orders
```http
GET /orders?userId=user_123&status=completed
```

#### Get Order
```http
GET /orders/:orderId
```

---

### Organizations

#### Get Organization
```http
GET /organizations/:orgId
```

#### Get Members
```http
GET /organizations/:orgId/members
```

#### Assign Lab
```http
POST /organizations/:orgId/assign-lab
```

---

### Analytics

#### Get Overview
```http
GET /analytics/overview?startDate=2026-01-01&endDate=2026-01-31
```

#### Get Usage
```http
GET /analytics/usage
```

---

## Code Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';

// Get JWT token
async function getToken() {
  const response = await axios.post(`${API_BASE}/auth/token`, {
    apiKey: 'hxl_test_abc123',
    apiSecret: 'secret_xyz789',
    grantType: 'api_key'
  });
  return response.data.accessToken;
}

// List labs
async function getLabs() {
  const token = await getToken();
  
  const response = await axios.get(`${API_BASE}/labs`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    params: {
      page: 1,
      limit: 20,
      topic: 'Windows Server'
    }
  });
  
  return response.data;
}

// Purchase lab
async function purchaseLab(labCode) {
  const token = await getToken();
  
  const response = await axios.post(`${API_BASE}/labs/purchase`, {
    labCode,
    userId: 'user@example.com',
    quantity: 1,
    paymentMethod: 'razorpay'
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data;
}

// Usage
getLabs().then(labs => console.log(labs));
```

### Python

```python
import requests

API_BASE = 'http://localhost:3000/api/v1'

def get_token():
    response = requests.post(f'{API_BASE}/auth/token', json={
        'apiKey': 'hxl_test_abc123',
        'apiSecret': 'secret_xyz789',
        'grantType': 'api_key'
    })
    return response.json()['accessToken']

def get_labs():
    token = get_token()
    
    response = requests.get(f'{API_BASE}/labs', 
        headers={'Authorization': f'Bearer {token}'},
        params={'page': 1, 'limit': 20}
    )
    
    return response.json()

# Usage
labs = get_labs()
print(labs)
```

### cURL

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{"apiKey":"hxl_test_abc","apiSecret":"secret_xyz","grantType":"api_key"}' \
  | jq -r '.accessToken')

# List labs
curl http://localhost:3000/api/v1/labs \
  -H "Authorization: Bearer $TOKEN"

# Purchase lab
curl -X POST http://localhost:3000/api/v1/labs/purchase \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "labCode": "ws011wv-2025",
    "userId": "user@example.com",
    "quantity": 1
  }'
```

---

## Best Practices

1. **Use JWT tokens** for API calls (faster than API keys)
2. **Refresh tokens** before they expire
3. **Handle rate limits** - check headers and implement backoff
4. **Cache responses** when appropriate
5. **Use pagination** for large datasets
6. **Handle errors** gracefully
7. **Log API calls** for debugging
8. **Secure API keys** - never commit to version control

---

## Support

- **Documentation:** https://docs.hexalabs.com
- **Email:** api@hexalabs.com
- **Status:** https://status.hexalabs.com

---

**Last Updated:** January 21, 2026  
**API Version:** 1.0.0
