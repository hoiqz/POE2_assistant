# Master Task List - POE2 Build Companion

Each task is **self-contained** with all context needed. You can reset between tasks to keep Claude's context lean.

---

## Phase 1: Foundation (Week 1)

### Task 1.1.1: Create React Frontend Project
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 1.5 hours  
**Context**: This is the first task. Start here.

**What to do**:
```bash
cd /Users/qiangze/claudecode/POE/POE2-0.5
npx create-vite@latest frontend -- --template react-ts
cd frontend
npm install react-router-dom zustand axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Success criteria**:
- [x] `npm run dev` starts dev server on port 5173
- [x] Visit http://localhost:5173
- [x] No console errors
- [x] Tailwind CSS working (Tailwind 4.3.0 compiling correctly)

**Files created**:
- `frontend/` directory with React + TypeScript setup
- `tailwind.config.js` (manually created)
- `postcss.config.js` (updated for Tailwind 4.x)
- `frontend/src/style.css` (updated with Tailwind 4.x import)

**Notes**:
- Used Tailwind CSS 4.3.0 which requires `@tailwindcss/postcss` plugin
- Dev server running on http://localhost:5173
- All dependencies installed: react-router-dom, zustand, axios, tailwindcss, postcss, autoprefixer, @tailwindcss/postcss

**Next task**: 1.1.2

---

### Task 1.1.2: Create Express Backend Project
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 1.5 hours  
**Context**: Create backend API server. Can work in parallel with 1.1.1.

**What to do**:
```bash
cd /Users/qiangze/claudecode/POE/POE2-0.5
mkdir backend
cd backend
npm init -y
npm install express cors dotenv
npm install -D typescript ts-node @types/node @types/express
npx tsc --init
```

**Create files**:
- `backend/src/server.ts`:
```typescript
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

**Success criteria**:
- [ ] `npx ts-node src/server.ts` starts server
- [ ] Visit http://localhost:3000/api/health
- [ ] Returns `{ status: 'ok' }`
- [ ] No console errors

**Files created**:
- `backend/src/server.ts`

**Next task**: 1.1.3

---

### Task 1.1.3: Set Up PostgreSQL Database
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 1 hour  
**Context**: Create database and simple schema.

**What to do**:
1. Install PostgreSQL locally or use cloud option:
   - Local: `brew install postgresql` (macOS)
   - Cloud: Use Railway (free tier)

2. Create database:
```bash
createdb poe2_companion
```

3. Connect and create schema:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  class VARCHAR(50),
  main_skill VARCHAR(100),
  level INT,
  build_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  messages JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE build_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  variant_name VARCHAR(255) NOT NULL,
  changes_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_builds_user ON builds(user_id);
CREATE INDEX idx_conversations_build ON conversations(build_id);
CREATE INDEX idx_variants_build ON build_variants(build_id);
```

**Success criteria**:
- [ ] Database `poe2_companion` exists
- [ ] 4 tables created
- [ ] Indexes created
- [ ] Can connect and query tables

**Files created**:
- Database schema (no files, just SQL executed)

**Next task**: 1.2.1

---

### Task 1.2.1: Add User Auth to Backend (Signup)
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 2 hours  
**Context**: Create signup endpoint. Assumes backend from 1.1.2 exists.

**What to do**:
1. Install dependencies:
```bash
npm install pg bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

2. Create `backend/src/db.ts`:
```typescript
import { Pool } from 'pg'

export const pool = new Pool({
  user: 'postgres',
  password: 'password',
  host: 'localhost',
  port: 5432,
  database: 'poe2_companion'
})
```

3. Create `backend/src/routes/auth.ts`:
```typescript
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db'

const router = express.Router()
const JWT_SECRET = 'your-secret-key-change-this'

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    )
    
    const token = jwt.sign({ userId: result.rows[0].id }, JWT_SECRET)
    
    res.json({ token, user: result.rows[0] })
  } catch (error) {
    res.status(400).json({ error: 'Signup failed' })
  }
})

export default router
```

4. Update `backend/src/server.ts`:
```typescript
import authRouter from './routes/auth'
app.use('/api/auth', authRouter)
```

