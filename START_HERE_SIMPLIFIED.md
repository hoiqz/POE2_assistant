# START HERE - Simplified Specification

## What Changed

You asked: "Can we do this simpler? Using APIs instead of building DBs, focusing on the AI assistant?"

**Answer**: YES. Much simpler. Much faster. Much better.

---

## The New Vision

**One sentence**: A lightweight AI assistant that helps players improve PoE2 builds through conversation.

**What it does**:
1. ✅ Users import their build from PathOfBuilding
2. ✅ Chat with Claude AI about improving it
3. ✅ Save suggested improvements
4. ✅ Export conversations as guides

**What it doesn't do**:
- ❌ Maintain gem/item databases
- ❌ Build complex DPS calculators
- ❌ Generate leveling guides automatically
- ❌ Aggregate community meta data

**Why**: Claude can handle all that better than we can in a database.

---

## The Numbers

### Original Plan
- 71 tasks
- 12 weeks
- 3-4 developers
- Complex architecture
- $150/month to run

### New Plan ⭐
- **24 tasks**
- **3 weeks**
- **1-2 developers**
- **Simple architecture**
- **$35/month to run**

---

## What You Have Now

### Documentation
1. **SPECIFICATION_SIMPLIFIED.md** ← Read this first (product overview)
2. **IMPLEMENTATION_SIMPLIFIED.md** ← Then read this (task breakdown)
3. **SIMPLIFIED_VS_ORIGINAL.md** ← Compare old vs new
4. **START_HERE_SIMPLIFIED.md** ← This file

### Task List
24 tasks organized into 6 phases (in VS Code todo list)

---

## Quick Start

### Step 1: Understand the Vision (15 minutes)
Read **SPECIFICATION_SIMPLIFIED.md**

Key sections:
- "What Gets Stored" (minimal database)
- "Core Features" (what the app does)
- "What the App Does NOT Do" (what we skip)

### Step 2: Understand the Plan (15 minutes)
Read **IMPLEMENTATION_SIMPLIFIED.md**

Key sections:
- "Timeline at a Glance"
- "Technology Stack"
- "API Endpoints (12 total)"

### Step 3: Start Building (3 weeks)
Follow the 24 tasks in order:
- Phase 1: Foundation (4 tasks)
- Phase 2: Build Import (3 tasks)
- Phase 3: AI Chat (5 tasks)
- Phase 4: Variants (3 tasks)
- Phase 5: Export (2 tasks)
- Phase 6: Polish (5 tasks)

---

## Database Schema (Complete)

All you need:

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP
);

-- Builds (just the raw PoB data)
CREATE TABLE builds (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  class VARCHAR(50),
  main_skill VARCHAR(100),
  build_data JSONB,  -- Raw PoB export
  created_at TIMESTAMP
);

-- Chat conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  build_id UUID REFERENCES builds(id),
  messages JSONB,  -- [{role, content, timestamp}, ...]
  created_at TIMESTAMP
);

-- Saved build variants from chat
CREATE TABLE build_variants (
  id UUID PRIMARY KEY,
  build_id UUID REFERENCES builds(id),
  variant_name VARCHAR(255),
  changes_summary TEXT,
  created_at TIMESTAMP
);
```

**That's it. 4 tables. 5MB for 1000 users.**

---

## API Endpoints (Simple List)

```
POST   /api/auth/signup              - Create account
POST   /api/auth/login               - Login
POST   /api/builds/import             - Import build from PoB
GET    /api/builds                    - List user's builds
DELETE /api/builds/:id                - Delete build
POST   /api/conversations/:id/message - Chat with Claude
GET    /api/conversations/:id        - Get conversation history
POST   /api/builds/:id/variants      - Save build variant
GET    /api/builds/:id/variants      - List variants
```

**12 endpoints. That's all.**

---

## Tech Stack

**Frontend**:
```
React + TypeScript (lightweight SPA)
TailwindCSS (styling)
React Query (API calls)
Zustand (simple state)
```

**Backend**:
```
Express.js + TypeScript
PostgreSQL (single database)
Claude SDK (the brain)
JWT (auth)
```

**Deployment**:
```
Frontend: Vercel (free)
Backend: Railway ($7/month)
Database: PostgreSQL on Railway (included)
Claude API: ~$20/month (depends on usage)
```

**Total cost**: ~$35/month for full app

---

## Timeline

```
Week 1: Foundation
  - Day 1-2: Frontend + Backend setup
  - Day 3: Database
  - Day 4-5: Build import working

