# Railway Fresh Backend Deployment Guide (Updated)

**Based on**: [Railway Docs - Express Deployment](https://docs.railway.com/guides/express)

## Current Situation

- Backend code pushed to GitHub ✅
- Railway project exists but backend API failing ❌
- Need to restart deployment from scratch with correct configuration

## Step 1: Access Your Railway Project

1. **Go to Railway Dashboard**: https://railway.app
2. **Select your project**: POE2_assistant
3. **You should see**:
   - Backend service (poe2assistant-production)
   - Frontend service (on Vercel, not in Railway)
   - Possibly a PostgreSQL database (if already created)

## Step 2: Add PostgreSQL Database (If Not Already Present)

1. **In your Railway project**, click the **"+"** button or **"New Service"**
2. **Select "PostgreSQL"**
3. **Wait for it to start** (should show green status)
4. **Note the name** it displays (usually "Postgres" or similar)

**You should now see**:
- Backend service
- PostgreSQL service

## Step 3: Create Database Tables

Before the backend connects, you need the tables. **Connect to PostgreSQL**:

### Option A: Via Railway UI
1. **Click PostgreSQL service**
2. **Click "Connect"** button
3. **Run these SQL commands** in the query editor:

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

CREATE INDEX idx_builds_user ON builds(user_id);
CREATE INDEX idx_conversations_build ON conversations(build_id);
CREATE INDEX idx_variants_build ON build_variants(build_id);
```

## Step 4: Link Backend Service to PostgreSQL

### Via Railway Dashboard (Recommended)

1. **Click on Backend service** (poe2assistant-production)
2. **Go to "Variables" tab**
3. **Click "Add Variable"**
4. **Set these variables**:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
   | `ANTHROPIC_API_KEY` | (your Anthropic API key from https://console.anthropic.com/) |
   | `NODE_ENV` | `production` |

**Important**: The `${{Postgres.DATABASE_URL}}` syntax tells Railway to inject the actual database URL at runtime.

5. **Save variables**

## Step 5: Configure GitHub Integration (If Not Already Done)

1. **Backend service** → **Settings** tab
2. **Look for "Source"**
3. **Should show**: GitHub repo `hoiqz/POE2_assistant`, branch `main`
4. **Deploy on Push**: Should be enabled
   - If not: Toggle it on
   - This makes Railway auto-deploy when you push to main

## Step 6: Trigger Fresh Deployment

### Option A: Push a Commit
```bash
git commit --allow-empty -m "Trigger Railway redeploy with proper DATABASE_URL"
git push origin main
```

### Option B: Manual Redeploy in Railway UI
1. **Backend service** → **Deployments** tab
2. **Click the three dots** on latest deployment
3. **Select "Redeploy"**

**Wait 2-3 minutes** for deployment to complete.

## Step 7: Check Deployment Logs

1. **Backend service** → **Deployments** tab
2. **Click latest deployment**
3. **Look for these messages** in the logs:

   ✅ **Success signs**:
   - `"Database URL configured: Yes (from env)"`
   - `"Database connection successful"`
   - `Server running on port 3000`

   ❌ **Error signs**:
   - `"Database connection failed"`
   - `listen EADDRINUSE` (port in use)
   - `Cannot find module` (missing dependencies)

**If error found**: Check the exact error message in logs and troubleshoot below.

## Step 8: Get Backend URL

1. **Backend service**
2. **Look for "Domain"** section at the top
3. **Should show**: `https://poe2assistant-production.up.railway.app` (or similar)
4. **Click to copy** URL

## Step 9: Test Backend API

```bash
# Test health endpoint (should work)
curl https://poe2assistant-production.up.railway.app/api/health | jq .

# Test signup (should return token, not error)
curl -X POST https://poe2assistant-production.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' | jq .
```

**Expected response for signup**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "some-uuid",
    "email": "test@example.com"
  }
}
```

## Step 10: Verify Frontend Can Reach Backend

Your frontend (on Vercel) should already have `VITE_API_URL` set to your backend URL.

**Test**:
1. Go to https://poe-2-assistant-ten.vercel.app/signup
2. **Fill in**:
   - Email: `testuser@example.com`
   - Password: `testpass123`
3. **Click "Sign Up"**
4. **Expected**: Redirects to /builds (not "Signup failed" error)

## Step 11: Run E2E Tests

Once everything is working:

```bash
BASE_URL=https://poe-2-assistant-ten.vercel.app npx playwright test
```

**Expected**: Tests should pass (most or all, depending on data state).

## Troubleshooting

### "Database connection failed" in logs

**Check**:
1. Did you create the tables? (Step 3)
2. Is PostgreSQL service running? (Should show green status)
3. Is DATABASE_URL set correctly? (Should be `${{Postgres.DATABASE_URL}}`)

**Fix**:
- Verify variable name is exactly `DATABASE_URL`
- Verify value is exactly `${{Postgres.DATABASE_URL}}`
- Check PostgreSQL service is running (green status in Railway)
- Re-run SQL commands if tables missing

### "Cannot find module" error

**Check**:
1. Are all dependencies installed locally?
   ```bash
   cd backend && npm install
   ```
2. Did you commit `package.json` and `package-lock.json`?
   ```bash
   git add backend/package*.json
   git commit -m "Ensure dependencies committed"
   git push origin main
   ```

### API responding but saying "Signup failed"

1. Check logs for actual database error
2. Verify tables exist:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
3. Try creating test user from logs to see actual error
4. Check `ANTHROPIC_API_KEY` is set (not required for signup, but might cause issues elsewhere)

### Frontend still shows "Signup failed"

1. **Check frontend logs** (Browser DevTools → Console)
2. **Look for the actual error** from API
3. **Verify backend URL** in frontend is correct:
   - Should be the Railway domain from Step 8
4. **Check Vercel environment variable**:
   - Vercel project → Settings → Environment Variables
   - `VITE_API_URL` should be your Railway backend URL

### Port already in use

If logs show `EADDRINUSE: Address already in use :::3000`:

1. Railway automatically picks available ports
2. Check what port is assigned in "Domain" section
3. Server runs on whatever port Railway assigns (not always 3000)

## Variables Reference

For your records, here are all environment variables:

### Backend Service (on Railway)

```
DATABASE_URL = ${{Postgres.DATABASE_URL}}  # Auto-injected
ANTHROPIC_API_KEY = your-key-here         # From console.anthropic.com
NODE_ENV = production                      # Optional
```

### Frontend Service (on Vercel)

```
VITE_API_URL = https://poe2assistant-production.up.railway.app
```

## Quick Checklist

- [ ] PostgreSQL service created and running (green status)
- [ ] Tables created with SQL commands
- [ ] Backend service Variables tab has `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
- [ ] Backend service Variables tab has `ANTHROPIC_API_KEY` set
- [ ] GitHub integration enabled (auto-deploy on push)
- [ ] Latest deployment logs show "Database connection successful"
- [ ] Health endpoint responds: `curl https://.../api/health`
- [ ] Signup endpoint returns token: `curl -X POST https://.../api/auth/signup ...`
- [ ] Frontend signup page works without "Signup failed" error
- [ ] E2E tests run (most should pass)

## Next Steps After Success

1. **Monitor logs** regularly for errors
2. **Test frequently** to catch issues early
3. **Set up alerts** in Railway (optional)
4. **Update documentation** if you change anything
5. **Back up database** if important (Railway docs on backups)

## Related Documentation

- [Railway Express Guide](https://docs.railway.com/guides/express)
- [Railway Environment Variables](https://docs.railway.com/guides/variables)
- [Railway PostgreSQL](https://docs.railway.com/plugins/postgres)
- `.github/RAILWAY_DEPLOYMENT_FIX.md` (older guide, mostly superseded)
- `PRODUCTION_TROUBLESHOOTING.md` (older guide, mostly superseded)