**Success criteria**:
- [ ] Can POST to `/api/auth/signup` with `{ email, password }`
- [ ] Returns JWT token
- [ ] User stored in database
- [ ] Passwords are hashed (not plain text)

**Files created**:
- `backend/src/db.ts`
- `backend/src/routes/auth.ts`
- Updated `backend/src/server.ts`

**Next task**: 1.2.2

---

### Task 1.2.2: Add User Auth to Backend (Login)
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 1.5 hours  
**Context**: Create login endpoint. Assumes 1.2.1 exists.

**What to do**:
1. Update `backend/src/routes/auth.ts`, add login route:

```typescript
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    const result = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    )
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' })
    }
    
    const user = result.rows[0]
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' })
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET)
    
    res.json({ token, user: { id: user.id, email: user.email } })
  } catch (error) {
    res.status(400).json({ error: 'Login failed' })
  }
})
```

**Success criteria**:
- [ ] Can POST to `/api/auth/login` with `{ email, password }`
- [ ] Returns JWT token for valid credentials
- [ ] Rejects invalid password
- [ ] Rejects non-existent user

**Files modified**:
- `backend/src/routes/auth.ts`

**Next task**: 1.3.1

---

### Task 1.3.1: Create Frontend Auth Pages (Layout & Types)
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 1.5 hours  
**Context**: Set up frontend structure. Assumes frontend from 1.1.1 exists.

**What to do**:
1. Create `frontend/src/types/index.ts`:
```typescript
export interface User {
  id: string
  email: string
}

export interface Build {
  id: string
  name: string
  class: string
  main_skill: string
}
```

2. Create `frontend/src/services/api.ts`:
```typescript
import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:3000/api',
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const auth = {
  signup: (email: string, password: string) =>
    API.post('/auth/signup', { email, password }),
  login: (email: string, password: string) =>
    API.post('/auth/login', { email, password }),
}

export default API
```

3. Create `frontend/src/components/Layout.tsx`:
```typescript
import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  
  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }
  
  if (!token) return <>{children}</> // Show login page
  
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">POE2 Build Companion</h1>
        <button onClick={logout} className="bg-red-600 px-4 py-2 rounded">
          Logout
        </button>
      </header>
      <div className="flex">
        <nav className="w-64 bg-slate-800 text-white p-4 min-h-screen">
          <ul className="space-y-2">
            <li><a href="/dashboard" className="hover:text-blue-400">Dashboard</a></li>
            <li><a href="/builds" className="hover:text-blue-400">Builds</a></li>
          </ul>
        </nav>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
```

**Success criteria**:
- [ ] Types file compiles
- [ ] API client created
- [ ] Layout component renders
- [ ] No TypeScript errors

**Files created**:
- `frontend/src/types/index.ts`
- `frontend/src/services/api.ts`
- `frontend/src/components/Layout.tsx`

**Next task**: 1.3.2

---

### Task 1.3.2: Create Frontend Auth Pages (Login & Signup)
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 2 hours  
**Context**: Create login/signup forms. Assumes 1.3.1 exists.

**What to do**:
1. Create `frontend/src/pages/Login.tsx`:
```typescript
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await auth.login(email, password)
      localStorage.setItem('token', response.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError('Login failed')
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-lg w-96">
        <h1 className="text-2xl mb-6">Login</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mb-4">
          Login
        </button>
        <a href="/signup" className="text-blue-600">Don't have account? Sign up</a>
      </form>
    </div>
  )
}
```

2. Create `frontend/src/pages/Signup.tsx`:
```typescript
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../services/api'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await auth.signup(email, password)
      localStorage.setItem('token', response.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError('Signup failed')
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded shadow-lg w-96">
        <h1 className="text-2xl mb-6">Sign Up</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mb-4">
          Sign Up
        </button>
        <a href="/login" className="text-blue-600">Already have account? Login</a>
      </form>
    </div>
  )
}
```

3. Update `frontend/src/App.tsx`:
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'

