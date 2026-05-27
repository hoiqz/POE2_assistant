# 🚀 Getting Started with CI/CD Regression Testing

## 📋 Your Setup Checklist (5 steps)

### Step 1️⃣: Add GitHub Secret (2 minutes)
1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. **Name:** `ANTHROPIC_API_KEY`
5. **Value:** Your API key from https://console.anthropic.com/
6. Click "Add secret"

✅ **Done!** Your tests can now run.

---

### Step 2️⃣: Create a Test PR (optional, 5 minutes)
Test that everything works:

```bash
# Create test branch
git checkout -b test/ci-setup

# Create empty commit
git commit --allow-empty -m "Test CI setup"

# Push it
git push origin test/ci-setup

# Create PR on GitHub
```

Then go to your GitHub repo and create a PR from `test/ci-setup` to `main`.

✅ **Watch your tests run!** Go to the "Actions" tab and see your workflow in progress.

---

### Step 3️⃣: View Test Results (15 minutes)
After tests complete:

1. **In GitHub:** You'll see a green ✅ or red ❌ on your PR
2. **View report:** 
   - Click PR → Artifacts section
   - Download `playwright-report`
   - Extract and open `index.html` in your browser
3. **See details:** View which tests passed/failed

✅ **All 22 tests should pass!**

---

### Step 4️⃣: Merge or Close Test PR (1 minute)
- If it passed: Merge the test PR (optional)
- If it failed: Check `.github/CI_CD_SETUP.md` troubleshooting

✅ **Your CI/CD is now live!**

---

### Step 5️⃣: (Optional) Set Up Slack Notifications (5 minutes)

Get alerts when tests fail:

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name: `POE2 Tests` → Select workspace
4. Go to "Incoming Webhooks" section
5. Enable it, then "Add New Webhook"
6. Select your Slack channel
7. Copy the webhook URL
8. Go to GitHub Settings → Secrets
9. Add new secret: `SLACK_WEBHOOK_URL` = your webhook URL

✅ **Done!** You'll get Slack messages when tests fail.

---

## 📊 What You Now Have

| Feature | When | What Happens |
|---------|------|--------------|
| **E2E Regression Tests** | Every push/PR | 22 tests run automatically |
| **PR Gating** | When tests fail | PR shows red ❌, can't merge |
| **Smoke Tests** | Daily + manual | Production verification |
| **HTML Reports** | After each run | Full test results with screenshots |
| **Slack Alerts** | On failure | Notifications in Slack (optional) |

---

## 🎯 How It Works

### Your Development Flow Now Looks Like:

```
1. Make code changes
   ↓
2. Push to GitHub
   ↓
3. GitHub Actions automatically:
   - Installs dependencies
   - Starts backend server
   - Runs 22 tests
   - Generates report
   ↓
4. See results:
   ✅ Green = All tests pass, PR ready to merge
   ❌ Red = Tests failed, see why in report
   ↓
5. Merge when green
```

---

## 📚 Documentation

**Need more help?** Check these files:

| Need | Read This | Time |
|------|-----------|------|
| Quick reference | `CICD_QUICK_START.md` | 5 min |
| Detailed setup | `CI_CD_SETUP.md` | 15 min |
| Step-by-step | `SETUP_CHECKLIST.md` | 10 min |
| How it works | `../tests/CI_CD_OVERVIEW.md` | 10 min |

---

## ❓ Common Questions

**Q: Will my PRs be blocked if tests fail?**  
A: Yes! GitHub will show red ❌ and won't let you merge until tests pass.

**Q: How long do tests take?**  
A: ~12-15 minutes for the full suite. You can see progress in the Actions tab.

**Q: Can I run tests locally?**  
A: Yes! Run `npm run test:e2e` in your terminal anytime.

**Q: How do I debug a failing test?**  
A: Download the report from GitHub, view screenshots, then run `npm run test:e2e:headed` locally to see the browser.

**Q: Can I skip CI for a commit?**  
A: Yes! Add `[skip ci]` to commit message: `git commit -m "Fix [skip ci]"`

**Q: When do smoke tests run?**  
A: Daily at 2 AM UTC + you can manually trigger anytime in Actions tab.

---

## 🎉 You're All Set!

Your application now has:
- ✅ 22 automated tests
- ✅ Regression detection
- ✅ Production monitoring
- ✅ Beautiful test reports
- ✅ Slack alerts (optional)

**Next time you push code:** Watch GitHub Actions run your tests automatically! 🚀

---

## 📞 Having Issues?

1. Check `CI_CD_SETUP.md` → Troubleshooting section
2. Verify `ANTHROPIC_API_KEY` secret is set
3. Check GitHub Actions run logs for error details
4. Run tests locally: `npm run test:e2e:headed`

**Everything should work out of the box!**
