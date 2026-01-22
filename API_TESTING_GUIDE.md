# Hexalabs REST API - Testing Guide

Complete guide for testing the Hexalabs REST API.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Manual Testing](#manual-testing)
3. [Automated Testing](#automated-testing)
4. [Common Test Scenarios](#common-test-scenarios)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **cURL** - Command-line HTTP client
- **Postman** (optional) - API testing tool
- **jq** (optional) - JSON processor for parsing responses

### Environment Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Ensure MongoDB is running:**
   ```bash
   # Check MongoDB connection
   mongosh mongodb://localhost:27020/hexalabs
   ```

3. **Optional: Start Redis (for rate limiting):**
   ```bash
   redis-server
   ```

---

## Manual Testing

### Step 1: Create API Key

**Login to the application first**, then create an API key:

```bash
# Using session cookie
curl -X POST http://localhost:3000/api/v1/api-keys \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "name": "Test API Key",
    "description": "For testing",
    "scopes": ["labs:read", "labs:write", "orders:read"],
    "tier": "premium",
    "environment": "development"
  }'
```

**Save the response:**
```json
{
  "success": true,
  "data": {
    "apiKey": "hxl_test_abc123xyz789",
    "apiSecret": "secret_xyz789abc123",
    ...
  },
  "warning": "Save the API secret now - it will not be shown again!"
}
```

⚠️ **IMPORTANT:** Save both `apiKey` and `apiSecret` - the secret won't be shown again!

### Step 2: Get JWT Token

```bash
# Exchange API key for JWT token
curl -X POST http://localhost:3000/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "hxl_test_abc123xyz789",
    "apiSecret": "secret_xyz789abc123",
    "grantType": "api_key"
  }' | jq '.'
```

**Save the access token:**
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 3: Test API Endpoints

#### Test Authentication
```bash
# Should succeed
curl http://localhost:3000/api/v1/example \
  -H "Authorization: Bearer $TOKEN" \
  -v

# Check for:
# - Status: 200
# - X-RateLimit-* headers
# - Access-Control-* headers (CORS)
```

#### Test Rate Limiting
```bash
# Make multiple requests quickly
for i in {1..105}; do
  curl -s http://localhost:3000/api/v1/example \
    -H "Authorization: Bearer $TOKEN" \
    -w "\nStatus: %{http_code}\n"
done

# Request 101+ should return 429 (if free tier)
```

#### Test Error Handling
```bash
# Test 401 (no auth)
curl http://localhost:3000/api/v1/example

# Test 403 (wrong scope)
curl -X POST http://localhost:3000/api/v1/example \
  -H "Authorization: Bearer $TOKEN"

# Test 404 (not found)
curl http://localhost:3000/api/v1/nonexistent \
  -H "Authorization: Bearer $TOKEN"
```

#### Test CORS
```bash
# Preflight request
curl -X OPTIONS http://localhost:3000/api/v1/example \
  -H "Origin: https://hexalabs.com" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Check for Access-Control-* headers
```

---

## Automated Testing

### Test Script

Create `test-api.sh`:

```bash
#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_BASE="http://localhost:3000/api/v1"
API_KEY="hxl_test_abc123xyz789"
API_SECRET="secret_xyz789abc123"

echo "🧪 Testing Hexalabs REST API"
echo "=============================="

# Test 1: Get JWT Token
echo -e "\n${GREEN}Test 1: Get JWT Token${NC}"
TOKEN_RESPONSE=$(curl -s -X POST $API_BASE/auth/token \
  -H "Content-Type: application/json" \
  -d "{\"apiKey\":\"$API_KEY\",\"apiSecret\":\"$API_SECRET\",\"grantType\":\"api_key\"}")

TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.accessToken')

if [ "$TOKEN" != "null" ]; then
  echo "✅ Token obtained successfully"
else
  echo "❌ Failed to get token"
  exit 1
fi

# Test 2: Authenticated Request
echo -e "\n${GREEN}Test 2: Authenticated Request${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" $API_BASE/example \
  -H "Authorization: Bearer $TOKEN")

STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$STATUS" = "200" ]; then
  echo "✅ Authenticated request successful"
else
  echo "❌ Authenticated request failed (Status: $STATUS)"
fi

# Test 3: Rate Limit Headers
echo -e "\n${GREEN}Test 3: Rate Limit Headers${NC}"
HEADERS=$(curl -s -I $API_BASE/example \
  -H "Authorization: Bearer $TOKEN")

if echo "$HEADERS" | grep -q "X-RateLimit-Limit"; then
  echo "✅ Rate limit headers present"
else
  echo "❌ Rate limit headers missing"
fi

# Test 4: CORS Headers
echo -e "\n${GREEN}Test 4: CORS Headers${NC}"
CORS_HEADERS=$(curl -s -I $API_BASE/example \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: http://localhost:3000")

if echo "$CORS_HEADERS" | grep -q "Access-Control-Allow-Origin"; then
  echo "✅ CORS headers present"
else
  echo "❌ CORS headers missing"
fi

# Test 5: Error Handling (401)
echo -e "\n${GREEN}Test 5: Error Handling (401)${NC}"
ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" $API_BASE/example)
ERROR_STATUS=$(echo "$ERROR_RESPONSE" | tail -n1)

if [ "$ERROR_STATUS" = "401" ]; then
  echo "✅ Unauthorized error handled correctly"
else
  echo "❌ Unauthorized error not handled (Status: $ERROR_STATUS)"
fi

# Test 6: Token Refresh
echo -e "\n${GREEN}Test 6: Token Refresh${NC}"
REFRESH_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.refreshToken')
REFRESH_RESPONSE=$(curl -s -X POST $API_BASE/auth/token \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\",\"grantType\":\"refresh_token\"}")

NEW_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.accessToken')

if [ "$NEW_TOKEN" != "null" ]; then
  echo "✅ Token refresh successful"
else
  echo "❌ Token refresh failed"
fi

echo -e "\n=============================="
echo "✅ All tests completed!"
```

**Run tests:**
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Common Test Scenarios

### Scenario 1: Complete Lab Purchase Flow

```bash
# 1. Get token
TOKEN=$(curl -s -X POST $API_BASE/auth/token \
  -H "Content-Type: application/json" \
  -d '{"apiKey":"'$API_KEY'","apiSecret":"'$API_SECRET'","grantType":"api_key"}' \
  | jq -r '.accessToken')

# 2. List labs
curl -s $API_BASE/labs \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data[0]'

# 3. Purchase lab
ORDER=$(curl -s -X POST $API_BASE/labs/purchase \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "labCode": "ws011wv-2025",
    "userId": "test@example.com",
    "quantity": 1,
    "paymentMethod": "razorpay"
  }')

echo $ORDER | jq '.'

# 4. Launch lab
PURCHASE_ID=$(echo $ORDER | jq -r '.purchaseId')
curl -s -X POST $API_BASE/labs/$PURCHASE_ID/launch \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

### Scenario 2: Organization Management

```bash
# Get organization
curl -s $API_BASE/organizations/org_123 \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# List members
curl -s $API_BASE/organizations/org_123/members \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# Assign lab
curl -s -X POST $API_BASE/organizations/org_123/assign-lab \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "labCode": "ws011wv-2025"
  }' | jq '.'
```

### Scenario 3: Analytics

```bash
# Get overview
curl -s "$API_BASE/analytics/overview?startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# Get usage
curl -s $API_BASE/analytics/usage \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

---

## Troubleshooting

### Issue: "Unauthorized" Error

**Check:**
1. Token is valid and not expired
2. Authorization header is correct format
3. Token includes required scopes

**Debug:**
```bash
# Decode JWT token (paste at jwt.io)
echo $TOKEN

# Check token expiration
curl -s $API_BASE/example \
  -H "Authorization: Bearer $TOKEN" \
  -v 2>&1 | grep -i "www-authenticate"
```

### Issue: Rate Limit Not Working

**Check:**
1. Redis is running: `redis-cli ping`
2. `REDIS_ENABLED=true` in `.env.local`
3. Correct tier assigned to API key

**Debug:**
```bash
# Check Redis keys
redis-cli
KEYS ratelimit:*

# Check rate limit count
GET ratelimit:user-123:hour:2026-01-21-15
```

### Issue: CORS Errors

**Check:**
1. Origin is in allowed list (`src/lib/cors.ts`)
2. Request includes `Origin` header
3. Preflight request succeeds

**Debug:**
```bash
# Test preflight
curl -X OPTIONS http://localhost:3000/api/v1/example \
  -H "Origin: https://hexalabs.com" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

### Issue: Logs Not Appearing

**Check:**
1. MongoDB is running
2. Database connection is successful
3. Logging is not skipped in middleware

**Debug:**
```bash
# Check MongoDB logs
mongosh mongodb://localhost:27020/hexalabs
db.apilogs.find().sort({timestamp:-1}).limit(10)
```

---

## Performance Testing

### Load Testing with Apache Bench

```bash
# Install Apache Bench
sudo apt install apache2-utils  # Linux
brew install httpd              # Mac

# Run load test (100 requests, 10 concurrent)
ab -n 100 -c 10 \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/example
```

### Expected Results

- **Response time:** < 200ms (p95)
- **Throughput:** > 100 req/s
- **Error rate:** < 1%

---

## Checklist

### Before Deployment

- [ ] All endpoints return correct status codes
- [ ] Authentication works (API key + JWT)
- [ ] Rate limiting enforces limits
- [ ] CORS headers present
- [ ] Error responses are standardized
- [ ] Logs are being written
- [ ] Rate limit headers are correct
- [ ] Token refresh works
- [ ] Pagination works
- [ ] All scopes are validated

### Production Testing

- [ ] Test with production API keys
- [ ] Verify SSL/HTTPS works
- [ ] Test from different origins (CORS)
- [ ] Monitor error rates
- [ ] Check response times
- [ ] Verify rate limits in production
- [ ] Test token expiration handling
- [ ] Verify webhook delivery

---

**Last Updated:** January 21, 2026
