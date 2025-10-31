# Security Audit Report - CareerStack Application
**Status:** PUBLIC REPOSITORY SECURITY REVIEW  
**Date:** 2025-10-31  
**Severity Levels:** CRITICAL | HIGH | MEDIUM | LOW

---

## EXECUTIVE SUMMARY
Your application is **PUBLICLY EXPOSED** on GitHub. This audit identified several security issues that need immediate attention before production deployment. Most concerns relate to configuration management and sensitive data exposure.

---

## CRITICAL ISSUES 🔴

### 1. **Hardcoded Email Credentials in Example Files**
**Location:** `.env.example`, `.env.production.example`  
**Severity:** CRITICAL  
**Issue:** Real Gmail email address exposed in example configuration files:
- `EMAIL_USER=12shivamtiwari219@gmail.com` appears in both `.env.example` and `.env.production.example`
- While marked as "examples," the actual Gmail address is publicly visible

**Risk:** Attackers can target this email account for:
- Password reset attempts
- Account enumeration
- Social engineering
- Spam/phishing campaigns

**Fix:**
```bash
# Replace in both files:
EMAIL_USER=your-email@gmail.com  # Use generic placeholder
EMAIL_FROM=Support Team <noreply@yourdomain.com>  # Use noreply address
```

**Action Items:**
- [ ] Change the exposed Gmail account password immediately
- [ ] Enable 2FA on the Gmail account
- [ ] Create an app-specific password for email sending
- [ ] Remove the real email from version history (see "GitHub History Cleanup" below)

---

### 2. **Weak Default JWT Secret in Code**
**Location:** `server/middleware/jwtAuth.ts` (line 14-15)  
**Severity:** CRITICAL  
**Issue:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
```

**Problem:** If environment variables aren't set, the app falls back to predictable hardcoded secrets. This completely breaks JWT security.

**Fix:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET environment variables are required');
}
```

**Action:** Apply this fix immediately to `server/middleware/jwtAuth.ts`

---

### 3. **Weak Default Encryption Key Fallback**
**Location:** `server/utils/tokenEncryption.ts` (or similar)  
**Severity:** CRITICAL  
**Issue:** Check for hardcoded fallback encryption keys

**Fix:** Ensure encryption keys NEVER have fallbacks:
```typescript
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  throw new Error('ENCRYPTION_KEY must be set and at least 32 characters');
}
```

---

## HIGH SEVERITY ISSUES 🟠

### 4. **GitHub Actions Secrets Exposure**
**Location:** `.github/workflows/db-push.yml`  
**Severity:** HIGH  
**Issue:** Database credentials passed in workflow files
```yaml
DATABASE_URL=${{ secrets.DATABASE_URL }}
```

**Risk:** If secrets are logged or exposed in build output

**Fixes:**
- [ ] Review all workflow logs at: https://github.com/YOUR_REPO/actions
- [ ] Rotate DATABASE_URL and all secrets used in workflows
- [ ] Never print secrets in logs
- [ ] Use `MASK::` or similar to mask sensitive output

---

### 5. **Weak Password Policy Check**
**Location:** `server/config.ts` (lines 85-90)  
**Severity:** HIGH  
**Issue:** Password requirements are defined but may not be strictly enforced

**Recommendation:**
```typescript
// Ensure validation happens during registration
const passwordRequirements = {
  minLength: 12,  // Increase from 8
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};
```

---

### 6. **Missing HTTPS Enforcement**
**Location:** `server/index.ts` & `server/middleware/jwtAuth.ts`  
**Severity:** HIGH  
**Issue:** HTTPS not strictly enforced
```typescript
secure: process.env.NODE_ENV === 'production',  // Line 305, 312
```

**Fix:** Add HSTS headers:
```typescript
app.use(helmet({
  hsts: {
    maxAge: 31536000,  // 1 year
    includeSubDomains: true,
    preload: true,
  }
}));
```

---

### 7. **CSRF Protection May Be Disabled**
**Location:** `.env.production.example` (line 51)  
**Severity:** HIGH  
**Issue:**
```
ENABLE_CSRF=false
```

**Risk:** Cross-Site Request Forgery attacks possible

**Fix:** Set to `true` in production:
```
ENABLE_CSRF=true
```

And verify CSRF middleware is applied to all state-changing routes.

---

### 8. **Session Configuration Issues**
**Location:** `server/localAuth.ts`  
**Severity:** HIGH  
**Issues:**
- Session store should use Redis (not memory) in production
- Default session timeout may be too long

**Fix:**
```typescript
// Ensure production uses Redis store
const store = process.env.NODE_ENV === 'production' 
  ? new RedisSessionStore({ client: redisService.getClient() })
  : new PgSession({ pool: pgPool });
```

---

## MEDIUM SEVERITY ISSUES 🟡

### 9. **SQL Query Parameters Not Validated**
**Recommendation:** Use Drizzle ORM query builder (already being used) - ensure NO raw SQL queries

**Action:** Audit for any `db.raw()` or template literal SQL queries:
```bash
grep -r "db.raw\|sql\`" server/ --include="*.ts"
```

If found, replace with Drizzle query builder:
```typescript
// ❌ Bad
const user = await db.query`SELECT * FROM users WHERE id = ${userId}`;

// ✅ Good
const user = await db.query.users.findFirst({
  where: eq(users.id, userId)
});
```

---

### 10. **No Rate Limiting on Auth Endpoints**
**Location:** Auth routes in `server/routes.ts`  
**Severity:** MEDIUM  
**Issue:** Brute force protection on login/register may be insufficient

