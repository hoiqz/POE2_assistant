# POE2 Build Companion - Lean Implementation Guide

## What This Is

A **simplified, AI-first web app** that helps Path of Exile 2 players improve builds through conversation with Claude.

## Project Status

**Progress**: 1/24 tasks complete (4%)

✅ **Completed**:
- Task 1.1.1: React Frontend Project (Vite + TypeScript + Tailwind)
  - Dev server running on http://localhost:5173

⏭️ **Next**: Task 1.1.2 - Create Express Backend Project

📊 **Details**: See [BUILD_PROGRESS.md](BUILD_PROGRESS.md) for full status

## Files in This Directory

### 📋 Core Documentation (Read in Order)
1. **START_HERE_SIMPLIFIED.md** - Quick overview (5 min read)
2. **SPECIFICATION_SIMPLIFIED.md** - What we're building
3. **IMPLEMENTATION_SIMPLIFIED.md** - How it works
4. **SIMPLIFIED_VS_ORIGINAL.md** - Why this approach is better

### 🎯 Tasks & Implementation
- **TASKS.md** ← **Use this to build** - 24 granular tasks, each self-contained
- **BUILD_PROGRESS.md** ← Current implementation status and session notes
- `CONSTITUTION.md` - Project principles (optional reading)

## How to Build This

### The Pattern

Each task in **TASKS.md** is designed to be built independently:

1. **Open TASKS.md** and find the next incomplete task
2. **Copy just that task description** (don't copy other tasks)
3. **Start a new Claude conversation**
4. **Paste the task**
5. **Ask Claude to help you build it**
6. **Complete the task** (usually 1-3 hours per task)
7. **Mark it done** in TASKS.md
8. **Move to next task**

### Why This Works

- Each task is **self-contained** - no need to remember previous work
- Each task has **success criteria** - you know when you're done
- Each Claude conversation is **lean** - just one task at a time
- No context bloat - each conversation is fresh

### Example

```
You: I'm starting Task 1.1.1. Here's the task:
[Paste Task 1.1.1 from TASKS.md]

Claude: Great! Let's create a React project. First, cd to the directory...
[Claude helps you complete the task]

You: Done! Task 1.1.1 is complete. Now Task 1.1.2:
[Start new conversation with just Task 1.1.2]
```

## Quick Reference

### Technologies
- **Frontend**: React + TypeScript + Tailwind
- **Backend**: Express.js + PostgreSQL  
- **AI**: Claude SDK
- **Deployment**: Vercel + Railway

### Database (4 tables only)
- `users` - user accounts
- `builds` - imported builds
- `conversations` - chat history
- `build_variants` - saved variants

### API Endpoints (12 total)
- Auth: signup, login
- Builds: import, list, delete
- Chat: send message, get history
- Variants: create, list
- Export: download conversation

### Timeline
- **Week 1**: Foundation + build import (Tasks 1.1-2.1)
- **Week 2**: AI chat integration (Tasks 3.1-4.2)
- **Week 3**: Polish & deploy (Tasks 5.1-6.4)

## Current Status

- [x] Specification complete
- [x] 24 tasks documented
- [ ] Ready to start building
- [ ] Task 1.1.1 is first task

## Next Steps

1. **Read START_HERE_SIMPLIFIED.md** (5 min)
2. **Open TASKS.md**
3. **Find Task 1.1.1** 
4. **Copy it**
5. **Start a new Claude conversation**
6. **Paste the task**
7. **Begin building!**

## For Context Resets

When starting a new task in a fresh Claude conversation, you might need:

- **Database schema**: In SPECIFICATION_SIMPLIFIED.md
- **API endpoints**: In IMPLEMENTATION_SIMPLIFIED.md  
- **Tech stack**: In START_HERE_SIMPLIFIED.md
- **Previous code**: Reference what you built in previous tasks

But **TASKS.md has everything you need for each task**.

## Key Principles

1. **Lean** - Minimal code, minimal database
2. **Simple** - 24 focused tasks, not 71 complex ones
3. **Fast** - 3 weeks to MVP, not 12
4. **AI-First** - Claude does heavy lifting
5. **Independent** - Each task is self-contained

## File Cleanup

Removed these to keep things lean:
- Original 71-task breakdown
- Original complex architecture
- Redundant documentation
- Old specifications

Kept only:
- Simplified specs (4 files)
- Task breakdown (TASKS.md)
- This guide (README.md)

## Cost & Deployment

- **Frontend**: Vercel (free)
- **Backend**: Railway (~$7/month)
- **Database**: Railway PostgreSQL (included)
- **Claude API**: ~$20/month (depends on usage)
- **Total**: ~$35/month

## Support

All documentation is self-contained in this directory. If you get stuck on a task:

1. **Read the task description** in TASKS.md carefully
2. **Check success criteria** - what should be true when done?
3. **Refer to SPECIFICATION_SIMPLIFIED.md** for architecture questions
4. **Check previous completed tasks** for code examples
5. **Start a fresh Claude conversation** with just that task

---

**Ready to build?** Open **TASKS.md** and start with **Task 1.1.1**!

