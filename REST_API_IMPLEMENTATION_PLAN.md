# Hexalabs REST API - Complete Implementation Plan

## 📋 Executive Summary

**Goal:** Build a production-ready REST API for Hexalabs Marketplace to enable third-party integrations, LMS partnerships, and enterprise automation.

**Timeline:** 3-4 weeks (with 1 developer)  
**Effort:** ~120-160 hours  
**Complexity:** Medium  
**Priority:** High (Critical for enterprise customers)

---

## 🎯 Project Objectives

### Primary Goals
1. Enable third-party applications to integrate with Hexalabs
2. Support LMS integrations (Moodle, Canvas, Blackboard)
3. Allow automated lab provisioning for enterprises
4. Provide programmatic access to analytics and reporting
5. Increase revenue through channel partners

### Success Metrics
- ✅ API documentation published
- ✅ 5+ core endpoints operational
- ✅ Authentication & rate limiting implemented
- ✅ At least 1 partner integration completed
- ✅ 99.9% uptime in first month

---

## 📚 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Implementation Phases](#implementation-phases)
4. [Detailed Timeline](#detailed-timeline)
5. [Technical Specifications](#technical-specifications)
6. [Security Requirements](#security-requirements)
7. [Testing Strategy](#testing-strategy)
8. [Documentation Plan](#documentation-plan)
9. [Deployment Strategy](#deployment-strategy)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Technical Knowledge Required

**Essential:**
- ✅ Next.js API Routes (you already have this)
- ✅ TypeScript
- ✅ MongoDB/Mongoose
- ✅ Authentication (JWT, API keys)
- ✅ REST principles

**Nice to Have:**
- OpenAPI/Swagger specification
- API versioning strategies
- Rate limiting techniques
- Webhook implementation

### Tools & Services Needed

**Development:**
- ✅ Node.js 18+ (already installed)
- ✅ Next.js 14 (already using)
- ✅ MongoDB (already configured)
- 🆕 API testing tool (Postman/Insomnia)
- 🆕 API documentation tool (Swagger UI)

**Production:**
- 🆕 API gateway (optional - can use Next.js middleware)
- 🆕 Rate limiting service (Redis recommended)
- 🆕 API monitoring (Datadog, New Relic, or Sentry)
- ✅ Logging system (already have)

### Team Requirements

**Minimum:**
- 1 Backend Developer (familiar with Next.js)
- 1 Technical Writer (for documentation)

**Ideal:**
- 1 Backend Developer
- 1 DevOps Engineer (for deployment & monitoring)
- 1 Technical Writer
- 1 QA Engineer (for testing)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
│  (Mobile Apps, LMS, Corporate Portals, Custom Integrations) │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
│  • Authentication (API Keys, JWT)                           │
│  • Rate Limiting                                            │
│  • Request Validation                                       │
│  • CORS Handling                                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   REST API Endpoints                         │
│  /api/v1/labs          /api/v1/users                        │
│  /api/v1/orders        /api/v1/organizations                │
│  /api/v1/analytics     /api/v1/webhooks                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  • Lab Management Service                                   │
│  • User Management Service                                  │
│  • Payment Service                                          │
│  • Analytics Service                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  MongoDB (Users, Labs, Orders, Organizations, API Keys)     │
└─────────────────────────────────────────────────────────────┘
```

### API Versioning Strategy

**URL-based versioning:**
```
https://api.hexalabs.com/v1/labs
https://api.hexalabs.com/v2/labs  (future)
```

**Why:** Simple, clear, easy to maintain multiple versions

---

## Implementation Phases

### **Phase 1: Foundation (Week 1)**
**Goal:** Set up API infrastructure and authentication

**Tasks:**
- [ ] Create API key management system
- [ ] Implement JWT authentication
- [ ] Set up rate limiting
- [ ] Create API middleware
- [ ] Design database schema for API keys
- [ ] Implement request/response logging

**Deliverables:**
- API key generation system
- Authentication middleware
- Rate limiting middleware
- Basic error handling

**Estimated Time:** 35-40 hours

---

### **Phase 2: Core Endpoints (Week 2)**
**Goal:** Implement essential API endpoints

**Tasks:**
- [ ] Labs API (GET, POST)
- [ ] Users API (GET, POST, PATCH)
- [ ] Orders API (GET, POST)
- [ ] Organizations API (GET, PATCH)
- [ ] Input validation
- [ ] Error responses

**Deliverables:**
- 15+ working endpoints
- Comprehensive error handling
- Request validation

**Estimated Time:** 40-45 hours

---

### **Phase 3: Advanced Features (Week 3)**
**Goal:** Add webhooks, analytics, and advanced features

**Tasks:**
- [ ] Webhook system
- [ ] Analytics endpoints
- [ ] Bulk operations
- [ ] Search & filtering
- [ ] Pagination
- [ ] Field selection

**Deliverables:**
- Webhook infrastructure
- Analytics API
- Advanced query features

**Estimated Time:** 30-35 hours

---

### **Phase 4: Documentation & Testing (Week 4)**
**Goal:** Complete documentation and testing

**Tasks:**
- [ ] OpenAPI/Swagger documentation
- [ ] API reference guide
- [ ] Code examples (multiple languages)
- [ ] Postman collection
- [ ] Integration tests
- [ ] Load testing
- [ ] Security audit

**Deliverables:**
- Complete API documentation
- Test suite (90%+ coverage)
- Postman collection
- Integration examples

**Estimated Time:** 35-40 hours

---

## Detailed Timeline

### Week 1: Foundation

| Day | Tasks | Hours | Deliverables |
|-----|-------|-------|--------------|
| **Mon** | API key schema, generation system | 8h | Database schema, key generator |
| **Tue** | JWT authentication middleware | 8h | Auth middleware, token validation |
| **Wed** | Rate limiting with Redis | 8h | Rate limiter, Redis setup |
| **Thu** | API middleware, CORS, logging | 8h | Request logger, CORS config |
| **Fri** | Testing, bug fixes, documentation | 8h | Week 1 complete, tested |

**Total:** 40 hours

---

### Week 2: Core Endpoints

| Day | Tasks | Hours | Deliverables |
|-----|-------|-------|--------------|
| **Mon** | Labs API (GET /labs, GET /labs/:id) | 8h | Lab listing, details |
| **Tue** | Labs API (POST /labs/purchase, POST /labs/:id/launch) | 8h | Purchase, launch endpoints |
| **Wed** | Users API (GET, POST, PATCH) | 8h | User management endpoints |
| **Thu** | Orders API (GET, POST) | 8h | Order endpoints |
| **Fri** | Organizations API, testing | 8h | Org endpoints, tests |

**Total:** 40 hours

---

### Week 3: Advanced Features

| Day | Tasks | Hours | Deliverables |
|-----|-------|-------|--------------|
| **Mon** | Webhook infrastructure | 8h | Webhook system |
| **Tue** | Analytics endpoints | 8h | Analytics API |
| **Wed** | Bulk operations, pagination | 8h | Bulk endpoints, pagination |
| **Thu** | Search, filtering, field selection | 8h | Advanced queries |
| **Fri** | Testing, optimization | 8h | Week 3 complete |

**Total:** 40 hours

---

### Week 4: Documentation & Polish

| Day | Tasks | Hours | Deliverables |
|-----|-------|-------|--------------|
| **Mon** | OpenAPI spec, Swagger UI | 8h | API documentation |
| **Tue** | Code examples (JS, Python, PHP) | 8h | Integration examples |
| **Wed** | Postman collection, testing guide | 8h | Postman collection |
| **Thu** | Integration tests, load testing | 8h | Test suite |
| **Fri** | Security audit, final review | 8h | Production-ready API |

**Total:** 40 hours

---

## Technical Specifications

### API Endpoints Overview

#### **1. Authentication**

**POST /api/v1/auth/token**
```typescript
// Request
{
  "apiKey": "hxl_live_abc123",
  "apiSecret": "secret_xyz789"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

---

#### **2. Labs API**

**GET /api/v1/labs**
```typescript
// List all labs
Query params:
  - page: number (default: 1)
  - limit: number (default: 20, max: 100)
  - topic: string
  - search: string
  - sortBy: string (price, title, popularity)
  - order: asc | desc

Response:
{
  "data": [
    {
      "id": "ws011wv-2025",
      "title": "Windows Server 2025 Administration",
      "description": "...",
      "price": 5664.75,
      "currency": "INR",
      "duration": "180 days",
      "launches": 10,
      "topic": "Windows Server",
      "difficulty": "intermediate"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**GET /api/v1/labs/:labCode**
```typescript
// Get lab details
Response:
{
  "id": "ws011wv-2025",
  "title": "Windows Server 2025 Administration",
  "description": "...",
  "price": 5664.75,
  "currency": "INR",
  "duration": "180 days",
  "launches": 10,
  "sessionDuration": "4 hours",
  "prerequisites": [...],
  "learningObjectives": [...],
  "modules": [...]
}
```

**POST /api/v1/labs/purchase**
```typescript
// Purchase a lab
Request:
{
  "labCode": "ws011wv-2025",
  "userId": "user@example.com",
  "quantity": 1,
  "paymentMethod": "razorpay",
  "organizationId": "org_123" // optional
}

Response:
{
  "orderId": "ORD-20260121-123456",
  "status": "completed",
  "amount": 5664.75,
  "currency": "INR",
  "purchaseId": "696f9572871234d830085169",
  "labAccess": {
    "expiresAt": "2026-07-20T00:00:00Z",
    "launchesRemaining": 10
  }
}
```

**POST /api/v1/labs/:purchaseId/launch**
```typescript
// Launch a lab
Response:
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

**DELETE /api/v1/labs/:purchaseId**
```typescript
// Delete/terminate a lab
Response:
{
  "success": true,
  "message": "Lab terminated successfully",
  "resourcesReleased": true
}
```

---

#### **3. Users API**

**GET /api/v1/users/:userId**
```typescript
// Get user details
Response:
{
  "id": "696f956b871234d830085149",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "organizationId": "org_123",
  "createdAt": "2026-01-15T10:30:00Z",
  "stats": {
    "labsPurchased": 5,
    "labsCompleted": 3,
    "totalHoursSpent": 12.5
  }
}
```

**GET /api/v1/users/:userId/labs**
```typescript
// Get user's labs
Response:
{
  "data": [
    {
      "purchaseId": "696f9572871234d830085169",
      "labCode": "ws011wv-2025",
      "labTitle": "Windows Server 2025 Administration",
      "purchasedAt": "2026-01-15T10:30:00Z",
      "expiresAt": "2026-07-14T10:30:00Z",
      "launchesUsed": 3,
      "launchesTotal": 10,
      "status": "active",
      "lastLaunchedAt": "2026-01-20T14:00:00Z"
    }
  ]
}
```

**POST /api/v1/users**
```typescript
// Create user
Request:
{
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "password": "securePassword123",
  "organizationId": "org_123" // optional
}

Response:
{
  "id": "user_new123",
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "role": "user",
  "createdAt": "2026-01-21T14:30:00Z"
}
```

---

#### **4. Orders API**

**GET /api/v1/orders**
```typescript
// List orders
Query params:
  - userId: string
  - organizationId: string
  - status: pending | completed | failed
  - startDate: ISO date
  - endDate: ISO date
  - page: number
  - limit: number

Response:
{
  "data": [
    {
      "orderId": "ORD-20260121-123456",
      "orderNumber": "ORD-20260121-123456",
      "userId": "user_123",
      "status": "completed",
      "items": [...],
      "totals": {
        "subtotal": 5085,
        "tax": 915.3,
        "total": 6000.3
      },
      "payment": {
        "method": "razorpay",
        "status": "captured",
        "transactionId": "pay_abc123"
      },
      "createdAt": "2026-01-21T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

**GET /api/v1/orders/:orderId**
```typescript
// Get order details
Response:
{
  "orderId": "ORD-20260121-123456",
  "orderNumber": "ORD-20260121-123456",
  "userId": "user_123",
  "customerInfo": {
    "email": "user@example.com",
    "name": "John Doe"
  },
  "items": [
    {
      "labCode": "ws011wv-2025",
      "labTitle": "Windows Server 2025 Administration",
      "quantity": 1,
      "priceUSD": 68,
      "priceINR": 5664
    }
  ],
  "totals": {...},
  "payment": {...},
  "createdAt": "2026-01-21T10:00:00Z"
}
```

---

#### **5. Organizations API**

**GET /api/v1/organizations/:orgId**
```typescript
// Get organization details
Response:
{
  "id": "org_123",
  "name": "Acme Corporation",
  "email": "admin@acme.com",
  "licenses": [
    {
      "labCode": "ws011wv-2025",
      "totalLicenses": 100,
      "usedLicenses": 45,
      "availableLicenses": 55,
      "expiresAt": "2026-12-31T23:59:59Z"
    }
  ],
  "members": 150,
  "createdAt": "2025-06-01T00:00:00Z"
}
```

**GET /api/v1/organizations/:orgId/members**
```typescript
// Get organization members
Response:
{
  "data": [
    {
      "userId": "user_123",
      "email": "john@acme.com",
      "name": "John Doe",
      "role": "user",
      "labsAssigned": 3,
      "joinedAt": "2025-08-15T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

**POST /api/v1/organizations/:orgId/assign-lab**
```typescript
// Assign lab to user
Request:
{
  "userId": "user_123",
  "labCode": "ws011wv-2025"
}

Response:
{
  "success": true,
  "purchaseId": "696f9572871234d830085169",
  "userId": "user_123",
  "labCode": "ws011wv-2025",
  "expiresAt": "2026-07-20T00:00:00Z",
  "licensesRemaining": 54
}
```

---

#### **6. Analytics API**

**GET /api/v1/analytics/overview**
```typescript
// Get analytics overview
Query params:
  - organizationId: string (required for org admins)
  - startDate: ISO date
  - endDate: ISO date

Response:
{
  "period": {
    "start": "2026-01-01T00:00:00Z",
    "end": "2026-01-21T23:59:59Z"
  },
  "metrics": {
    "totalUsers": 150,
    "activeUsers": 87,
    "labsPurchased": 234,
    "labsLaunched": 456,
    "totalRevenue": 1250000,
    "averageSessionDuration": "2.5 hours"
  },
  "topLabs": [
    {
      "labCode": "ws011wv-2025",
      "labTitle": "Windows Server 2025",
      "purchases": 45,
      "launches": 123
    }
  ]
}
```

**GET /api/v1/analytics/usage**
```typescript
// Get detailed usage analytics
Response:
{
  "dailyUsage": [
    {
      "date": "2026-01-21",
      "launches": 23,
      "uniqueUsers": 15,
      "totalHours": 45.5
    }
  ],
  "labUsage": [...],
  "userActivity": [...]
}
```

---

#### **7. Webhooks API**

**POST /api/v1/webhooks**
```typescript
// Register webhook
Request:
{
  "url": "https://yourapp.com/webhooks/hexalabs",
  "events": ["lab.launched", "lab.completed", "order.created"],
  "secret": "your_webhook_secret"
}

Response:
{
  "webhookId": "wh_abc123",
  "url": "https://yourapp.com/webhooks/hexalabs",
  "events": ["lab.launched", "lab.completed", "order.created"],
  "status": "active",
  "createdAt": "2026-01-21T14:30:00Z"
}
```

**Webhook Events:**
```typescript
// lab.launched
{
  "event": "lab.launched",
  "timestamp": "2026-01-21T14:30:00Z",
  "data": {
    "purchaseId": "696f9572871234d830085169",
    "labCode": "ws011wv-2025",
    "userId": "user_123",
    "labId": "lab-696f9-ws011wv-2025-tzmts"
  }
}

// lab.completed
{
  "event": "lab.completed",
  "timestamp": "2026-01-21T18:30:00Z",
  "data": {
    "purchaseId": "696f9572871234d830085169",
    "labCode": "ws011wv-2025",
    "userId": "user_123",
    "duration": "3.5 hours",
    "tasksCompleted": 15,
    "totalTasks": 20
  }
}

// order.created
{
  "event": "order.created",
  "timestamp": "2026-01-21T10:00:00Z",
  "data": {
    "orderId": "ORD-20260121-123456",
    "userId": "user_123",
    "amount": 6000.3,
    "currency": "INR",
    "items": [...]
  }
}
```

---

## Security Requirements

### Authentication

**API Key Authentication:**
```typescript
// Generate API key
const apiKey = `hxl_${environment}_${randomString(32)}`;
const apiSecret = randomString(64);

// Store hashed secret
const hashedSecret = await bcrypt.hash(apiSecret, 10);

// Database schema
{
  apiKey: string,
  apiSecretHash: string,
  userId: ObjectId,
  organizationId: ObjectId,
  name: string,
  scopes: string[],
  rateLimit: number,
  expiresAt: Date,
  lastUsedAt: Date,
  createdAt: Date
}
```

**JWT Token:**
```typescript
// Token payload
{
  sub: userId,
  org: organizationId,
  scopes: ['labs:read', 'labs:write', 'orders:read'],
  iat: timestamp,
  exp: timestamp + 3600
}
```

### Rate Limiting

**Tiers:**
```typescript
const rateLimits = {
  free: {
    requestsPerHour: 100,
    requestsPerDay: 1000
  },
  basic: {
    requestsPerHour: 1000,
    requestsPerDay: 10000
  },
  premium: {
    requestsPerHour: 10000,
    requestsPerDay: 100000
  },
  enterprise: {
    requestsPerHour: 100000,
    requestsPerDay: 1000000
  }
};
```

**Implementation:**
```typescript
// Using Redis
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: async (req) => {
    const apiKey = req.headers['x-api-key'];
    const tier = await getApiKeyTier(apiKey);
    return rateLimits[tier].requestsPerHour;
  }
});
```

### Input Validation

**Using Zod:**
```typescript
import { z } from 'zod';

const purchaseLabSchema = z.object({
  labCode: z.string().min(1).max(50),
  userId: z.string().email(),
  quantity: z.number().int().min(1).max(100),
  paymentMethod: z.enum(['razorpay', 'stripe', 'purchase_order']),
  organizationId: z.string().optional()
});

// Validate request
const validated = purchaseLabSchema.parse(req.body);
```

### CORS Configuration

```typescript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://yourdomain.com',
      'https://partner.com',
      // Add whitelisted domains
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
};
```

---

## Testing Strategy

### Unit Tests

**Example:**
```typescript
// __tests__/api/labs.test.ts
describe('Labs API', () => {
  describe('GET /api/v1/labs', () => {
    it('should return list of labs', async () => {
      const response = await request(app)
        .get('/api/v1/labs')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
      
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });
    
    it('should filter labs by topic', async () => {
      const response = await request(app)
        .get('/api/v1/labs?topic=Windows Server')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
      
      expect(response.body.data.every(lab => 
        lab.topic === 'Windows Server'
      )).toBe(true);
    });
    
    it('should return 401 without auth', async () => {
      await request(app)
        .get('/api/v1/labs')
        .expect(401);
    });
  });
});
```

### Integration Tests

**Example:**
```typescript
describe('Lab Purchase Flow', () => {
  it('should complete full purchase flow', async () => {
    // 1. Get lab details
    const lab = await request(app)
      .get('/api/v1/labs/ws011wv-2025')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    // 2. Purchase lab
    const order = await request(app)
      .post('/api/v1/labs/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({
        labCode: 'ws011wv-2025',
        userId: 'test@example.com',
        quantity: 1,
        paymentMethod: 'razorpay'
      })
      .expect(200);
    
    expect(order.body.orderId).toBeDefined();
    expect(order.body.purchaseId).toBeDefined();
    
    // 3. Launch lab
    const launch = await request(app)
      .post(`/api/v1/labs/${order.body.purchaseId}/launch`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(launch.body.labUrl).toBeDefined();
    expect(launch.body.credentials).toBeDefined();
  });
});
```

### Load Testing

**Using Artillery:**
```yaml
# artillery-config.yml
config:
  target: 'https://api.hexalabs.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"
  defaults:
    headers:
      Authorization: "Bearer {{ $processEnvironment.API_TOKEN }}"

scenarios:
  - name: "Get labs"
    flow:
      - get:
          url: "/api/v1/labs"
      - think: 2
      - get:
          url: "/api/v1/labs/ws011wv-2025"
```

**Run:**
```bash
artillery run artillery-config.yml
```

---

## Documentation Plan

### 1. API Reference (OpenAPI/Swagger)

**Generate with:**
```typescript
// swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hexalabs API',
      version: '1.0.0',
      description: 'REST API for Hexalabs Marketplace'
    },
    servers: [
      {
        url: 'https://api.hexalabs.com/v1',
        description: 'Production'
      },
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development'
      }
    ]
  },
  apis: ['./src/app/api/v1/**/*.ts']
};

const specs = swaggerJsdoc(options);
```

**Access at:** `https://api.hexalabs.com/docs`

### 2. Getting Started Guide

**Content:**
- Introduction to Hexalabs API
- Authentication setup
- Making your first request
- Common use cases
- Error handling
- Best practices

### 3. Code Examples

**Languages:**
- JavaScript/Node.js
- Python
- PHP
- cURL
- C#

**Example (JavaScript):**
```javascript
// hexalabs-sdk.js
const HexalabsAPI = require('hexalabs-sdk');

const client = new HexalabsAPI({
  apiKey: 'hxl_live_abc123',
  apiSecret: 'secret_xyz789'
});

// Get all labs
const labs = await client.labs.list({
  topic: 'Windows Server',
  page: 1,
  limit: 20
});

// Purchase a lab
const order = await client.labs.purchase({
  labCode: 'ws011wv-2025',
  userId: 'user@example.com',
  quantity: 1
});

// Launch lab
const lab = await client.labs.launch(order.purchaseId);
console.log('Lab URL:', lab.labUrl);
```

### 4. Postman Collection

**Include:**
- All endpoints
- Example requests
- Environment variables
- Pre-request scripts
- Tests

**Export and publish:**
```bash
# Generate Postman collection
npm run generate:postman

# Publish to Postman
postman-cli publish hexalabs-api.json
```

---

## Deployment Strategy

### Development Environment

```bash
# .env.development
API_VERSION=v1
API_BASE_URL=http://localhost:3000/api/v1
RATE_LIMIT_ENABLED=false
REDIS_URL=redis://localhost:6379
LOG_LEVEL=debug
```

### Staging Environment

```bash
# .env.staging
API_VERSION=v1
API_BASE_URL=https://api-staging.hexalabs.com/v1
RATE_LIMIT_ENABLED=true
REDIS_URL=redis://staging-redis:6379
LOG_LEVEL=info
```

### Production Environment

```bash
# .env.production
API_VERSION=v1
API_BASE_URL=https://api.hexalabs.com/v1
RATE_LIMIT_ENABLED=true
REDIS_URL=redis://prod-redis:6379
LOG_LEVEL=warn
```

### Deployment Steps

**1. Build:**
```bash
npm run build
```

**2. Test:**
```bash
npm run test
npm run test:integration
npm run test:load
```

**3. Deploy:**
```bash
# Vercel
vercel --prod

# Or Docker
docker build -t hexalabs-api .
docker push hexalabs-api:latest
```

**4. Verify:**
```bash
# Health check
curl https://api.hexalabs.com/health

# Test endpoint
curl -H "Authorization: Bearer $TOKEN" \
  https://api.hexalabs.com/v1/labs
```

---

## Monitoring & Maintenance

### Metrics to Track

**Performance:**
- Response time (p50, p95, p99)
- Requests per second
- Error rate
- Uptime

**Business:**
- API calls by endpoint
- API calls by customer
- Most used endpoints
- Failed requests

**Security:**
- Failed authentication attempts
- Rate limit hits
- Suspicious activity

### Monitoring Tools

**Recommended:**
- **Datadog** - Full observability
- **Sentry** - Error tracking
- **Grafana** - Custom dashboards
- **PagerDuty** - Alerting

**Setup Example (Sentry):**
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

// Track API errors
app.use((err, req, res, next) => {
  Sentry.captureException(err);
  res.status(500).json({ error: 'Internal server error' });
});
```

### Logging

**Structure:**
```typescript
{
  timestamp: '2026-01-21T14:30:00Z',
  level: 'info',
  endpoint: '/api/v1/labs',
  method: 'GET',
  userId: 'user_123',
  organizationId: 'org_123',
  responseTime: 45,
  statusCode: 200,
  userAgent: 'Mozilla/5.0...',
  ip: '192.168.1.1'
}
```

---

## Cost Estimation

### Infrastructure Costs (Monthly)

| Service | Provider | Cost |
|---------|----------|------|
| API Hosting | Vercel Pro | $20 |
| Redis (Rate Limiting) | Upstash | $10 |
| MongoDB Atlas | M10 Cluster | $57 |
| Monitoring | Sentry | $26 |
| CDN | Cloudflare | $0 (Free) |
| **Total** | | **$113/month** |

### Development Costs

| Resource | Rate | Hours | Cost |
|----------|------|-------|------|
| Backend Developer | $50/hr | 160h | $8,000 |
| Technical Writer | $40/hr | 20h | $800 |
| QA Engineer | $45/hr | 20h | $900 |
| **Total** | | **200h** | **$9,700** |

**Note:** Costs assume freelance/contract rates. Adjust for your team.

---

## Success Criteria

### Launch Criteria

- ✅ All core endpoints (15+) functional
- ✅ Authentication & rate limiting working
- ✅ API documentation published
- ✅ Postman collection available
- ✅ Integration tests passing (90%+ coverage)
- ✅ Load tested (100 req/s sustained)
- ✅ Security audit completed
- ✅ Monitoring & alerting configured

### Post-Launch (30 days)

- ✅ 99.9% uptime
- ✅ <200ms average response time
- ✅ <1% error rate
- ✅ At least 1 partner integration
- ✅ 100+ API calls per day
- ✅ Positive developer feedback

---

## Next Steps

### Immediate Actions (This Week)

1. **Review this plan** with stakeholders
2. **Allocate resources** (developer, writer, QA)
3. **Set up development environment**
   - Install Redis locally
   - Configure API testing tools
4. **Create project board** (Jira, Trello, GitHub Projects)
5. **Schedule kickoff meeting**

### Week 1 Kickoff

1. **Day 1:** Environment setup, database schema
2. **Day 2:** API key generation system
3. **Day 3:** JWT authentication
4. **Day 4:** Rate limiting
5. **Day 5:** Testing & documentation

---

## Resources & References

### Documentation
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [REST API Best Practices](https://restfulapi.net/)
- [JWT.io](https://jwt.io/)

### Tools
- [Postman](https://www.postman.com/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Artillery](https://artillery.io/) (Load testing)
- [Sentry](https://sentry.io/)

### Libraries
- `jsonwebtoken` - JWT handling
- `zod` - Input validation
- `express-rate-limit` - Rate limiting
- `swagger-jsdoc` - OpenAPI generation
- `@sentry/nextjs` - Error tracking

---

## Appendix

### A. Database Schema

**API Keys Collection:**
```typescript
{
  _id: ObjectId,
  apiKey: string, // hxl_live_abc123
  apiSecretHash: string, // bcrypt hash
  userId: ObjectId,
  organizationId: ObjectId,
  name: string, // "Production API Key"
  scopes: string[], // ['labs:read', 'labs:write']
  tier: string, // 'free', 'basic', 'premium', 'enterprise'
  rateLimit: {
    requestsPerHour: number,
    requestsPerDay: number
  },
  status: string, // 'active', 'revoked'
  expiresAt: Date,
  lastUsedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**API Logs Collection:**
```typescript
{
  _id: ObjectId,
  timestamp: Date,
  apiKey: string,
  userId: ObjectId,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  ip: string,
  userAgent: string,
  requestBody: object,
  responseBody: object,
  error: string
}
```

### B. Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Maintenance mode |

### C. Changelog Template

```markdown
# API Changelog

## v1.1.0 - 2026-02-15

### Added
- New endpoint: `GET /api/v1/analytics/export`
- Support for CSV export in analytics

### Changed
- Increased rate limit for premium tier
- Improved error messages

### Fixed
- Bug in pagination for large datasets
- Authentication token expiry issue

### Deprecated
- `GET /api/v1/labs/old-endpoint` (use `/api/v1/labs` instead)
```

---

**Document Version:** 1.0  
**Last Updated:** January 21, 2026  
**Author:** Hexalabs Development Team  
**Status:** Ready for Implementation

---

## 🚀 Ready to Start?

Follow this plan step-by-step and you'll have a production-ready REST API in 3-4 weeks!

**Questions?** Contact the development team or review the resources section.

**Let's build something amazing!** 💪
