# Production Troubleshooting Guide

## Current Status (2026-05-27)

**Problem**: Backend API returning "Signup failed" error
- ✅ Code fixed and deployed to GitHub
- ✅ Code works locally
- ⏳ Waiting for Railway to have DATABASE_URL configured

## Diagnose Your Railway Setup

### Step 1: Check Railway Dashboard

1. **Go to Railway**: https://railway.app
2. **Select your project**: POE2_assistant (or whatever you named it)
3. **Click on backend service**: poe2assistant-production
4. **Check Variables tab**:
   - Should see a variable named `DATABASE_URL`
   - Value should look like: `postgresql://user:password@host:port/database`
   - If **missing**, follow "Fix It" section below

### Step 2: Check Backend Logs

In Railway dashboard:

1. **Backend Service** → **Deployments** tab
2. **Click latest deployment**
3. **Look for these log messages**:
   - `"Database URL configured: Yes (from env)"` ← Good sign
   - `"Database connection successful"` ← Everything works!
   - `"Database connection failed: ..."` ← Shows actual error

**If you see logs showing it's trying to connect to `localhost:5432`**, that means `DATABASE_URL` is not set and it's falling back to defaults.

### Step 3: Test Endpoint with Verbose Output

```bash
curl -v -X POST https://poe2assistant-production.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"testpass123"}'
```

**What to look for**:
- `< HTTP/1.1 200` = Request reached server
- Response body:
  - `{"token":"..."}` = ✅ Success! Database working
  - `{"error":"Signup failed"}` = ❌ Database connection failed

## Fix It: Set Up DATABASE_URL on Railway

### Option 1: Link PostgreSQL Addon (Recommended)

**If you already created a PostgreSQL database on Railway:**

1. **Railway Dashboard** → **Your Project**
2. **Add Service** → **PostgreSQL**
   - Railway auto-creates a PostgreSQL instance
   - (Or skip if you already have one)

3. **Link to Backend Service**:
   - Click **poe2assistant-production** service
   - Go to **Variables** tab
   - Click **"Add"** or **"Add Variable Reference"**
   - Select **PostgreSQL** service from the reference list
   - Railway auto-creates `DATABASE_URL` variable

4. **Trigger Redeploy**:
   - Push a git commit: `git commit --allow-empty -m "Trigger redeploy"`
   - Or click **"Redeploy"** in Railway dashboard

5. **Wait 2-3 minutes** for deployment

### Option 2: Manually Set DATABASE_URL

**If you have a PostgreSQL URL from elsewhere:**

1. **Get your PostgreSQL connection string**:
   ```
   postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
   ```

2. **Set on Railway**:
   - Backend Service → **Variables** tab
   - Click **"New Variable"**
   - Name: `DATABASE_URL`
   - Value: `postgresql://...` (paste your connection string)
   - Save

3. **Trigger Redeploy**:
   - Push commit: `git commit --allow-empty -m "Trigger redeploy"`
   - Or manual redeploy in Railway dashboard

### Option 3: Create New PostgreSQL on Railway

**If you don't have a PostgreSQL instance:**

1. **Railway Dashboard** → **Your Project**
2. Click **New Service** → **PostgreSQL**
3. **Wait for it to start** (see green checkmark)
4. **Link to Backend** (follow Option 1 steps 3-5)

## After Setting DATABASE_URL

### Verify It's Working

1. **Check logs** (see Step 2 above):
   - Should show "Database connection successful"

2. **Test the API**:
   ```bash
   curl -X POST https://poe2assistant-production.up.railway.app/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"newuser@example.com","password":"password123"}'
   ```
   **Expected response** (not an error):
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "uuid-here",
       "email": "newuser@example.com"
     }
   }
   ```

3. **Test login** with same credentials:
   ```bash
   curl -X POST https://poe2assistant-production.up.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"newuser@example.com","password":"password123"}'
   ```

4. **Test in browser**:
   - Go to https://poe-2-assistant-ten.vercel.app/signup
   - Create account with test credentials
   - Should redirect to /builds (not show "Signup failed")

### Run E2E Tests

Once API is working:

```bash
BASE_URL=https://poe-2-assistant-ten.vercel.app npx playwright test
```

Should see tests passing (not just 12/66).

## Still Not Working?

### Check These Things

1. **Is PostgreSQL addon running?**
   - Railway → Project → Look for PostgreSQL service
   - Should have green status
   - If not: Add it and wait for it to start

2. **Is DATABASE_URL exactly named `DATABASE_URL`?**
   - Check spelling and capitalization
   - Not `DB_URL` or other variations
   - Must be exactly `DATABASE_URL`

3. **Is backend service redeployed after adding DATABASE_URL?**
   - Watch Deployments tab
   - Should show a new deployment starting
   - If not: Push a commit or manual redeploy

4. **Is the PostgreSQL addon linked to backend service?**
   - When you "Add Variable Reference", it should auto-link
   - Check Service Links or Dependencies in Railway UI
   - If missing: Re-add the variable reference

5. **Is the database schema created?**
   - If using a new PostgreSQL instance, you need to create tables
   - Run the SQL from `RAILWAY_DEPLOYMENT_FIX.md` on the database
   - OR wait - Railway might auto-create them (check)

## Quick Test Script

Run this locally to verify backend works:

```bash
cd backend

# Start backend locally
npx tsx src/server.ts &
BACKEND_PID=$!

# Wait for server to start
sleep 2

# Test signup
echo "Testing signup..."
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"testlocal@example.com","password":"localpass123"}' | jq .

# Kill server
kill $BACKEND_PID
```

**If local test works but production doesn't**, it's definitely the `DATABASE_URL` configuration on Railway.

## Emergency: Bypass with Local Database (Development Only)

**If you need to test quickly**, you can temporarily run backend with local PostgreSQL:

```bash
cd backend

# Set env vars for local database
export DB_HOST=localhost
export DB_USER=postgres
export DB_PASSWORD=<your_password>
export DB_NAME=poe2_companion
export DB_PORT=5432

# Start backend
npx tsx src/server.ts
```

**But this won't fix production** - you still need to set DATABASE_URL on Railway.

## Related Documentation

- `.github/RAILWAY_DEPLOYMENT_FIX.md` - Complete Railway setup guide
- `BUILD_PROGRESS.md` - Current project status
- `backend/src/db.ts` - Database connection code
- `.env.example` - Environment variable template

## Need More Help?

1. Check Railway docs: https://docs.railway.app/
2. Check PostgreSQL addon docs: https://docs.railway.app/plugins/postgres
3. Check logs in Railway dashboard (most helpful)
4. Review `RAILWAY_DEPLOYMENT_FIX.md` again step-by-step
