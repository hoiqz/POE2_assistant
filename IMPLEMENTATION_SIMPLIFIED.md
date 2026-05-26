# Simplified Implementation Guide

## Overview

This is a **lean, AI-first app** that helps players improve PoE2 builds through conversation.

**24 total tasks. 3 weeks to MVP.**

---

## Implementation Status (as of 2026-05-26)

**Progress**: 1 of 24 tasks complete (4%)

### Completed
- ✅ Task 1.1.1: React Frontend Project
  - Vite + TypeScript + React 19.2.6
  - Tailwind CSS 4.3.0 configured
  - Dev server running on http://localhost:5173
  - All dependencies installed and verified

### Current Focus
- ⏭️ Task 1.1.2: Express Backend Project (next)

### Updated Tech Stack Notes
- **Frontend**: Using Vite (faster) instead of traditional CRA
- **Tailwind**: Version 4.3.0 (requires @tailwindcss/postcss plugin)
- **React**: 19.2.6 (latest version)
- **Dev Environment**: Working perfectly, HMR enabled

---

## Phase 1: Foundation (3-4 days)

### Task 1.1: Initialize Frontend
**Time**: 2-3 hours  
**What**: React + TypeScript + Routing + Auth Pages

Create a React app with:
- Login page
- Signup page
- Dashboard (after login)
- Navigation

**Files to create**:
```
src/
├── pages/
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   ├── BuildDetail.tsx
│   └── Chat.tsx
├── components/
│   └── Layout.tsx
├── services/
│   └── api.ts
└── App.tsx
```

**Success**: Can navigate between pages, login form works (no actual auth yet)

---

### Task 1.2: Initialize Backend
**Time**: 2-3 hours  
**What**: Express server with basic auth routes

Create an Express server with:
- `/api/auth/signup` - POST (creates user)
- `/api/auth/login` - POST (returns token)
- `/api/builds` - GET/POST (list/create builds)

**Files to create**:
```
backend/
├── routes/
│   ├── auth.ts
│   └── builds.ts
├── middleware/
│   └── auth.ts
├── database.ts
└── server.ts
```

**Success**: Can signup and login, get JWT token

---

### Task 1.3: Set up PostgreSQL
**Time**: 1 hour  
**What**: Create simple database schema

```sql
-- Only 4 tables!
CREATE TABLE users (...)
CREATE TABLE builds (...)
CREATE TABLE conversations (...)
CREATE TABLE build_variants (...)
```

**Success**: Can connect to database, tables exist

---

### Task 1.4: Connect Frontend to Backend
**Time**: 2 hours  
**What**: API client, localStorage for tokens

Frontend can:
- Call signup endpoint
- Call login endpoint
- Store token in localStorage
- Make authenticated requests

**Success**: Signup → Login → See Dashboard

---

## Phase 2: Build Import (2-3 days)

### Task 2.1: Parse PathOfBuilding Exports
**Time**: 3-4 hours  
**What**: Extract build data from PoB URL/JSON

```typescript
interface ParsedBuild {
  class: string
  ascendancy: string
  mainSkill: string
  level: number
  rawData: JSON  // Full PoB export
}

function parsePoB(url: string): ParsedBuild {
  // Fetch from pob.party API or parse JSON
  // Extract class, ascendancy, skills, etc
  // Return structured data
}
```

**Success**: Can parse 5+ real PoB exports correctly

---

### Task 2.2: Store Builds in Database
**Time**: 2 hours  
**What**: API endpoint to save imported builds

`POST /api/builds/import`:
- Input: PoB URL or JSON
- Parse it
- Save to database
- Return saved build

**Success**: Can import build, see it in list

---

### Task 2.3: Build List UI
**Time**: 2 hours  
**What**: Show user's builds in a list

Display:
- Build name
- Class
- Main skill
- Delete button

**Success**: Can see imported builds, delete them

---

## Phase 3: AI Chat (4-5 days)

### Task 3.1: Set up Claude API
**Time**: 1 hour  
**What**: Test Claude API, get it working