function App() {
  const token = localStorage.getItem('token')
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            token ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

4. Create `frontend/src/pages/Dashboard.tsx`:
```typescript
export default function Dashboard() {
  return <div><h2 className="text-3xl">Dashboard</h2><p>Welcome!</p></div>
}
```

**Success criteria**:
- [ ] Can navigate to /login
- [ ] Can enter email/password
- [ ] Can submit and get redirected to dashboard
- [ ] Can navigate to /signup
- [ ] Can create new account
- [ ] Token stored in localStorage
- [ ] No console errors

**Files created**:
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/Signup.tsx`
- `frontend/src/pages/Dashboard.tsx`
- Updated `frontend/src/App.tsx`

**Next task**: 2.1.1

---

## Phase 2: Build Import

### Task 2.1.1: Create Backend Endpoint for Build Import
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 1.5 hours  
**Context**: Create API to import builds from PoB.

**Do this task isolated**:
When you start this task, create a new Claude conversation and paste:
- This task description only
- Any error messages you hit
- Relevant code from `backend/src/`

**What to do**:
1. Create `backend/src/routes/builds.ts`:
```typescript
import express from 'express'
import { pool } from '../db'
import { authenticate } from '../middleware/auth'

const router = express.Router()

interface ParsedBuild {
  class: string
  ascendancy?: string
  mainSkill?: string
  level?: number
}

function parsePoB(data: any): ParsedBuild {
  // Simple extraction from PoB JSON
  return {
    class: data.classId || data.class || 'Unknown',
    ascendancy: data.ascendancyName,
    mainSkill: data.mainSkill?.gem?.name,
    level: data.level,
  }
}

router.post('/import', authenticate, async (req, res) => {
  try {
    const { name, pobUrl, pobJson } = req.body
    const userId = (req as any).userId
    
    // Parse build data
    let buildData = pobJson
    if (pobUrl && !pobJson) {
      // TODO: Fetch from pob.party API
      buildData = {}
    }
    
    const parsed = parsePoB(buildData)
    
    const result = await pool.query(
      'INSERT INTO builds (user_id, name, class, main_skill, build_data) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, name || 'Imported Build', parsed.class, parsed.mainSkill, buildData]
    )
    
    res.json(result.rows[0])
  } catch (error) {
    res.status(400).json({ error: 'Import failed' })
  }
})

export default router
```

2. Create `backend/src/middleware/auth.ts`:
```typescript
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

const JWT_SECRET = 'your-secret-key-change-this'

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'No token' })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    (req as any).userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

3. Update `backend/src/server.ts`:
```typescript
import buildsRouter from './routes/builds'
app.use('/api/builds', buildsRouter)
```

**Success criteria**:
- [ ] Can POST to `/api/builds/import` with auth token
- [ ] Returns saved build
- [ ] Build stored in database
- [ ] Rejects request without token

**Files created**:
- `backend/src/routes/builds.ts`
- `backend/src/middleware/auth.ts`
- Updated `backend/src/server.ts`

**Next task**: 2.1.2

---

### Task 2.1.2: Create Frontend Build Import Form
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 1.5 hours  
**Context**: Add UI to import builds.

**Do this task isolated**:
New Claude conversation with just this task.

**What to do**:
1. Create `frontend/src/pages/ImportBuild.tsx`:
```typescript
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'

export default function ImportBuild() {
  const [name, setName] = useState('')
  const [pobUrl, setPobUrl] = useState('')
  const [pobJson, setPobJson] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.post('/builds/import', {
        name,
        pobUrl: pobUrl || undefined,
        pobJson: pobJson ? JSON.parse(pobJson) : undefined,
      })
      navigate('/builds')
    } catch (err) {
      setError('Import failed')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl mb-6">Import Build</h2>
      <form onSubmit={handleImport} className="bg-white p-6 rounded shadow">
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block mb-2">Build Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">PathOfBuilding URL</label>
          <input
            type="text"
            value={pobUrl}
            onChange={(e) => setPobUrl(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="https://pob.party/share/..."
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Or Paste Build JSON</label>
          <textarea
            value={pobJson}
            onChange={(e) => setPobJson(e.target.value)}
            className="w-full border p-2 rounded font-mono text-sm"
            rows={10}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Importing...' : 'Import'}
        </button>
      </form>
    </div>
  )
}
```

