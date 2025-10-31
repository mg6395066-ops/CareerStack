# Security Action Checklist - URGENT ⚠️

## IMMEDIATE ACTIONS (DO THIS NOW - Today!)

### 1. Secure Exposed Email Account ✅
**Status:** URGENT  
**Estimated Time:** 5 minutes

```bash
# Go to: https://accounts.google.com/security
# 1. Change password for 12shivamtiwari219@gmail.com
# 2. Enable 2-Step Verification
# 3. Review connected apps and remove any unauthorized
# 4. Check login activity for suspicious access
```

**Checklist:**
- [ ] Password changed to a strong unique password
- [ ] 2FA enabled on Gmail account
- [ ] Recent login activity reviewed
- [ ] Recovery email/phone updated

---

### 2. Remove Exposed Email from Git History ✅
**Status:** URGENT  
**Estimated Time:** 10 minutes

**DO THIS BEFORE PUSHING TO GITHUB AGAIN:**

```bash
# Option A: Using git filter-branch (for complete history cleanup)
git filter-branch --force --tree-filter \
  'find . -name ".env*" -o -name "*.example" | xargs sed -i "s/12shivamtiwari219@gmail.com/your-email@gmail.com/g"' \
  --prune-empty -- --all

# Force push (WARNING: This rewrites history)
git push origin --force --all
git push origin --force --tags
```

**Checklist:**
- [ ] Ran git filter-branch command
- [ ] Verified email no longer appears in history: `git log -S "12shivamtiwari219" --all`
- [ ] Force pushed to remote repository
- [ ] Notified GitHub Security Team (optional but recommended)

---

### 3. Generate & Update Secrets ✅
**Status:** URGENT  
**Estimated Time:** 10 minutes

```bash
# Generate new strong secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Copy output and update your PRODUCTION .env file:**
```bash
# DO NOT COMMIT THIS FILE TO GIT
# These should ONLY be in your deployment environment

JWT_SECRET=<paste-new-secret-here>
JWT_REFRESH_SECRET=<paste-new-secret-here>
SESSION_SECRET=<paste-new-secret-here>
ENCRYPTION_KEY=<paste-new-secret-here>
```

**Checklist:**
- [ ] Generated all 4 new secrets
- [ ] Updated production .env file (NOT committed to git)
- [ ] Verified .env is in .gitignore
- [ ] Old secrets are not used anywhere else

---

### 4. Verify Code Fixes Applied ✅
**Status:** COMPLETED  
**Changes Applied:**
- ✅ JWT secret fallback removed (`server/middleware/jwtAuth.ts`)
- ✅ Email address updated in `.env.example`
- ✅ Email address updated in `.env.production.example`
- ✅ HSTS header added to `server/index.ts`

**Verify with:**
```bash
# Check JWT_SECRET requires env var
grep -A 5 "const JWT_SECRET" server/middleware/jwtAuth.ts

# Check email placeholders updated
grep "EMAIL_USER" .env.example
grep "EMAIL_FROM" .env.example

# Check HSTS header present
grep -A 5 "hsts:" server/index.ts
```

---

## NEXT 24-48 HOURS

### 5. Test Code Changes ⏱️
**Estimated Time:** 30 minutes

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Type check
npm run check

# Build and test
npm run build
npm start
```

**Checklist:**
- [ ] No TypeScript errors
- [ ] No lint warnings
- [ ] Application starts without errors
- [ ] Can login successfully
- [ ] No hardcoded secrets in logs

---

### 6. Update Environment Setup ⏱️
**Estimated Time:** 15 minutes

Create a secure startup guide:

```bash
# Create scripts/setup-secrets.sh (add to .gitignore)
#!/bin/bash
echo "DO NOT COMMIT THIS FILE!"
echo "Generate secrets and set environment variables:"
echo ""
echo "JWT_SECRET=$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
echo "JWT_REFRESH_SECRET=$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
echo "SESSION_SECRET=$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
echo "ENCRYPTION_KEY=$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
```

**Checklist:**
- [ ] Created secure setup documentation
- [ ] Documented how to set environment variables
- [ ] Tested setup on clean machine

---

### 7. Enable CSRF Protection ⏱️
**Estimated Time:** 10 minutes

```bash
# Verify CSRF is enabled in your environment
grep "ENABLE_CSRF" .env
grep "ENABLE_CSRF" .env.production.example

# Should show: ENABLE_CSRF=true
```

**Fix:** Update `.env.production.example`:
```bash
# Before
ENABLE_CSRF=false

# After
ENABLE_CSRF=true
```

**Checklist:**
- [ ] CSRF enabled in production config
- [ ] Verified CSRF middleware is applied to state-changing routes
- [ ] Tested CSRF protection works

---

## THIS WEEK

### 8. Add Security Scanning to CI/CD ⏱️
**Estimated Time:** 1-2 hours

```bash
# Install security tools
npm install --save-dev audit-ci detect-secrets

# Add to package.json scripts
"security:audit": "npm audit --production",
"security:secrets": "detect-secrets scan",
"security:check": "npm run security:audit && npm run security:secrets"
```

**Add to `.github/workflows/ci.yml`:**
```yaml
- name: Security Audit
  run: npm run security:check
```

**Checklist:**
- [ ] audit-ci installed
- [ ] detect-secrets installed
- [ ] CI/CD pipeline includes security checks
- [ ] Tests pass without security warnings

---

### 9. Set Up GitHub Security Features ⏱️
**Estimated Time:** 15 minutes

1. Go to: `https://github.com/YOUR_ORG/YOUR_REPO/settings/security_analysis`

