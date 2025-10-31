# Production Setup & Deployment Guide

## Pre-Deployment Security Checklist

### 1. Environment Secrets Management

**NEVER commit `.env` files to version control.**

#### Generate Production Secrets

```bash
# Generate all required secrets (save these securely)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('TOKEN_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

#### Setup Methods (Choose One)

**Option A: Environment Variables (Recommended)**
```bash
# Set as environment variables on your server
export JWT_SECRET="your-secret-here"
export JWT_REFRESH_SECRET="your-secret-here"
export SESSION_SECRET="your-secret-here"
export ENCRYPTION_KEY="your-secret-here"
export TOKEN_ENCRYPTION_KEY="your-secret-here"
```

**Option B: AWS Secrets Manager (for AWS deployments)**
```bash
# Create secret in AWS
aws secretsmanager create-secret \
  --name careerstack/production \
  --secret-string '{
    "JWT_SECRET": "...",
    "JWT_REFRESH_SECRET": "...",
    "SESSION_SECRET": "...",
    "ENCRYPTION_KEY": "...",
    "TOKEN_ENCRYPTION_KEY": "..."
  }'
```

**Option C: HashiCorp Vault (Enterprise)**
```bash
# Create secret in Vault
vault kv put secret/careerstack/production \
  JWT_SECRET="..." \
  JWT_REFRESH_SECRET="..." \
  SESSION_SECRET="..." \
  ENCRYPTION_KEY="..." \
  TOKEN_ENCRYPTION_KEY="..."
```

### 2. Database Setup

```bash
# Create production database
createdb careerstack_prod

# Run migrations
npm run db:migrate

# Verify database connection
# Check DATABASE_URL is set correctly
```

### 3. Redis Setup

```bash
# Start Redis (if using local instance)
redis-server --requirepass YOUR_REDIS_PASSWORD

# Or use managed Redis (AWS ElastiCache, Heroku Redis, etc.)
# Update REDIS_URL with connection string
```

### 4. Email Configuration

**Gmail SMTP Setup:**
1. Go to: https://myaccount.google.com/apppasswords
2. Generate app-specific password
3. Update `EMAIL_USER` and `EMAIL_PASS` in environment

**Alternative Email Providers:**
- SendGrid
- Mailgun
- AWS SES

### 5. SSL/TLS Certificate

```bash
# Using Let's Encrypt (recommended for Linux)
sudo certbot certonly --standalone -d yourdomain.com

# Using AWS Certificate Manager
# Or upload your own certificate to your load balancer
```

### 6. Verify All Environment Variables

```bash
# Create a check script
cat > scripts/verify-env-prod.sh << 'EOF'
#!/bin/bash

REQUIRED_VARS=(
  "NODE_ENV"
  "PORT"
  "DATABASE_URL"
  "JWT_SECRET"
  "JWT_REFRESH_SECRET"
  "SESSION_SECRET"
  "ENCRYPTION_KEY"
  "EMAIL_HOST"
  "EMAIL_USER"
  "EMAIL_PASS"
  "APP_URL"
)

missing=0
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing: $var"
    missing=$((missing + 1))
  else
    echo "✅ Set: $var"
  fi
done

if [ $missing -eq 0 ]; then
  echo "✅ All required environment variables are set!"
  exit 0
else
  echo "❌ $missing environment variables are missing!"
  exit 1
fi
EOF

chmod +x scripts/verify-env-prod.sh
./scripts/verify-env-prod.sh
```

## Deployment Steps

### Step 1: Build Application

```bash
# Install dependencies
npm ci --production  # Use ci instead of install for reproducibility

# Build
npm run build

# Verify build succeeded
ls -la dist/
```

### Step 2: Run Application

```bash
# Start application
npm start

# Or with PM2 (recommended for production)
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Step 3: Verify Application

```bash
# Check health endpoint
curl https://yourdomain.com/health

# Expected response:
# {"status":"ok"}

# Check readiness
curl https://yourdomain.com/health/ready

# Check metrics (if enabled)
curl https://yourdomain.com/metrics
```

## Post-Deployment Verification

### 1. Security Headers Test

```bash
# Visit: https://securityheaders.com
# Enter your domain
# Target score: A+

# Headers present:
# ✅ HSTS (HTTP Strict-Transport-Security)
# ✅ CSP (Content-Security-Policy)
# ✅ X-Frame-Options: DENY
# ✅ X-Content-Type-Options: nosniff
# ✅ Referrer-Policy: strict-no-referrer
```

### 2. SSL/TLS Certificate Verification

```bash
# Check certificate validity
openssl s_client -connect yourdomain.com:443

# Should show:
# - Valid certificate
# - Not expired
# - Correct domain

# Visit: https://www.ssllabs.com/ssltest/
# Target grade: A or A+
```

### 3. Dependency Vulnerabilities

```bash
# Check for known vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Review critical/high vulnerabilities
npm audit --audit-level=moderate
```

### 4. Performance Monitoring

```bash
# Enable monitoring
export ENABLE_METRICS=true
export ENABLE_MONITORING=true

# Monitor application performance
# Watch logs for errors:
tail -f /var/log/careerstack/app.log

# Monitor system resources
top
free -m
df -h
```

## Maintenance & Monitoring

### Regular Tasks

```bash
# Weekly: Review logs
grep ERROR /var/log/careerstack/app.log | tail -20

# Weekly: Check certificate expiry
certbot renew

# Monthly: Update dependencies
npm outdated
npm update

# Monthly: Review security advisories
npm audit
```

### Backup Strategy

```bash
# Daily database backup
pg_dump careerstack_prod | gzip > backups/careerstack_$(date +%Y%m%d).sql.gz

# Verify backup
gunzip -c backups/careerstack_*.sql.gz | head -20

# Store backups securely (off-site)
# - AWS S3
# - Google Cloud Storage
# - Azure Blob Storage
```

### Monitoring & Alerting

**Recommended Services:**
- Sentry (Error tracking)
- New Relic (Performance monitoring)
- Datadog (Infrastructure monitoring)
- PagerDuty (Alerting)

```javascript
// Example: Sentry integration
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 0.1,
});
```

## Incident Response

### If You Discover a Security Issue

1. **Do NOT** commit any sensitive data
2. **Immediately** rotate affected credentials
3. **Contact** security@yourdomain.com
4. **Document** the issue and response

### Common Issues & Fixes

**Issue: SSL Certificate Expired**
```bash
# Renew certificate
sudo certbot renew

# Restart application
pm2 restart ecosystem.config.js
```

**Issue: High Memory Usage**
```bash
# Check application
pm2 monit

# Restart if needed
pm2 restart app
pm2 logs
```

**Issue: Database Connection Issues**
```bash
# Verify connection
psql $DATABASE_URL -c "SELECT 1"

# Check pool
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"
```

## Rollback Procedure

```bash
# If deployment fails, quickly rollback:

# 1. Stop current version
pm2 stop ecosystem.config.js

# 2. Restore previous build
git checkout HEAD~1

# 3. Rebuild previous version
npm run build

# 4. Start previous version
pm2 start ecosystem.config.js

# 5. Investigate what went wrong
pm2 logs
```

## Additional Resources

- [OWASP Top 10](https://owasp.org/Top10)
- [Node.js Security](https://nodejs.org/en/docs/guides/nodejs-security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Kubernetes Security](https://kubernetes.io/docs/concepts/security/)

## Support

For deployment issues, contact: **support@yourdomain.com**

---

**Last Updated:** October 31, 2025
