# Solution Architect Review - TASKS.md

## Executive Summary

The TASKS.md is well-structured and achievable. However, there are **critical gaps and assumptions** that need clarification before you start building. This review identifies them and asks clarifying questions.

---

## ✅ What's Good

1. **Clear Structure** - Tasks are granular and self-contained
2. **Good Dependencies** - Each task builds logically on previous ones
3. **Practical Scope** - 3 weeks is realistic for 24 tasks
4. **Lean Architecture** - Minimal database, API-first approach
5. **Success Criteria** - Each task has clear done state

---

## ⚠️ Critical Gaps & Issues

### 1. **JWT_SECRET is Hardcoded (Security Risk)**

**Location**: Task 1.2.1 and Task 2.1.1

**Problem**: 
```typescript
const JWT_SECRET = 'your-secret-key-change-this'
```

This is in backend code and shared across both signup and auth middleware. If committed to git, it's exposed.

**Impact**: Medium severity in MVP, High severity at scale

**Needs Clarification**:
- [ ] Will you use `.env` files from the start?
- [ ] How will you handle environment variables during development vs. production?

---

### 2. **Database Connection String Has Hardcoded Credentials**

**Location**: Task 1.2.1, `backend/src/db.ts`

**Problem**:
```typescript
export const pool = new Pool({
  user: 'postgres',
  password: 'password',  // ← HARDCODED!
  host: 'localhost',
  port: 5432,
  database: 'poe2_companion'
})
```

**Impact**: High - your local development credentials are exposed

**Needs Clarification**:
- [ ] Will you use `.env` from task 1?
- [ ] Is the default password 'password' correct for your local setup?
- [ ] What if you're using a different PostgreSQL setup (Railway, Docker, etc.)?

---

### 3. **No API Documentation or Version Control**

**Problem**: No `.env.example`, no `.gitignore`, no documented API specification

**Impact**: Medium - When you deploy, you'll have to manually track what env vars are needed

**Needs Clarification**:
- [ ] Should we add `.env.example` and `.gitignore` to Task 1.1.1 and 1.1.2?
- [ ] Do you want API docs (OpenAPI/Swagger)?

---

### 4. **CORS is Wide Open**

**Location**: Task 1.1.2, `backend/src/server.ts`

**Problem**:
```typescript
app.use(cors())  // Allows ANY origin
```

**Impact**: Low for MVP, High for production

**Needs Clarification**:
- [ ] Should we restrict CORS to `http://localhost:3000` in development?
- [ ] How will you handle CORS in production (frontend at one domain, backend at another)?

---

### 5. **Input Validation is Missing Everywhere**

**Problem**: No validation in signup/login forms for:
- Email format
- Password strength
- Required fields
- Max length checks

**Impact**: Medium - Users can create invalid accounts

**Needs Clarification**:
- [ ] Do you want input validation (email regex, password min length)?
- [ ] Should this be added to Phase 1 or Phase 6?

---

### 6. **No Handling of Duplicate Emails**

**Location**: Task 1.2.1 - Signup

**Problem**:
```typescript
const result = await pool.query(
  'INSERT INTO users (email, password_hash) VALUES ($1, $2) ...',
  [email, hashedPassword]
)
```

If email already exists, PostgreSQL will throw an error, but the code doesn't handle it gracefully.

**Impact**: Low - user sees generic "Signup failed" error

**Needs Clarification**:
- [ ] Should we handle duplicate email more gracefully?
- [ ] Should frontend check email availability before submit?

---

### 7. **PathOfBuilding Import is Incomplete (TODO)**

**Location**: Task 2.1.1

**Problem**:
```typescript
if (pobUrl && !pobJson) {
  // TODO: Fetch from pob.party API
  buildData = {}  // ← Returns empty object!
}
```

If user provides URL instead of JSON, it returns empty build data.

**Impact**: High - One of two ways to import builds doesn't work

**Needs Clarification**:
- [ ] Do you want to implement PoB URL fetching in Task 2.1.1?
- [ ] Or should users always paste JSON, not URLs?
- [ ] Do you know the PoB export API endpoint format?

---

### 8. **No Error Handling in Claude Chat**

**Location**: Task 3.1.1

**Problem**:
```typescript
const aiResponse = await chatWithClaude(build.build_data, allMessages)
// What if Claude API fails?
// What if message is too long?
// What if API key is invalid?
```

No try/catch inside the call, no handling of Claude API errors specifically.

**Impact**: Medium - App crashes if Claude fails

