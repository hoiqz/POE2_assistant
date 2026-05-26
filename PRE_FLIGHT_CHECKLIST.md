# Pre-Flight Checklist - Before You Start Building

## ✅ Your Decisions Recorded

Based on your answers, here's what you've committed to:

| Decision | Your Choice | Impact |
|----------|------------|--------|
| **Build Import** | PoB URL only | Need to implement pob.party API fetch in Task 2.1.1 |
| **Database** | Local PostgreSQL | Use `brew install postgresql` (macOS) |
| **JWT Expiration** | 7 days with refresh | Adds refresh token logic to Task 1.2.1-1.2.2 |
| **Secrets** | .env files from start | Create .env.example in Task 1.1.1 |
| **Deployment** | Same domain | Simpler CORS setup, easier deployment |
| **Claude API** | Ready to go | Have API key before Task 3.1.1 |
| **Input Validation** | Yes, Phase 1 | Add email/password validation to signup |

---

## 🔧 Changes Needed to TASKS.md

These updates are **REQUIRED** before you start building:

### Task 1.1.1 (Frontend) - ADD:
```
4. Create `.env.example`:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```
```

### Task 1.1.2 (Backend) - ADD:
```
5. Create `.env.example`:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/poe2_companion
   JWT_SECRET=your-secret-key-change-this
   JWT_EXPIRATION=7d
   ANTHROPIC_API_KEY=sk-ant-...
   ```

6. Create `.gitignore`:
   ```
   .env
   .env.local
   node_modules/
   dist/
   build/
   ```
```

### Task 1.1.3 (Database) - UPDATE:
Change password from `'password'` to actual password you'll use locally.

### Task 1.2.1 (Auth Signup) - ADD:
```
Add email validation and duplicate email handling:

function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email) && email.length <= 255
}

function validatePassword(password: string): boolean {
  return password.length >= 8
}

If email validation fails, return 400 with message
If email already exists (unique constraint), return 409 with "Email already in use"
```

### Task 1.2.2 (Auth Login) - ADD:
```
Add JWT refresh token logic:

router.post('/refresh', authenticate, async (req, res) => {
  const userId = (req as any).userId
  const newToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token: newToken })
})

Also update login response to include expiresIn
```

### Task 1.3.1 (Frontend API) - UPDATE:
```
Update frontend/src/services/api.ts:

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

Also add token refresh logic:
API.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const newToken = await refreshToken()
      if (newToken) {
        localStorage.setItem('token', newToken)
        error.config.headers.Authorization = `Bearer ${newToken}`
        return API(error.config)
      } else {
        // Refresh failed, send to login
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
```

### Task 2.1.1 (Build Import) - IMPLEMENT:
```
Implement PoB URL fetching instead of TODO:

async function fetchPoBAstralite(url: string): Promise<any> {
  const match = url.match(/pob\.party\/share\/([A-Za-z0-9]+)/)
  if (!match) throw new Error('Invalid PoB URL')
  
  const buildId = match[1]
  // PoB.party API format (need to research exact endpoint)
  const response = await fetch(`https://pob.party/api/share/${buildId}`)
  const data = await response.json()
  return data
}

Then use it:
if (pobUrl && !pobJson) {
  buildData = await fetchPoBAstralite(pobUrl)
}
```

### Task 1.1.1 (Frontend) - ADD `npm run build`:
```
Add to package.json scripts:
"build": "tsc && vite build",
"preview": "vite preview"

(Needed for Phase 6 deployment)
```

### Task 1.1.2 (Backend) - ADD `npm run build`:
```
Add to package.json scripts:
"build": "tsc",
"start": "node dist/server.js",
"dev": "ts-node src/server.ts"