**Enable:**
- [ ] Dependabot alerts
- [ ] Dependabot security updates
- [ ] Secret scanning
- [ ] Code scanning (GitHub Advanced Security)

---

### 10. Create Security Policy ⏱️
**Estimated Time:** 30 minutes

Create `SECURITY.md` in repository root:

```markdown
# Security Policy

## Reporting Security Issues

DO NOT open a public GitHub issue for security vulnerabilities.

Instead, email: security@yourdomain.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 24 hours and work with you to patch the issue.

## Security Updates

We recommend:
- Keep Node.js updated
- Run `npm audit` regularly
- Enable Dependabot alerts
- Review security advisories

## Supported Versions

| Version | Status |
|---------|--------|
| 1.0.0   | Current |

## Security Best Practices

- Never commit `.env` files
- Use HTTPS in production
- Enable 2FA on all accounts
- Rotate secrets regularly
- Keep dependencies updated
```

**Checklist:**
- [ ] SECURITY.md created
- [ ] Email address configured
- [ ] Added to repository root

---

## BEFORE PRODUCTION LAUNCH

### 11. Security Headers Test ⏱️
Visit: https://securityheaders.com and enter your domain

**Target Score:** A+

**Current Configuration Status:**
- ✅ HSTS enabled in production
- ✅ CSP configured
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: strict-no-referrer

---

### 12. OWASP Dependency Check ⏱️

```bash
# Install
npm install --save-dev @owasp/dependency-check

# Run
npm run dependency-check
```

**Checklist:**
- [ ] No critical vulnerabilities
- [ ] All warnings reviewed
- [ ] Dependencies updated where possible

---

### 13. Database Security ⏱️

```bash
# Verify database is NOT accessible from internet
# Check pg connection settings
grep DATABASE_URL .env.production.example

# Should be: postgresql://user:pass@PRIVATE_IP_OR_LOCALHOST:5432/db
```

**Checklist:**
- [ ] Database port not exposed to internet
- [ ] Database user has minimal required permissions
- [ ] Database password is strong and unique
- [ ] SSL connection enabled for remote databases
- [ ] Backups encrypted
- [ ] Backup location secured

---

### 14. API Key Rotation ⏱️

```bash
# Rotate ALL keys before production:
- [ ] Gmail app-specific password
- [ ] Google Drive API keys
- [ ] Outlook OAuth credentials
- [ ] Database credentials
- [ ] Redis password
- [ ] JWT secret
- [ ] Session secret
```

---

### 15. Final Security Checklist ⏱️

```bash
# Run these commands to verify everything

# 1. Check for hardcoded secrets
grep -r "password\|secret\|token\|key" server/ --include="*.ts" | grep -v "process.env" | grep -v "//"

# 2. Check for console.log
grep -r "console\\.log" server/ --include="*.ts"

# 3. Verify .gitignore
cat .gitignore | grep -E "\\.env|node_modules|dist|secrets"

# 4. Check JWT enforcement
grep -A 3 "JWT_SECRET" server/middleware/jwtAuth.ts | grep "if (!JWT_SECRET)"

# 5. Check HTTPS enforcement
grep -B 2 "secure:" server/middleware/jwtAuth.ts

# Expected: secure: process.env.NODE_ENV === 'production'
```

**Checklist:**
- [ ] No hardcoded secrets found
- [ ] No console.log statements in production code
- [ ] .gitignore properly configured
- [ ] JWT secrets enforced
- [ ] HTTPS enforced in production

---

## DEPLOYMENT CHECKLIST

**Before deploying to production:**

- [ ] All CRITICAL issues fixed
- [ ] All HIGH severity issues fixed
- [ ] Security headers configured (A+ rating)
- [ ] Secrets rotated and secured
- [ ] Database backed up
- [ ] Monitoring and logging enabled
- [ ] Incident response plan documented
- [ ] Team trained on security practices
- [ ] Load testing completed
- [ ] Penetration testing completed (optional but recommended)
- [ ] SSL/TLS certificate installed
- [ ] WAF rules configured (if using WAF)
- [ ] DDoS protection enabled
- [ ] Backup and disaster recovery tested

---

## REFERENCE COMMANDS

```bash
# Generate secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check for secrets in code
git log -S "password" --all
git log -S "secret" --all
git log -S "token" --all

# View recent changes
git log --oneline -20

# Check what would be committed
git status

# Remove file from git history permanently
git rm --cached .env
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all

# Force push (DANGEROUS - use with caution)
git push origin --force --all
```

---

## SUPPORT RESOURCES

- **OWASP Top 10:** https://owasp.org/Top10
- **Node.js Security:** https://nodejs.org/en/docs/guides/nodejs-security/
- **Express Best Practices:** https://expressjs.com/en/advanced/best-practice-security.html
- **Helmet.js Docs:** https://helmetjs.github.io/
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8725

---

## STATUS TRACKING

Track your progress here:

| Task | Status | Completed Date | Notes |
|------|--------|-----------------|-------|
| Change Gmail password | ⏳ PENDING | | |
| Remove email from git history | ⏳ PENDING | | |
| Generate new secrets | ⏳ PENDING | | |
| Apply code fixes | ✅ DONE | 2025-10-31 | All fixes applied |
| Test changes | ⏳ PENDING | | |
| Update environment | ⏳ PENDING | | |
| Enable CSRF | ⏳ PENDING | | |
| Security scanning | ⏳ PENDING | | |
| GitHub security features | ⏳ PENDING | | |
| Create SECURITY.md | ⏳ PENDING | | |

---

**Last Updated:** 2025-10-31  
**Next Review:** After implementing all fixes