**Needs Clarification**:
- [ ] Should we add specific Claude error handling?
- [ ] Should we add rate limiting for Claude API calls?
- [ ] Should we implement retry logic?

---

### 9. **No Token Refresh/Expiration**

**Location**: All authenticated tasks (1.2.1 onwards)

**Problem**: JWT tokens never expire. User logs in once, token is valid forever.

**Impact**: Medium - Security issue if token is compromised

**Needs Clarification**:
- [ ] Do you want token expiration (e.g., 7 days)?
- [ ] Should we implement refresh tokens?
- [ ] For MVP, is infinite expiration acceptable?

---

### 10. **No CORS Configuration in Frontend**

**Location**: Task 1.3.1

**Problem**: 
```typescript
const API = axios.create({
  baseURL: 'http://localhost:3000/api',
})
```

Frontend hardcodes `localhost:3000`. In production, backend will be at different domain.

**Impact**: Medium - CORS headers will fail in production

**Needs Clarification**:
- [ ] Will frontend and backend be on same domain (e.g., subdomain)?
- [ ] Should baseURL be environment-dependent?

---

### 11. **No Testing Plan**

**Location**: Task 6.3.1 (end of work)

**Problem**: "Test app end-to-end" is vague. No unit tests, no integration tests planned.

**Impact**: Low for MVP, High for maintainability

**Needs Clarification**:
- [ ] Do you want unit tests for critical functions?
- [ ] Do you want integration tests for API endpoints?
- [ ] What's your testing philosophy?

---

### 12. **Conversations Table Schema is Inefficient**

**Location**: Task 1.1.3

