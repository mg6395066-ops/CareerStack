# Security Policy

## Reporting Security Issues

We take security seriously and appreciate responsible vulnerability disclosure.

**DO NOT open a public GitHub issue for security vulnerabilities.**

Instead, please report security issues privately to: **security@yourdomain.com**

When reporting a security vulnerability, please include:

1. **Description** - Clear description of the vulnerability
2. **Location** - File path and line numbers where applicable
3. **Steps to Reproduce** - How to reproduce the issue
4. **Potential Impact** - What could an attacker do with this vulnerability
5. **Suggested Fix** - Any ideas for patching (optional but helpful)

## Response Timeline

- **Within 24 hours**: We will acknowledge receipt of your report
- **Within 7 days**: We will provide an initial assessment
- **Within 14 days**: We will have a patch ready or timeline for fix
- **Within 30 days**: We will release a security update

## Supported Versions

| Version | Status | Support Ends |
|---------|--------|--------------|
| 1.0.0   | Current | 2027-01-01 |

## Security Best Practices

### For Developers

1. **Never commit secrets to git**
2. **Use environment variables for sensitive data**
3. **Enable 2FA on all accounts**
4. **Keep dependencies updated**
5. **Use HTTPS everywhere**
6. **Validate all input**
7. **Sanitize output**

## Authentication & Authorization

- **JWT Tokens**: 15-minute expiry with refresh tokens
- **Passwords**: Bcrypt hashing with salt rounds > 10
- **Sessions**: Redis-backed with secure cookie flags
- **Rate Limiting**: 5 attempts per 15 minutes on auth endpoints
- **2FA**: TOTP-based two-factor authentication

## Contact

For security inquiries, contact: **security@yourdomain.com**