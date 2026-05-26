# Path of Exile 2 Companion App - Simplified Specification

## Vision (Simplified)

A lightweight AI assistant that helps players improve their PoE2 builds through conversation. The app imports builds, stores user data, and uses AI (Claude) to provide build advice and improvements.

**Core Philosophy**: Don't maintain databases of game data. Call external APIs and rely on Claude's knowledge of PoE2 mechanics.

---

## 1. What Gets Stored

### Minimal Database Schema

Only store what's necessary:

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP
);

-- Imported Builds (the user's builds)
CREATE TABLE builds (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  class VARCHAR(50),
  imported_data JSONB,        -- Raw PoB/character data
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  build_id UUID REFERENCES builds(id),
  messages JSONB,             -- Array of messages
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Saved Variants (builds suggested by AI)
CREATE TABLE build_variants (
  id UUID PRIMARY KEY,
  build_id UUID REFERENCES builds(id),
  variant_name VARCHAR(255),
  changes_made TEXT,          -- Summary of changes
  created_at TIMESTAMP
);
```

**That's it.** No gems table, no items table, no passives table, no patch notes table.

---

## 2. Data Sources (External APIs)

Instead of maintaining databases, call external APIs:

### External APIs Used

1. **PathOfBuilding Export API** (free)
   - When user pastes PoB URL → fetch their build data
   - Contains: class, skills, gear, passives, stats

2. **PoE2 Community Data** (optional)
   - Check if build uses items that exist in current patch
   - Warn if item is outdated

3. **Claude API** (required)
   - Ask Claude about mechanics
   - Ask Claude for build improvements
   - Claude has knowledge of PoE2 (from training data through Feb 2025)

4. **Simple PoE2 API** (if available in future)
   - Quick validation that items/gems exist
   - Otherwise, skip this step

### What We Don't Do

❌ Maintain gem database  
❌ Maintain item database  
❌ Maintain passive tree database  
❌ Maintain patch notes archive  
❌ Cache game data globally  

**Why?** External sources already have this. We just call them when needed.

---

## 3. Core Features (Simplified)

### 3.1 Build Import

```
User: "Import this build"
↓
Paste PoB URL or character data
↓
Fetch from PathOfBuilding
↓
Store raw JSON in database
↓
Parse: name, class, main skill
↓
Display build
```

**API Call**: `POST /api/builds/import`
- Input: PoB URL or character JSON
- Output: Stored build
- No validation, no game data lookup

### 3.2 Build List

Simple list of user's imported builds:
- Build name
- Class / Ascendancy
- Level (if available)
- Delete button

---

### 3.3 AI Build Advisor (MAIN FEATURE)

This is what the app is really about.

```
User imports build
    ↓
User opens "Ask AI"
    ↓
Chat interface with AI
    ↓
User: "How can I improve this?"
    ↓
Claude analyzes build (from stored JSON)
    ↓
Claude suggests improvements
    ↓
User: "Tell me more about X"
    ↓
Claude elaborates (has context from conversation)
    ↓
User: "Save this suggestion"
    ↓
Store conversation + variant in database
```

**API Call**: `POST /api/ai/chat`
- Input: build JSON + user message + conversation history
- Claude analyzes and responds
- Response includes suggestions with explanations
- No external game data needed - Claude knows PoE2

---

### 3.4 Conversation Management

Store all conversations so user can:
- Reference past advice
- Build on previous suggestions
- Export conversation as guide

**API Call**: `GET /api/conversations/:buildId`
- Returns: Full conversation history
- User can continue previous conversation

---

### 3.5 Build Variants

When AI suggests improvements, user can:
- Save the suggested build
- Name it ("HC Version", "Budget Build", etc)
- Keep original for comparison

**API Call**: `POST /api/builds/:id/variants`
- Save variant to database
- Can compare to original

---

## 4. What the App Does NOT Do

### Removed Complexity

❌ **No DPS Calculator** - Claude estimates it, ask for PoB link if needed  
❌ **No Survival Analyzer** - Claude looks at the build and advises  
❌ **No Leveling Guides** - Claude can explain leveling if asked  
❌ **No Meta Data Integration** - Claude knows meta from training  
❌ **No Patch Notes Display** - User can check official site  
❌ **No Optimization Suggestions Engine** - Claude provides suggestions  
❌ **No Build Comparison UI** - Claude compares builds in conversation  

Why? Because **Claude can do all of this** through conversation, and we don't need to build complex calculation engines.

---

## 5. Tech Stack (Simplified)

### Frontend
- **React + TypeScript** (lightweight)
- **TailwindCSS** (styling)
- **React Query** (API calls)
- **Zustand** (simple state)

**Size**: ~100KB bundle

### Backend
- **Node.js + Express** (minimal)
- **PostgreSQL** (just the small schema above)
- **Claude SDK** (the heavy lifting)

**Database Size**: <1MB for 1000 users

### Infrastructure
- **Single server** (no scaling needed initially)
- **Vercel or similar** for frontend
- **Railway or Fly.io** for backend + database
- **No Redis needed** (data is small)

### What We Need

```
Frontend (React app)
    ↓
Backend API (Express)
    ├─ User auth
    ├─ Build storage
    ├─ Conversation history
    └─ Claude API wrapper
    ↓
Database (PostgreSQL)
    └─ Users, builds, conversations
    
(External APIs called from backend)
    ├─ PathOfBuilding API
    └─ Claude API
```

---

## 6. User Experience Flow

### Scenario: Player wants to improve their build

```
1. Open app
   ├─ See "Your Builds" list
   └─ See "Import New Build" button

2. Import build
   ├─ Paste PathOfBuilding URL
   ├─ Or paste character JSON
   └─ Build appears in list

3. Open build
   ├─ See basic info: class, main skill, level
   ├─ See "Chat with AI" button
   └─ See "Previous Conversations" (if any)

4. Click "Chat with AI"
   ├─ See character summary
   │  └─ Class, skills, approximate level
   └─ Chat input

5. Ask question
   ├─ User: "How can I improve survivability?"
   ├─ Claude: "I see you have X life, Y armor. I recommend..."
   │  └─ Suggestions with reasoning
   ├─ User: "Which is easiest?"
   ├─ Claude: "Option A requires fewest changes..."
   └─ User: "Save this variant"

6. Save variant
   ├─ Name: "More Tanky Build"
   ├─ Summary: Auto-generated from conversation
   └─ Can view later

7. Export
   ├─ Download conversation as text
   ├─ Or share link (future)
   └─ Can continue conversation anytime
```

**Total UI**: ~5 pages
- Login page
- Build list page
- Build detail page
- Chat page
- Settings page

---

## 7. API Endpoints (Minimal)

```
Authentication
  POST   /api/auth/signup
  POST   /api/auth/login
  POST   /api/auth/logout

Builds
  POST   /api/builds/import         # Import from PoB URL
  GET    /api/builds                # List user's builds
  GET    /api/builds/:id            # Get build details
  DELETE /api/builds/:id            # Delete build

Conversations
  POST   /api/conversations/:buildId/message   # Send message
  GET    /api/conversations/:buildId           # Get history
  DELETE /api/conversations/:buildId           # Clear history

Variants
  POST   /api/builds/:id/variants   # Save variant
  GET    /api/builds/:id/variants   # List variants
  DELETE /api/builds/:id/variants/:variantId

Total: ~12 endpoints (vs 50+ in original)
```

---

## 8. What Claude Needs to Know

Instead of game data in our database, we pass context to Claude:

```typescript
interface BuildContext {
  class: string                    // "Witch"
  ascendancy: string              // "Occultist"
  mainSkill: string               // "Fireball"
  supports: string[]              // ["Added Cold Damage", ...]
  keyPassives: string[]           // ["Critical Strike Chance", ...]
  level: number                   // 70
  rawPoB: string                  // Full PoB export JSON
  rawStats?: {                    // If we can extract from PoB
    dps: number
    life: number
    resistances: { fire: number, cold: number, lightning: number }
  }
}

interface SystemPrompt {
  buildContext: BuildContext
  userPreferences: {
    difficulty: "SC" | "HC" | "SSF"
    priority: "damage" | "survival" | "balanced"
    budget?: number
  }
  instructions: string  // "You are a PoE2 expert..."
}
```

Claude receives this context and:
- Understands the build
- Knows PoE2 mechanics (from training)
- Can suggest improvements
- Can explain trade-offs
- Can answer questions about the build

---

## 9. Success Criteria

### MVP (Week 1-2)
- [ ] User can sign up and login
- [ ] User can import build from PoB URL
- [ ] User can chat with AI about build
- [ ] Chat stores message history
- [ ] User can save variant from conversation

### Phase 2 (Week 2-3)
- [ ] Multi-turn conversations work smoothly
- [ ] Claude suggestions are helpful
- [ ] User can export conversation
- [ ] User can view previous conversations

### Phase 3 (Week 3-4)
- [ ] Support multiple builds per user
- [ ] Performance is snappy (<2s API calls)
- [ ] App is mobile-responsive
- [ ] Error handling is graceful

---

## 10. Implementation Phases (Simplified)

### Phase 1: Foundation (Week 1)
- Frontend: React app with routing, login, build list
- Backend: Express API, user auth, PostgreSQL
- Feature: Import builds, store them

### Phase 2: AI Integration (Week 2)
- Claude API integration
- Chat interface
- Conversation storage
- System prompt with build context

### Phase 3: Polish (Week 3)
- Variant saving
- Conversation export
- Error handling
- UI refinement

**Total: 3 weeks for MVP**

---

## 11. Why This Is Better

| Aspect | Original | Simplified |
|--------|----------|-----------|
| Database size | 100MB+ | <5MB |
| Code complexity | 10K+ lines | 2-3K lines |
| External APIs called | 5-10 | 1-2 |
| DPS calculation | Complex math engine | Claude estimates |
| Maintenance | High (patch updates) | Low (Claude handles it) |
| Leveling guides | Manual creation | Claude provides on-demand |
| Meta data | Aggregated + cached | Claude knows meta |
| Cost | Infrastructure heavy | API-first (cheaper) |
| Time to MVP | 4-6 weeks | 1-2 weeks |
| Team size | 3-4 people | 1-2 people |

---

## 12. Future Enhancements (If Needed)

Once MVP works, optionally add:

- Local DPS calculator (for accuracy)
- Leveling guide generation (pre-rendered)
- Patch notes scraper (sync updates)
- Community builds showcase (user-submitted)
- Multiplayer build collaboration
- Discord bot

But none of these are required for core functionality.

---

## 13. Potential Issues & Solutions

| Issue | Solution |
|-------|----------|
| Claude might hallucinate item names | User pastes real PoB data, so Claude sees actual items |
| No real-time DPS accuracy | Claude estimates, user can verify in PoB |
| Offline mode impossible | Accept it - it's an online assistant |
| Rate limiting on Claude API | Queue requests, cache responses, show user wait time |
| User uploads broken PoB data | Parse error handling, suggest re-exporting |

---

## 14. Cost Estimate

### Infrastructure (per month)
- Frontend hosting: $5-10 (Vercel)
- Backend + database: $10-20 (Railway/Fly.io)
- Claude API: ~$0.10 per user/month (depends on usage)

**Total: ~$20-30/month for 100 users**

Original approach would be $50-100/month (due to database size, Redis).

---

## 15. Database Schema (Complete)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Builds
CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  class VARCHAR(50),
  ascendancy VARCHAR(100),
  main_skill VARCHAR(100),
  level INT,
  build_data JSONB NOT NULL,  -- Full PoB export
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  messages JSONB NOT NULL,  -- Array: [{role, content, timestamp}, ...]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (build_id) REFERENCES builds(id) ON DELETE CASCADE
);

-- Build Variants (suggested builds from conversations)
CREATE TABLE build_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  variant_name VARCHAR(255) NOT NULL,
  changes_summary TEXT,  -- What changed
  suggested_by TEXT,     -- "AI", "user", etc
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (build_id) REFERENCES builds(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_builds_user ON builds(user_id);
CREATE INDEX idx_conversations_build ON conversations(build_id);
CREATE INDEX idx_variants_build ON build_variants(build_id);
```

**Total storage per 1000 users**: ~50MB

---

## 16. Next Steps

1. Update TASK_BREAKDOWN_SUMMARY.md with new task list
2. Update IMPLEMENTATION_GUIDE.md with simplified phases
3. Start with simplified Phase 1 (just user auth + build import)
4. Move to Phase 2 (AI chat integration)

This approach is **much leaner** and gets to MVP **much faster**.