**Problem**:
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  build_id UUID NOT NULL,
  messages JSONB NOT NULL,  -- Stores entire conversation as one JSON blob
  created_at TIMESTAMP
);
```

Entire conversation is stored as one JSON array. Better design would normalize messages.

**Impact**: Low for MVP (works fine), Medium for scale (harder to query)

**Needs Clarification**:
- [ ] Is storing messages as JSON array acceptable for MVP?
- [ ] Do you foresee needing to query individual messages?

---

### 13. **No Build Validation Against Patch Data**

**Problem**: You're not checking if imported skills/items actually exist in PoE2

**Impact**: Low - App accepts invalid builds

**Needs Clarification**:
- [ ] Should you validate builds against patch data?
- [ ] Or accept any build regardless of validity?

---

### 14. **Frontend Has No State Management for Auth**

**Location**: Task 1.3.1

**Problem**: Token stored in localStorage, but no global auth state. Components check localStorage directly.

**Impact**: Low - Works but could be cleaner

**Needs Clarification**:
- [ ] Should you add Context/Redux for auth state?
- [ ] Is localStorage + direct checks acceptable for MVP?

---

## 🔍 Questions Before You Start

### **Architecture & Infrastructure**

1. **Environment Variables**
   - [ ] Will you create `.env.example` in Phase 1?
   - [ ] How will you handle local vs. production secrets?
   - [ ] Are you using macOS, Linux, or Windows?

2. **Database**
   - [ ] Local PostgreSQL or Railway cloud from start?
   - [ ] What's your actual PostgreSQL password (not 'password')?
   - [ ] Will you use Docker for database?

3. **Frontend/Backend Deployment**
   - [ ] Will frontend and backend be on same domain or different?
   - [ ] Example: `app.example.com` (both) vs `app.example.com` + `api.example.com`?

4. **PathOfBuilding Integration**
   - [ ] Do you have experience with PoB export format?
   - [ ] Do you know if pob.party API is publicly documented?
   - [ ] Should Task 2.1.1 handle URLs or just JSON paste?

---

### **Security & Compliance**

5. **Authentication**
   - [ ] Is JWT with no expiration acceptable for MVP?
   - [ ] Do you need HTTPS from start (affects localhost development)?
   - [ ] Should password reset be in MVP?

6. **Data Privacy**
   - [ ] Will you store user build data? (Answer: yes, but want to confirm)
   - [ ] Any GDPR or data retention requirements?
   - [ ] Can you share user builds publicly?

---

### **Claude API Integration**

7. **Claude Usage**
   - [ ] Do you have Claude API key already?
   - [ ] What's your expected usage? (impacts cost)
   - [ ] Should you implement rate limiting per user?

8. **PoE2 Knowledge Cutoff**
   - [ ] You know Claude's training cuts off Feb 2025, right?
   - [ ] PoE2 patch 0.5 may be newer - how will you handle it?
   - [ ] Should system prompt include patch notes?

---

### **Feature Scope**

9. **Build Import**
   - [ ] URL support (pob.party links) or just JSON paste?
   - [ ] Parse all PoB fields or just essential ones?
   - [ ] Validate build against patch data?

10. **Chat Features**
    - [ ] Should Claude chat be streaming responses or full response at end?
    - [ ] Max conversation length per build?
    - [ ] Should old conversations be pruned?

11. **Build Variants**
    - [ ] When user saves variant, should it create separate build or just snapshot?
    - [ ] Can variants branch into their own conversations?

12. **Export**
    - [ ] Markdown format only or also JSON?
    - [ ] Should export include conversation history?

---

### **Deployment & Operations**

13. **Monitoring**
    - [ ] Do you need error tracking (Sentry)?
    - [ ] Logs for debugging?
    - [ ] Uptime monitoring?

14. **Deployment Timeline**
    - [ ] Is "deployed by end of week 3" a firm deadline?
    - [ ] Can you iterate and fix bugs after launch?

15. **Rollback & Updates**
    - [ ] If you deploy a bug, can you roll back?
    - [ ] How do you handle database schema changes later?

---

### **Non-Technical**

16. **User Expectations**
    - [ ] Who are first users? (Friends, closed beta, open?)
    - [ ] What's success? (Number of users, engagement metric?)

17. **Maintenance**
    - [ ] Will you maintain this after launch?
    - [ ] How will you handle PoE2 patches?

18. **Feedback Loop**
    - [ ] How will users give feedback?
    - [ ] How will you prioritize new features?

---

## 📋 Recommended Pre-Flight Checklist

Before Task 1.1.1, complete these:

- [ ] **Have Anthropic API key** - Get from console.anthropic.com
- [ ] **Have PostgreSQL installed locally OR Railway account**
- [ ] **Decide: local or cloud database** - Impacts Task 1.1.3
- [ ] **Create `.env.example`** - Document all secrets needed
- [ ] **Decide: JWT expiration policy** - Impacts auth strategy
- [ ] **Decide: PoB import approach** - URL, JSON, or both?
- [ ] **Have Vercel account** - For Phase 6 deployment
- [ ] **Have Railway account** (optional) - For backend deployment

---

## 🚀 Recommended Changes to TASKS.md

Based on this review, consider:

1. **Add to Task 1.1.1**: Create `.env.example`
2. **Add to Task 1.1.2**: Document API endpoints (simple markdown doc)
3. **Add to Task 1.2.1**: Add email validation, duplicate email handling
4. **Add to Task 2.1.1**: Clarify PoB import approach (URL vs JSON)
5. **Add to Phase 1**: Add environment variable setup early
6. **Add to Phase 3**: Clarify Claude error handling
7. **Add to Phase 6**: Add security checklist before deployment

---

## 🎯 Next Steps

1. **Answer the 18 questions above** - This clarifies assumptions
2. **Update TASKS.md** with answers - Encode decisions in the tasks
3. **Create `.env.example`** - Template for all secrets
4. **Start Task 1.1.1** - You'll be much more prepared

---

## Summary Table

| Issue | Severity | Can Proceed? | Action |
|-------|----------|--------------|--------|
| JWT Secret hardcoded | Medium | ✅ Yes | Add to Phase 1 |
| DB credentials hardcoded | Medium | ✅ Yes | Use `.env` from start |
| No `.env.example` | Low | ✅ Yes | Create early |
| PoB URL import incomplete | High | ⚠️ Depends | Clarify import method |
| Claude error handling | Medium | ✅ Yes | Add to Phase 3 |
| Token expiration | Medium | ✅ Yes | Decide policy |
| CORS production issue | Medium | ✅ Yes | Handle in Phase 6 |
| No input validation | Low | ✅ Yes | Add to Phase 6 |
| No testing plan | Low | ✅ Yes | Add to Phase 6 |

---

**Can you proceed? YES, if you answer the 18 questions above.**

Would blocking issues? NO - all can be fixed during build.

---

## Now Your Turn

Please answer the critical questions above, especially:

1. **PoB Import**: URL, JSON, or both?
2. **Database**: Local or Railway cloud?
3. **JWT Expiration**: Infinite or with timeout?
4. **Frontend/Backend**: Same domain or different?
5. **Secrets**: How handle environment variables?

These answers will let me create an updated TASKS.md that's even more accurate.