Week 2: AI Integration
  - Day 1: Claude API setup
  - Day 2-3: Chat UI & conversations
  - Day 4-5: Save variants

Week 3: Polish & Deploy
  - Day 1-2: Export conversations
  - Day 3-4: Error handling, mobile
  - Day 5: Deploy to web
```

---

## Comparison: Original vs Simplified

### Original Approach
"Build everything from scratch"
- DPS calculator (complex math)
- Gem/item databases (10K+ rows)
- Patch scraper (maintenance headache)
- Leveling guide generator (manual content)
- Meta data aggregator (data pipeline)

### Simplified Approach ⭐
"Use Claude for the hard parts"
- DPS: Claude estimates
- Gems/Items: PoB provides them
- Patches: Claude learns them
- Leveling: Claude explains it
- Meta: Claude knows it

**Result**: Smaller, faster, better UX

---

## What to Read (In Order)

1. **This file** (you're reading it) ← 5 min
2. **SPECIFICATION_SIMPLIFIED.md** (what we're building) ← 10 min
3. **IMPLEMENTATION_SIMPLIFIED.md** (how to build it) ← 10 min
4. **SIMPLIFIED_VS_ORIGINAL.md** (why this is better) ← 10 min

Then start Task 1.1.

---

## Key Principles

### 1. Lean
Don't build what users don't ask for. Start with core features only.

### 2. AI-First
Use Claude for things that require understanding. Don't build complex engines.

### 3. Fast
3 weeks to MVP, not 12.

### 4. Simple
Minimal database, minimal code, minimal moving parts.

### 5. Extensible
Built so you can add features easily later based on user feedback.

---

## Success Looks Like

### Week 1
✅ Can sign up and login  
✅ Can import a build  
✅ Built infrastructure is solid  

### Week 2
✅ Can chat with Claude about build  
✅ Conversations save and reload  
✅ Can ask Claude anything about the build  

### Week 3
✅ Can save suggested builds  
✅ Can export conversation as guide  
✅ App is deployed and live  

**Total: 3 weeks to launch.**

---

## Next Steps

### Right Now
1. ✅ Read SPECIFICATION_SIMPLIFIED.md (15 min)
2. ✅ Read IMPLEMENTATION_SIMPLIFIED.md (15 min)

### Tomorrow
1. ✅ Open VS Code todo list (see 24 tasks)
2. ✅ Start Task 1.1: Initialize Frontend
3. ✅ Follow the implementation guide

### This Week
- Complete Phase 1 (foundation)
- Have basic app running locally

### Next Week
- Complete Phase 2 (build import)
- Complete Phase 3 (AI chat)

### Week 3
- Complete Phase 4-6 (polish & deploy)
- App is live

---

## FAQ

**Q: Will Claude always know about PoE2?**  
A: Yes, Claude's training includes PoE2 knowledge through Feb 2025. It won't know future patches, but you can mention them in prompts.

**Q: What if DPS estimates are wrong?**  
A: Users can verify in PoB. Claude's estimates are usually within 10%, good enough for conversation.

**Q: Can we add real DPS calculator later?**  
A: Yes! Start simple, add if users ask for it.

**Q: What about scaling to many users?**  
A: This architecture scales easily. Single Vercel + Railway can handle 10K+ users.

**Q: Do we need Redis caching?**  
A: No. Database is small, queries are fast. Add if needed later.

**Q: What if PoE2 gets a major patch?**  
A: Claude will know about it (or you mention it in prompts). No database updates needed.

---

## The Pitch (If You Need to Convince Someone)

**Before**: "We're building a PoE2 companion app with DPS calculator, gem database, item database, leveling guides, meta aggregator, theorycrafting engine."

**Result**: Complex project, 3-4 months, high maintenance.

**After** ⭐: "We're building a PoE2 companion app where Claude helps you improve your build through conversation."

**Result**: Simple project, 3 weeks, easy to maintain.

---

## You're Ready

You now have:
- ✅ Clear vision (AI assistant)
- ✅ Simplified specification
- ✅ Implementation plan (24 tasks)
- ✅ Timeline (3 weeks)
- ✅ Tech stack
- ✅ Database schema

**Everything to start building.**

Open VS Code, look at the todo list, start with Task 1.1.

You'll have a working app in 3 weeks. 🚀

---

## Questions?

Everything is documented:
- **SPECIFICATION_SIMPLIFIED.md** - What we're building
- **IMPLEMENTATION_SIMPLIFIED.md** - How to build it  
- **SIMPLIFIED_VS_ORIGINAL.md** - Why this approach

Good luck! 🎉