**Recommendation:**
```typescript
app.post('/api/auth/login', 
  rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }), // 5 attempts per 15 min
  handleLogin
);
```

---

### 11. **Lack of Security Headers**
**Location:** `server/index.ts` (line 45-74)  
**Severity:** MEDIUM  
**Issue:** Some security headers missing

**Add These Headers:**
```typescript
app.use(helmet({
  referrerPolicy: { policy: 'strict-no-referrer' },
  xXssProtection: true,
  noSniff: true,
  xPoweredBy: false,
  xFrameOptions: { action: 'deny' },
}));
```

---

### 12. **Missing Input Validation on File Uploads**
**Location:** `server/routes/attachments.ts`  
**Severity:** MEDIUM  
**Issue:** File uploads should have strict validation

**Check:**
- [ ] File size limits enforced (`MAX_FILE_SIZE=25000000`)
- [ ] File type whitelist (not blacklist)
- [ ] Filename sanitization
- [ ] Virus scanning integration

**Recommendation:**
```typescript
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

// Validate in upload middleware
if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
  throw new Error('File type not allowed');
}
```

---

### 13. **Insufficient Logging of Security Events**
**Severity:** MEDIUM  
**Issue:** Failed logins, permission denials not comprehensively logged

**Recommendation:** Add security event logging:
```typescript
// Log all auth failures
logger.warn({
  event: 'AUTH_FAILURE',
  email: req.body.email,
  ip: req.ip,
  timestamp: new Date(),
  reason: 'invalid_password'
});
```

---

## LOW SEVERITY ISSUES 🔵

### 14. **Error Messages Too Verbose**
**Location:** Throughout error handlers  
**Issue:** Stack traces may be exposed to users

**Fix:** Generic messages in production:
```typescript
if (process.env.NODE_ENV === 'production') {
  res.json({ error: 'An error occurred' });
} else {
  res.json({ error: err.message, stack: err.stack });
}
```

---

### 15. **Missing Security.txt**
**Recommendation:** Create `.well-known/security.txt`:
```
Contact: security@yourdomain.com
Expires: 2026-10-31T00:00:00Z
Preferred-Languages: en
```

---

### 16. **Missing Content Security Policy Strictness**
**Location:** `server/index.ts` (line 62)  
**Issue:** `unsafe-inline` allowed in development CSP

**Note:** This is acceptable for development but ensure production has strict CSP:
```typescript
"script-src\": [\"'self'\", \"'nonce-XXXXXXXXX'\"],
```

---

## RECOMMENDED IMMEDIATE ACTIONS (Next 24 Hours)

### Priority 1: Do This NOW
```bash
# 1. Change Gmail account password
# 2. Enable 2FA on Gmail: https://accounts.google.com/security

# 3. Generate new strong secrets (run in your project):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. Update .env files with new secrets (locally only, NOT in git)
JWT_SECRET=<new-secret>
JWT_REFRESH_SECRET=<new-secret>
SESSION_SECRET=<new-secret>
ENCRYPTION_KEY=<new-secret>

# 5. Force push to remove secrets from git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# 6. Notify GitHub of potential secret exposure
```

### Priority 2: Apply Code Fixes (Next 24-48 Hours)
```bash
# Apply the JWT secret fallback fix
# Apply the HTTPS enforcement fix
# Add missing security headers
# Update .env.example with generic placeholders
```

### Priority 3: Add to CI/CD Pipeline (Next Week)
- [ ] Add `npm run lint` to catch security issues
- [ ] Add secret scanning: `npm install --save-dev detect-secrets`
- [ ] Add dependency vulnerability scanning: `npm audit`

---

## VERIFICATION CHECKLIST

After fixes, verify:

```bash
# 1. Check for hardcoded credentials
grep -r "password\|secret\|token" server/ client/ --include="*.ts" --include="*.tsx" | grep -v "process.env"

# 2. Check for console.log statements
grep -r "console.log" server/ --include="*.ts"

# 3. Verify JWT secret enforcement
grep -r "JWT_SECRET.*||" server/ --include="*.ts"

# 4. Check HTTPS enforcement
grep -r "secure:" server/ --include="*.ts"

# 5. Verify .gitignore includes all secrets
cat .gitignore | grep -E ".env|node_modules|dist"
```

---

## DEPLOYMENT SECURITY CHECKLIST

Before going to production:

- [ ] All environment variables configured (no fallbacks)
- [ ] HTTPS/SSL certificates installed
- [ ] Database credentials rotated
- [ ] API keys and secrets rotated
- [ ] Rate limiting enabled on all auth endpoints
- [ ] CSRF protection enabled
- [ ] Security headers configured
- [ ] Logging and monitoring enabled
- [ ] WAF (Web Application Firewall) rules applied
- [ ] DDoS protection enabled
- [ ] Backups automated and tested
- [ ] Incident response plan documented
- [ ] Penetration testing completed
- [ ] Security headers A+ rating at https://securityheaders.com

---

## HELPFUL RESOURCES

- [OWASP Top 10](https://owasp.org/Top10)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/nodejs-security/)

---

## NEXT STEPS

1. **Immediately:** Change exposed email account password
2. **Today:** Apply all CRITICAL and HIGH fixes
3. **This Week:** Apply MEDIUM fixes
4. **Before Production:** Complete entire checklist

**Recommendation:** Consider hiring a professional security audit before production launch.

---

*Report Generated: 2025-10-31*
