# Railway Deployment Fix Guide

## Current Issue

Production deployment at https://poe2assistant-production.up.railway.app has backend API failing with:
- ✅ Health check working (`/api/health`)
- ❌ Signup/login failing ("Signup failed" generic error)
- **Root cause**: DATABASE_URL environment variable not set on Railway

## Backend Database Connection

The backend (`backend/src/db.ts`) now supports:
1. **Railway's DATABASE_URL** (priority) - full PostgreSQL connection string
2. **Individual env vars** as fallback (for development):
   - `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`

## How to Fix on Railway

### Option 1: Link PostgreSQL Addon (Recommended)

Railway automatically sets `DATABASE_URL` when you link services:

1. **Go to Railway Dashboard**:
   - https://railway.app/project/POE2_assistant (or your project)

2. **Add PostgreSQL Service**:
   - Click "New" → "PostgreSQL"
   - Railway auto-generates a PostgreSQL instance

3. **Link to Backend Service**:
   - Click on "poe2assistant-production" (backend service)
   - Go to "Variables" tab
   - Click "Add Variable Reference"
   - Select the PostgreSQL service
   - This auto-creates `DATABASE_URL` environment variable

4. **Redeploy**:
   - Push a commit to trigger redeploy
   - OR manually trigger redeploy in Railway dashboard

### Option 2: Manually Set DATABASE_URL

If PostgreSQL is already set up elsewhere:

1. **Get Connection String**:
   ```
   postgresql://user:password@host:port/database_name
   ```

2. **Set on Railway**:
   - Backend Service → Variables tab
   - Add new variable: `DATABASE_URL`
   - Paste the full connection string
   - Redeploy

3. **Verify**:
   ```bash
   curl https://poe2assistant-production.up.railway.app/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

## Verify the Fix

Once DATABASE_URL is set:

1. **Check Backend Logs**:
   - Railway Dashboard → Backend Service → Deployments
   - Look for logs showing:
     - "Database URL configured: Yes (from env)"
     - "Database connection successful"

2. **Test Signup Endpoint**:
   ```bash
   curl -X POST https://poe2assistant-production.up.railway.app/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"newuser@example.com","password":"password123"}' | jq .
   ```
   
   **Expected response**:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "user": {
       "id": "uuid-here",
       "email": "newuser@example.com"
     }
   }
   ```

3. **Test Login Endpoint**:
   ```bash
   curl -X POST https://poe2assistant-production.up.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"newuser@example.com","password":"password123"}' | jq .
   ```

## Current Database Schema

The backend expects these tables (created via `psql` during setup):

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255),
  class VARCHAR(255),
  main_skill VARCHAR(255),
  level INTEGER,
  build_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id),
  messages JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE build_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id),
  variant_name VARCHAR(255),
  changes_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**If using a new Railway PostgreSQL instance**: Run these CREATE TABLE statements first.

## Environment Variables Needed on Railway

### Backend Service

**Required:**
- `DATABASE_URL` - PostgreSQL connection string (auto-set if linked)

**Optional (for Claude chat features):**
- `ANTHROPIC_API_KEY` - Your Anthropic API key (from https://console.anthropic.com/)

### Frontend Service (Vercel)

**Required:**
- `VITE_API_URL` - Backend URL: `https://poe2assistant-production.up.railway.app`

## Troubleshooting

### "Database connection failed"
- **Check**: Is PostgreSQL addon running?
- **Check**: Is DATABASE_URL set and correct?
- **Test locally**: `DATABASE_URL='...' npm run dev` to verify connection string

### "Signup failed" but health check works
- **Check**: Database connection diagnostic logs (see above)
- **Check**: PostgreSQL addon is linked to backend service
- **Try**: Hard refresh, or wait 5-10 minutes for deployment to complete

### Frontend shows "Signup failed" on production
- **Frontend** (Vercel) is working ✅
- **Backend API** is not responding or returning errors ❌
- **Fix**: Check backend DATABASE_URL as above

## Related Files

- `backend/src/db.ts` - Database connection configuration
- `backend/src/routes/auth.ts` - Signup/login endpoints
- `backend/src/server.ts` - Startup logging and diagnostics
- `.env.example` - Template for environment variables
