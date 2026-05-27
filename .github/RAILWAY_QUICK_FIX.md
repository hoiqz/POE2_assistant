# Railway Step 7 Error Fix - DATABASE_URL Not Injected

## Your Error
```
Database URL configured: No (using default)
DB Host: localhost
Database connection failed: ...
```

**This means**: Railway is NOT injecting the `DATABASE_URL` environment variable.

## Root Causes & Fixes

### Issue #1: DATABASE_URL Value is Wrong

**Check in Railway Dashboard**:
1. Backend service → Variables tab
2. Click on `DATABASE_URL`
3. See the value

**Fix Options**:

**Option A**: If value is blank or wrong, set it to:
```
${{Postgres.DATABASE_URL}}
```
(Railway will auto-replace with actual database URL)

**Option B**: If you see a dropdown when clicking the field:
1. Click the value field
2. A dropdown should appear showing "Postgres" or similar
3. Select it (Railway fills in the correct reference)

**Option C**: If PostgreSQL service isn't appearing in dropdown:
- PostgreSQL might not be fully initialized
- Wait 2-3 minutes and refresh Railway page
- Or use manual connection string:
  ```
  postgresql://username:password@host:port/database
  ```

### Issue #2: Database Tables Don't Exist

Even if DATABASE_URL is correct, backend fails if tables don't exist.

**Check if tables exist**:

1. **In Railway**, click PostgreSQL service
2. Click **"Connect"** or look for a database browser
3. **Run this query**:
   ```sql
   SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
   - If returns 0: tables don't exist (see Issue #3)
   - If returns 4+: tables exist, different problem

### Issue #3: Tables Not Created

**If tables are missing**, create them:

1. PostgreSQL service → Connect tab (or query editor)
2. **Run these SQL commands** (all at once):

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255),
  class VARCHAR(255),
  main_skill VARCHAR(255),
  level INTEGER,
  build_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id),
  messages JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS build_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id),
  variant_name VARCHAR(255),
  changes_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_builds_user ON builds(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_build ON conversations(build_id);
CREATE INDEX IF NOT EXISTS idx_variants_build ON build_variants(build_id);
```

3. Should see "Executed successfully"
4. Continue to next step

### Issue #4: Changes Haven't Been Deployed Yet

**If you just changed DATABASE_URL**:

1. Go to Backend service → **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes for new deployment
5. Check logs again for "Database connection successful"

## Quick Diagnostic Commands

Once DATABASE_URL is fixed and backend is running, test locally:

```bash
# Test what Railway is actually doing
# Set env var to what Railway should be using
export DATABASE_URL="postgresql://user:password@host:port/db"

cd backend
npx tsx src/server.ts
```

If this works locally with your real DATABASE_URL, then the issue is that Railway isn't injecting it properly.

## Checklist Before Proceeding

- [ ] `DATABASE_URL` variable exists in Backend Variables tab
- [ ] `DATABASE_URL` value is `${{Postgres.DATABASE_URL}}` OR a real PostgreSQL connection string
- [ ] PostgreSQL service is running (green status in Railway)
- [ ] Database tables exist (tested via query)
- [ ] Backend was redeployed after changing variables
- [ ] Latest deployment logs show "Database connection successful"

## Next: Verify It's Fixed

Once you've fixed the DATABASE_URL:

1. **Check logs again** - should show:
   ```
   Database URL configured: Yes (from env)
   Database connection successful
   Server running on port 3000
   ```

2. **Test the API**:
   ```bash
   curl -X POST https://poe2assistant-production.up.railway.app/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}' | jq .
   ```
   Should return token, not "Signup failed"

3. **Continue with Step 8** of main guide if working

## Still Not Working?

If after all this DATABASE_URL still shows as "No (using default)":

1. **Check service linking**:
   - Are Backend and PostgreSQL in the same Railway project?
   - They should be in the same project dashboard

2. **Try manual connection string**:
   - Instead of `${{Postgres.DATABASE_URL}}`
   - Get actual URL from PostgreSQL Connect tab
   - Paste real connection string directly

3. **Check PostgreSQL is actually running**:
   - PostgreSQL service should show green status
   - Click it - should show connection info
   - If red or not connecting, it might need restart

4. **Check env var name spelling**:
   - Must be exactly: `DATABASE_URL` (all caps)
   - Not `database_url` or `DB_URL`