```typescript
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

const message = await client.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hi" }],
})
```

**Success**: Can call Claude API, get responses

---

### Task 3.2: Create System Prompt
**Time**: 2 hours  
**What**: Design prompt that understands builds

```typescript
function buildSystemPrompt(build: Build): string {
  return `
You are a Path of Exile 2 expert assistant. You help players improve their builds.

Current build:
- Class: ${build.class}
- Ascendancy: ${build.ascendancy}
- Main skill: ${build.mainSkill}
- Level: ${build.level}

Full build data:
${JSON.stringify(build.rawData, null, 2)}

Help the player improve this build by:
1. Identifying weak points
2. Suggesting improvements
3. Explaining trade-offs
4. Answering questions about the build

Be conversational and helpful.
`
}
```

**Success**: Claude understands the build when you talk to it

---

### Task 3.3: Chat UI
**Time**: 3 hours  
**What**: React component for chat

Show:
- Character summary at top
- Messages in middle
- Input at bottom
- Streaming responses

```typescript
function ChatUI({ build }: { build: Build }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")

  async function sendMessage() {
    // Call /api/chat endpoint
    // Get streaming response
    // Display in UI
  }

  return (
    <div>
      <BuildSummary build={build} />
      <MessageList messages={messages} />
      <InputBox value={input} onChange={setInput} onSend={sendMessage} />
    </div>
  )
}
```

**Success**: Can chat with AI about build

---

### Task 3.4: Store Conversations
**Time**: 2 hours  
**What**: Save messages to database

`POST /api/conversations/:buildId/message`:
- Input: user message
- Get Claude response
- Save both to database
- Return response

**Success**: Can see chat history next time you open build

---

### Task 3.5: Continue Conversations
**Time**: 1 hour  
**What**: Load previous messages when reopening build

`GET /api/conversations/:buildId`:
- Load all previous messages
- Pass to Claude as context
- Continue conversation naturally

**Success**: Can pick up where you left off

---

## Phase 4: Save Suggestions (2 days)

### Task 4.1: Save Build Variants
**Time**: 2 hours  
**What**: When AI suggests improvements, user can save them

UI button: "Save This Build"
- Name the variant (e.g., "More Tankier", "HC Variant")
- Store in database
- Link to original build

```typescript
async function saveVariant(buildId, variantName, summary) {
  await api.post(`/api/builds/${buildId}/variants`, {
    variant_name: variantName,
    changes_summary: summary,
  })
}
```

**Success**: Can save suggested builds

---

### Task 4.2: View & Compare Variants
**Time**: 2 hours  
**What**: See saved variants, compare to original

Show:
- List of variants
- Original build
- Summary of changes
- Can delete variants

**Success**: Can view and compare build variants

---

## Phase 5: Export (1-2 days)

### Task 5.1: Export Conversation
**Time**: 1-2 hours  
**What**: Download conversation as text

`GET /api/conversations/:buildId/export`:
- Format messages as markdown
- Include build info at top
- Download as .txt file

**Success**: Can download conversation as guide

---

### Task 5.2: Share Link (Optional)
**Time**: 2-3 hours  
**What**: Create shareable link to conversation

Generate unique URL that shows conversation (read-only).

**Success**: Can share conversation with others

---

## Phase 6: Polish (2-3 days)

### Task 6.1: Error Handling
**Time**: 1-2 hours  
**What**: Handle errors gracefully

- API errors → show user message
- Claude errors → explain issue
- Network errors → retry logic
- Invalid PoB imports → helpful error message

**Success**: App doesn't crash on errors

---

### Task 6.2: Mobile Responsive
**Time**: 1-2 hours  
**What**: Works on phone

- Chat UI adapts to small screens
- Navigation works on mobile
- Buttons are touch-friendly
- Images resize properly

**Success**: Works on mobile browser

---

### Task 6.3: Loading States
**Time**: 1 hour  
**What**: Show user when things are loading