2. Create `frontend/src/pages/Builds.tsx`:
```typescript
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'
import { Build } from '../types'

export default function Builds() {
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  
  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        const response = await API.get('/builds')
        setBuilds(response.data)
      } catch (error) {
        console.error('Failed to fetch builds')
      } finally {
        setLoading(false)
      }
    }
    
    fetchBuilds()
  }, [])
  
  return (
    <div>
      <h2 className="text-3xl mb-6">Your Builds</h2>
      <button
        onClick={() => navigate('/import')}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
      >
        Import Build
      </button>
      
      {loading ? (
        <p>Loading...</p>
      ) : builds.length === 0 ? (
        <p>No builds yet. Import one to get started!</p>
      ) : (
        <div className="space-y-4">
          {builds.map((build) => (
            <div key={build.id} className="bg-white p-4 rounded shadow">
              <h3 className="text-xl font-bold">{build.name}</h3>
              <p>{build.class} - {build.main_skill}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

3. Update `frontend/src/App.tsx` to add routes:
```typescript
import ImportBuild from './pages/ImportBuild'
import Builds from './pages/Builds'

// In Routes:
<Route path="/builds" element={<Layout><Builds /></Layout>} />
<Route path="/import" element={<Layout><ImportBuild /></Layout>} />
```

**Success criteria**:
- [ ] Can navigate to /import
- [ ] Can enter build name and JSON
- [ ] Can submit and get redirected to builds list
- [ ] Builds list shows imported builds
- [ ] Can navigate between pages

**Files created**:
- `frontend/src/pages/ImportBuild.tsx`
- `frontend/src/pages/Builds.tsx`
- Updated `frontend/src/App.tsx`

**Next task**: 3.1.1

---

## Phase 3: AI Chat

### Task 3.1.1: Set Up Claude API Backend
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 1 hour  
**Context**: Connect Claude API to backend. Set up conversation endpoint.

**Do this task isolated**:
New Claude conversation with just this task.

**What to do**:
1. Get Claude API key from Anthropic
2. Install dependency:
```bash
npm install @anthropic-ai/sdk
```

3. Create `backend/src/services/claude.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function chatWithClaude(
  buildData: any,
  messages: Array<{ role: string; content: string }>
) {
  const systemPrompt = `You are a Path of Exile 2 build advisor. You help players improve their builds through conversation.

Current build:
- Class: ${buildData.class || 'Unknown'}
- Main Skill: ${buildData.mainSkill || 'Unknown'}
- Level: ${buildData.level || 'Unknown'}

Full build data:
${JSON.stringify(buildData, null, 2)}

Help the player by:
1. Identifying weak points in their build
2. Suggesting improvements
3. Explaining trade-offs
4. Answering questions about the build

Be conversational and helpful.`

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages as any,
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
```

4. Create conversation endpoint in `backend/src/routes/builds.ts`:
```typescript
router.post('/:buildId/chat', authenticate, async (req, res) => {
  try {
    const { message } = req.body
    const { buildId } = req.params
    const userId = (req as any).userId

    // Get build
    const buildResult = await pool.query(
      'SELECT * FROM builds WHERE id = $1 AND user_id = $2',
      [buildId, userId]
    )
    
    if (!buildResult.rows.length) {
      return res.status(404).json({ error: 'Build not found' })
    }

    const build = buildResult.rows[0]

    // Get conversation history
    const convResult = await pool.query(
      'SELECT messages FROM conversations WHERE build_id = $1',
      [buildId]
    )
    
    const existingMessages = convResult.rows[0]?.messages || []
    
    // Add new message
    const allMessages = [...existingMessages, { role: 'user', content: message }]

    // Get Claude response
    const aiResponse = await chatWithClaude(build.build_data, allMessages)

    // Save conversation
    allMessages.push({ role: 'assistant', content: aiResponse })
    
    if (convResult.rows.length) {
      await pool.query(
        'UPDATE conversations SET messages = $1 WHERE build_id = $2',
        [JSON.stringify(allMessages), buildId]
      )
    } else {
      await pool.query(
        'INSERT INTO conversations (build_id, messages) VALUES ($1, $2)',
        [buildId, JSON.stringify(allMessages)]
      )
    }

    res.json({ message: aiResponse })
  } catch (error) {
    res.status(400).json({ error: 'Chat failed' })
  }
})
```

**Success criteria**:
- [ ] `ANTHROPIC_API_KEY` set in environment
- [ ] Can POST to `/api/builds/:buildId/chat` with message
- [ ] Returns response from Claude
- [ ] Conversation stored in database

**Files created/modified**:
- `backend/src/services/claude.ts`
- Updated `backend/src/routes/builds.ts`
- `.env` file with API key

**Next task**: 3.2.1

---

### Task 3.2.1: Create Frontend Chat Component
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 2 hours  
**Context**: Build chat UI.

**Do this task isolated**:
New Claude conversation with just this task.

**What to do**:
1. Create `frontend/src/pages/Chat.tsx`:
```typescript
import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import API from '../services/api'

export default function Chat() {
  const { buildId } = useParams<{ buildId: string }>()
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages((prev) => [...prev, { role: 'user', content: input }])
    setInput('')
    setLoading(true)

    try {
      const response = await API.post(`/builds/${buildId}/chat`, { message: input })
      setMessages((prev) => [...prev, { role: 'assistant', content: response.data.message }])
    } catch (error) {
      console.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-black'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your build..."
          disabled={loading}
          className="flex-1 border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
```

2. Update `frontend/src/pages/Builds.tsx` to add chat button:
```typescript
<button
  onClick={() => navigate(`/builds/${build.id}/chat`)}
  className="bg-blue-600 text-white px-4 py-2 rounded"
>
  Chat
</button>
```

3. Update `frontend/src/App.tsx`:
```typescript
import Chat from './pages/Chat'

// In Routes:
<Route path="/builds/:buildId/chat" element={<Layout><Chat /></Layout>} />
```

**Success criteria**:
- [ ] Can navigate to build chat
- [ ] Can type message
- [ ] Can send message
- [ ] Get response from Claude
- [ ] Messages display in order
- [ ] Loading state shows

**Files created/modified**:
- `frontend/src/pages/Chat.tsx`
- Updated `frontend/src/pages/Builds.tsx`
- Updated `frontend/src/App.tsx`

**Next task**: 4.1.1

---

## Phase 4: Build Variants

### Task 4.1.1: Save Build Variants
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 1.5 hours  
**Context**: Add button to save variants from chat.

**Do this task isolated**:
New Claude conversation with just this task.

**What to do**:
1. Add endpoint to `backend/src/routes/builds.ts`:
```typescript
router.post('/:buildId/variants', authenticate, async (req, res) => {
  try {
    const { variant_name, changes_summary } = req.body
    const { buildId } = req.params
    const userId = (req as any).userId

    const result = await pool.query(
      'INSERT INTO build_variants (build_id, variant_name, changes_summary) VALUES ($1, $2, $3) RETURNING *',
      [buildId, variant_name, changes_summary]
    )

    res.json(result.rows[0])
  } catch (error) {
    res.status(400).json({ error: 'Failed to save variant' })
  }
})
```

2. Update Chat component to show save button and modal:
In `frontend/src/pages/Chat.tsx`, add:
```typescript
const [showSaveModal, setShowSaveModal] = useState(false)
const [variantName, setVariantName] = useState('')

const handleSaveVariant = async () => {
  try {
    await API.post(`/builds/${buildId}/variants`, {
      variant_name: variantName,
      changes_summary: 'Variant from conversation',
    })
    setShowSaveModal(false)
    setVariantName('')
    alert('Variant saved!')
  } catch (error) {
    console.error('Failed to save variant')
  }
}

// Add button in UI:
<button
  onClick={() => setShowSaveModal(true)}
  className="bg-green-600 text-white px-4 py-2 rounded"
>
  Save Variant
</button>

// Add modal if showSaveModal
{showSaveModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded">
      <h3 className="text-xl mb-4">Save Variant</h3>
      <input
        type="text"
        value={variantName}
        onChange={(e) => setVariantName(e.target.value)}
        placeholder="e.g., More Tankier Build"
        className="w-full border p-2 mb-4 rounded"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSaveVariant}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>
        <button
          onClick={() => setShowSaveModal(false)}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
```

**Success criteria**:
- [ ] Can click save variant button
- [ ] Modal appears to name variant
- [ ] Can submit and variant is saved
- [ ] Variant stored in database

**Files modified**:
- `backend/src/routes/builds.ts`
- `frontend/src/pages/Chat.tsx`

**Next task**: 4.2.1

---

### Task 4.2.1: View Variants
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 1 hour  
**Context**: Create page to view saved variants.

**Do this task isolated**:
New Claude conversation with just this task.

**What to do**:
1. Add endpoint to `backend/src/routes/builds.ts`:
```typescript
router.get('/:buildId/variants', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM build_variants WHERE build_id = $1 ORDER BY created_at DESC',
      [req.params.buildId]
    )
    res.json(result.rows)
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch variants' })
  }
})
```

2. Create `frontend/src/pages/Variants.tsx`:
```typescript
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import API from '../services/api'

