# CI/CD Quick Start (5 Minutes)

## 1️⃣ Set GitHub Secrets (2 min)

Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Click "New repository secret" and add:

| Secret | Value | Where to Get |
|--------|-------|--------------|
| `ANTHROPIC_API_KEY` | Your API key | https://console.anthropic.com/ |

Optional for Slack notifications:
| `SLACK_WEBHOOK_URL` | Your webhook | https://api.slack.com/apps → Create App → Incoming Webhooks |

## 2️⃣ Test It Out (3 min)

### Option A: Create a Test PR
```bash
git checkout -b test/cicd-setup
git commit --allow-empty -m "Test CI/CD"
git push origin test/cicd-setup
# Create PR on GitHub
```

Then watch the workflow run in **Actions** tab.

### Option B: Run Smoke Tests Manually
1. Go to **Actions** tab
2. Select **"Smoke Tests (Production)"**
3. Click **"Run workflow"**

## ✅ That's It!

Your regression tests are now running automatically on:
- ✅ Every push to `main`/`develop`
- ✅ Every pull request
- ✅ Daily at 2 AM UTC (smoke tests)

## 📊 View Results

**After each run:**
1. Go to **Actions** tab
2. Click the workflow run
3. Scroll to **Artifacts** section
4. Download `playwright-report` 
5. Open `index.html` in browser

**Or view directly in GitHub:**
- Click the green ✅ or red ❌ next to your commit

## 🔧 Common Tweaks

**Change when smoke tests run:**
Edit `.github/workflows/smoke-tests.yml`:
```yaml
schedule:
  - cron: '0 9 * * 1-5'  # Weekdays at 9 AM instead
```

**Test against production:**
Edit `.github/workflows/e2e-tests.yml`:
```yaml
env:
  BASE_URL: https://poe-2-assistant-ten.vercel.app
```

**Run all browsers (slow):**
```yaml
run: npm run test:e2e  # Instead of --project chromium
```

## 🆘 If Something Breaks

1. **Tests fail:** Check error in workflow → Download screenshot
2. **Backend won't start:** Check `ANTHROPIC_API_KEY` is set
3. **Slack notifications not working:** Verify webhook URL is correct

See `CI_CD_SETUP.md` for full troubleshooting guide.

## 📚 Full Documentation

See `.github/CI_CD_SETUP.md` for:
- Detailed workflow explanations
- Secret setup instructions
- Debugging guide
- Performance optimization
- Customization examples