(Needed for Phase 6 deployment)
```

---

## 📦 Pre-Requisites Before Task 1.1.1

### Software
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] PostgreSQL installed locally (`psql --version`)
- [ ] Git installed (`git --version`)

### Accounts & Keys
- [ ] Anthropic API key (have it, don't need to use until Task 3)
- [ ] Vercel account (optional, needed for Phase 6 deployment)
- [ ] Railway account (optional, alternative to local postgres)

### Environment
- [ ] Know your PostgreSQL password (or use default 'postgres')
- [ ] Know macOS/Linux/Windows so can run correct commands
- [ ] Have VS Code or preferred editor open

### Directory Structure
```
/Users/qiangze/claudecode/POE/POE2-0.5/
├── TASKS.md (with your updates)
├── SPECIFICATION_SIMPLIFIED.md
├── README.md
├── .env (create in root later)
├── frontend/ (will create in Task 1.1.1)
└── backend/ (will create in Task 1.1.2)
```

---

## 🚀 Ready to Go Checklist

Before Task 1.1.1, confirm:

- [ ] **TASKS.md Updated** - Made all changes above
- [ ] **PostgreSQL Running** - `psql --version` returns a version
- [ ] **Node.js Ready** - `node --version` returns 18+
- [ ] **Git Initialized** (optional but recommended)
- [ ] **Claude API Key** - Save for Task 3.1.1
- [ ] **Read ARCHITECT_REVIEW.md** - Understand the gaps addressed

---

## Critical Files to Create

These should be created **as part of their respective tasks**:

**Frontend (.gitignore)**:
```
.env
.env.local
node_modules/
dist/
.DS_Store
```

**Frontend (.env.example)**:
```
VITE_API_URL=http://localhost:3000/api
```

**Backend (.gitignore)**:
```
.env
.env.local
node_modules/
dist/
.DS_Store
```

**Backend (.env.example)**:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/poe2_companion
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRATION=7d
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=development
```

---

## 🔑 Key Passwords/Secrets to Know

Before starting, finalize these (document in your .env):

1. **PostgreSQL Password**
   - Default: `postgres` or empty
   - Yours: _________

2. **JWT Secret**
   - Generate random string: Use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Example: `a3f9b2c1e8d7f4a6...`
   - Store in: `.env` (not in code)

3. **Claude API Key**
   - Get from: https://console.anthropic.com
   - Format: `sk-ant-...`
   - Store in: `.env` (not in code)

---

## ⚠️ Critical Gotchas to Avoid

1. **Don't commit .env files** - Add to .gitignore immediately
2. **Don't hardcode secrets** - Use environment variables
3. **Don't use weak passwords** - Especially for JWT_SECRET
4. **Don't forget Token Refresh** - Task 1.2.2 needs refresh logic
5. **Don't skip Input Validation** - You decided to add it
6. **Don't forget pob.party API** - Task 2.1.1 needs actual implementation

---

## What's Different from Original TASKS.md

These are ADDITIONS you need to make:

| Task | Addition | Reason |
|------|----------|--------|
| 1.1.1 | .env.example creation | Secrets management |
| 1.1.2 | .gitignore creation | Don't commit secrets |
| 1.1.2 | npm build script | Needed for deployment |
| 1.2.1 | Email validation | Phase 1 requirement |
| 1.2.1 | Duplicate email handling | Better UX |
| 1.2.2 | JWT refresh token | 7-day expiration requirement |
| 1.3.1 | Token refresh interceptor | Auto-refresh expired tokens |
| 2.1.1 | pob.party API fetch | URL import requirement |

---

## Database Setup (Task 1.1.3)

When you run Task 1.1.3, use:

```bash
# Create database
createdb poe2_companion

# Connect and create tables
psql poe2_companion < create_schema.sql
# Or paste the SQL from Task 1.1.3 manually
```

Your actual connection string will be:
```
postgresql://postgres:YOUR_PASSWORD@localhost:5432/poe2_companion
```

---

## Start Command (After Task 1.1.1 & 1.1.2)

To run BOTH frontend and backend (from project root):

```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm install pg bcryptjs jsonwebtoken  # Do in Task 1.2.1
cp .env.example .env  # Create .env
npm run dev

# Terminal 3 - Database
# Make sure PostgreSQL is running
psql poe2_companion  # Verify you can connect
```

---

## Next Steps

1. **Read ARCHITECT_REVIEW.md** - Understand all the issues identified
2. **Update TASKS.md** - Make all changes listed above
3. **Verify Prerequisites** - Node.js, PostgreSQL, API key ready
4. **Start Task 1.1.1** - You're ready!

---

## Questions During Building?

If you hit issues:

1. **Check ARCHITECT_REVIEW.md** - Might have already identified the issue
2. **Check the specific task** - Ensure you're following instructions exactly
3. **Start fresh Claude conversation** - Paste just that task and the error
4. **Reference previous completed tasks** - They might have the pattern you need

---

## You're Ready! 🚀

All assumptions are clarified, all decisions are recorded, all changes are documented.

**Next**: Update TASKS.md with the changes above, then start Task 1.1.1.