export default function Variants() {
  const { buildId } = useParams<{ buildId: string }>()
  const [variants, setVariants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const response = await API.get(`/builds/${buildId}/variants`)
        setVariants(response.data)
      } catch (error) {
        console.error('Failed to fetch variants')
      } finally {
        setLoading(false)
      }
    }

    fetchVariants()
  }, [buildId])

  return (
    <div>
      <h2 className="text-3xl mb-6">Build Variants</h2>
      {loading ? (
        <p>Loading...</p>
      ) : variants.length === 0 ? (
        <p>No variants yet. Save one from chat!</p>
      ) : (
        <div className="space-y-4">
          {variants.map((variant) => (
            <div key={variant.id} className="bg-white p-4 rounded shadow">
              <h3 className="text-xl font-bold">{variant.variant_name}</h3>
              <p className="text-sm text-gray-600">{variant.changes_summary}</p>
              <p className="text-xs text-gray-400">
                {new Date(variant.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

3. Update `frontend/src/App.tsx`:
```typescript
import Variants from './pages/Variants'

// In Routes:
<Route path="/builds/:buildId/variants" element={<Layout><Variants /></Layout>} />
```

4. Add link in Builds page to view variants

**Success criteria**:
- [ ] Can navigate to variants page
- [ ] Can see list of saved variants
- [ ] Can see variant name and date

**Files created/modified**:
- `backend/src/routes/builds.ts`
- `frontend/src/pages/Variants.tsx`
- Updated `frontend/src/App.tsx`

**Next task**: 5.1.1

---

## Phase 5: Export

### Task 5.1.1: Export Conversation
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 1 hour  
**Context**: Add export conversation as text.

**Do this task isolated**:
New Claude conversation with just this task.

**What to do**:
1. Add endpoint to `backend/src/routes/builds.ts`:
```typescript
router.get('/:buildId/chat/export', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT messages FROM conversations WHERE build_id = $1',
      [req.params.buildId]
    )

    if (!result.rows.length) {
      return res.status(404).json({ error: 'No conversation' })
    }

    const messages = result.rows[0].messages
    let text = '# Build Conversation Export\n\n'
    
    messages.forEach((msg: any) => {
      text += `## ${msg.role === 'user' ? 'You' : 'AI'}\n${msg.content}\n\n`
    })

    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Content-Disposition', 'attachment; filename="conversation.md"')
    res.send(text)
  } catch (error) {
    res.status(400).json({ error: 'Export failed' })
  }
})
```

2. Add button in Chat component:
```typescript
<button
  onClick={async () => {
    const response = await API.get(`/builds/${buildId}/chat/export`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(response.data)
    const a = document.createElement('a')
    a.href = url
    a.download = 'conversation.md'
    a.click()
  }}
  className="bg-purple-600 text-white px-4 py-2 rounded"
>
  Export
</button>
```

**Success criteria**:
- [ ] Can click export button
- [ ] File downloads as markdown
- [ ] Contains all messages

**Files modified**:
- `backend/src/routes/builds.ts`
- `frontend/src/pages/Chat.tsx`

**Next task**: 6.1.1

---

## Phase 6: Polish

### Task 6.1.1: Error Handling
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 1.5 hours  
**Context**: Improve error messages and handling throughout app.

**Do this task isolated**:
New Claude conversation with just this task.

**What to do**:
1. Create error handling utility `frontend/src/services/errorHandler.ts`:
```typescript
export function getErrorMessage(error: any): string {
  if (error.response?.data?.error) {
    return error.response.data.error
  }
  if (error.response?.status === 401) {
    return 'Unauthorized. Please login again.'
  }
  if (error.response?.status === 404) {
    return 'Resource not found.'
  }
  if (error.response?.status === 500) {
    return 'Server error. Please try again later.'
  }
  return error.message || 'Something went wrong'
}
```

2. Update all pages to use better error handling:
- Show error messages clearly
- Add try/catch to all API calls
- Show user-friendly messages

3. Add error boundaries to pages

**Success criteria**:
- [ ] Errors display to user
- [ ] App doesn't crash on error
- [ ] User can recover from errors

**Files created/modified**:
- `frontend/src/services/errorHandler.ts`
- Updated all page components

**Next task**: 6.2.1

---

### Task 6.2.1: Mobile Responsive Design
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 1.5 hours  
**Context**: Ensure app works on mobile.

**Do this task isolated**:
New Claude conversation with just this task.

**What to do**:
1. Update Layout component to be mobile-friendly
2. Make chat UI responsive
3. Make forms mobile-friendly
4. Test on mobile browser (or use browser dev tools)

**Success criteria**:
- [ ] Works on iPhone size
- [ ] Touch-friendly buttons
- [ ] Text readable on small screens
- [ ] No horizontal scrolling

**Files modified**:
- All component files with responsive tailwind classes

**Next task**: 6.3.1

---

### Task 6.3.1: Test End-to-End
**Status**: ✅ Complete (2026-05-26)
**Estimated**: 2 hours  
**Context**: Full manual testing flow.

**Do this task isolated**:
New Claude conversation with just this task.

**What to do**:
Test the complete flow:
1. [ ] Sign up new user
2. [ ] Login
3. [ ] Import a build
4. [ ] Chat with Claude about build
5. [ ] Save a variant
6. [ ] View variants
7. [ ] Export conversation
8. [ ] Delete build
9. [ ] Logout

Record any bugs or issues.

**Success criteria**:
- [ ] Full flow works without errors
- [ ] All buttons work
- [ ] Data persists

**Files**: None (testing only)

**Next task**: 6.4.1

---

### Task 6.4.1: Deploy Frontend
**Status**: ⬜ Pending  
**Estimated**: 1 hour  
**Context**: Deploy to Vercel.

**Do this task isolated**:
New Claude conversation with just this task.

**What to do**:
1. Push frontend to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy
5. Test live version

**Success criteria**:
- [ ] App accessible at live URL
- [ ] Can login and use app

**Next task**: 6.4.2

---

### Task 6.4.2: Deploy Backend
**Status**: ⬜ Pending  
**Estimated**: 1 hour  
**Context**: Deploy backend API.

**Do this task isolated**:
New Claude conversation with just this task.

**What to do**:
1. Set up Railway account
2. Deploy PostgreSQL database
3. Deploy Express backend
4. Set environment variables (API keys, database URL)
5. Test endpoints

**Success criteria**:
- [ ] Backend accessible at live URL
- [ ] Frontend can connect to live backend
- [ ] Everything works end-to-end

---

## Summary

**24 tasks organized for individual work**

Each task:
- ✅ Is self-contained
- ✅ Has specific success criteria
- ✅ Can be done in a fresh Claude conversation
- ✅ Doesn't require context from other tasks
- ✅ Builds on previous work without needing it explained

**Use this pattern**:
1. Pick the next task in order
2. Read the task description
3. Start a new Claude conversation
4. Paste the task (just this one)
5. Ask Claude to help you build it
6. Mark complete when done
7. Move to next task

This keeps each conversation lean and focused.