- Spinner when importing build
- "Claude is thinking..." when waiting for response
- Loading skeleton for conversations

**Success**: Clear feedback when loading

---

### Task 6.4: Testing
**Time**: 2-3 hours  
**What**: Test the entire app

Scenarios:
- Sign up → login → import build → chat
- Multi-turn conversation works
- Save variant and view it
- Export conversation
- Try on mobile

**Success**: Everything works end-to-end

---

### Task 6.5: Deploy
**Time**: 2-3 hours  
**What**: Put app on internet

Frontend: Vercel (free)  
Backend: Railway or Fly.io (~$5-10/month)

**Success**: App is live at a URL

---

## Timeline at a Glance

```
Week 1:
  Monday-Tuesday: Phase 1 (Foundation)
  Wednesday-Thursday: Phase 2 (Build Import)
  Friday: Phase 3 start (AI setup)

Week 2:
  Monday-Wednesday: Phase 3 (Chat & Conversations)
  Thursday-Friday: Phase 4 (Variants)

Week 3:
  Monday: Phase 5 (Export)
  Tuesday-Friday: Phase 6 (Polish & Deploy)
```

**Total: 3 weeks for complete MVP**

---

## What's Different from Original

| Original | Simplified |
|----------|-----------|
| 10 phases, 71 tasks | 6 phases, 24 tasks |
| DPS calculator | Claude estimates |
| Gem database | Call PoB API |
| Item database | Store only user's items |
| Patch notes scraper | User checks official site |
| Leveling guides | Claude explains on-demand |
| Community meta data | Claude knows from training |
| 3-4 weeks to MVP | 2-3 weeks to MVP |
| Complex architecture | Simple and lean |

---

## Technology Stack

**Frontend**:
- React + TypeScript
- TailwindCSS (styling)
- React Query (API calls)
- Zustand (state)

**Backend**:
- Express.js
- PostgreSQL (single database)
- Claude SDK
- JWT (auth)

**Infrastructure**:
- Vercel (frontend) - free
- Railway (backend) - $5-10/month
- PostgreSQL - included in Railway

**Total cost**: ~$5-10/month to run (without Claude API usage)

---

## API Endpoints (12 total)

```
Auth:
  POST /api/auth/signup
  POST /api/auth/login

Builds:
  POST /api/builds/import
  GET /api/builds
  DELETE /api/builds/:id

Chat:
  POST /api/conversations/:buildId/message
  GET /api/conversations/:buildId

Variants:
  POST /api/builds/:id/variants
  GET /api/builds/:id/variants
  DELETE /api/builds/:id/variants/:variantId
  GET /api/conversations/:buildId/export
```

---

## Database Schema (4 tables)

```sql
users (id, email, password_hash)
builds (id, user_id, name, class, build_data, created_at)
conversations (id, build_id, messages[], created_at)
build_variants (id, build_id, variant_name, changes_summary, created_at)
```

**Total data for 1000 users**: ~50MB

---

## Success Metrics

MVP is done when:
- ✅ Can signup and login
- ✅ Can import build from PoB URL
- ✅ Can chat with Claude about build
- ✅ Chat remembers previous messages
- ✅ Can save suggested builds
- ✅ Can export conversation
- ✅ Mobile responsive
- ✅ No errors in normal use
- ✅ App is deployed and live

---

## Key Principles

1. **AI-First** - Claude does the heavy lifting
2. **Minimal Data** - Only store what's necessary
3. **API-Driven** - Call external services, don't maintain databases
4. **Lean UI** - Simple, focused interface
5. **Fast Development** - Get to MVP in 3 weeks
6. **Easy Deployment** - Use managed services

---

## Next Steps

1. Read **SPECIFICATION_SIMPLIFIED.md** for full details
2. Start with **Task 1.1** - Frontend initialization
3. Follow the simplified todo list (24 tasks)
4. Deploy after 3 weeks

This is a **much simpler app** that achieves the core goal: **Help players improve PoE2 builds through AI conversation.**

