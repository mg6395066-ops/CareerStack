# Email Verification System Documentation

## Overview

The CareerStack application implements a comprehensive email verification system for user registration and account management. This document outlines the complete flow, components, and configuration.

## System Architecture

### Components

1. **Frontend (`client/src/pages/verify-email.tsx`)**
   - Displays email verification status page
   - Accepts verification token from URL query parameter
   - Calls `/api/auth/verify-email` endpoint with token
   - Shows success/error messages and provides navigation options
   - Includes resend verification functionality

2. **Backend Authentication Service (`server/services/authService.ts`)**
   - `sendVerificationEmail()` - Sends verification emails via SMTP
   - `sendPasswordResetEmail()` - Sends password reset emails
   - `sendTwoFactorCodeEmail()` - Sends 2FA codes
   - `verifyEmailToken()` - Validates verification tokens
   - `generateEmailVerificationToken()` - Creates verification tokens

3. **Email Utility (`server/utils/email.ts`)**
   - `sendEmail()` - Core email sending function
   - Supports both Gmail OAuth2 and SMTP authentication
   - Fallback mechanism for email delivery reliability
   - Comprehensive email headers and anti-spam configuration
   - Message ID generation for tracking

4. **API Routes (`server/routes.ts`)**
   - `GET /api/auth/verify-email` - Endpoint to verify email with token
   - `POST /api/auth/resend-verification` - Resend verification email
   - Rate limiting for verification attempts

5. **Authentication Controller (`server/controllers/authController.ts`)**
   - `register()` - User registration with automatic email send
   - `resendVerification()` - Resend verification link

## Email Verification Flow

### 1. User Registration
```
User submits registration form
    ↓
AuthController.register() validates input
    ↓
generateEmailVerificationToken() creates token + hash
    ↓
Token hash stored in database (users.emailVerificationToken)
    ↓
Raw token sent to user via sendVerificationEmail()
    ↓
User receives verification link email
```

### 2. Email Verification
```
User clicks verification link with token
    ↓
Frontend extracts token from URL query parameter
    ↓
Frontend calls GET /api/auth/verify-email?token=...
    ↓
Backend verifies token against database hash
    ↓
If valid: Mark emailVerified=true, set status to pending_approval
    ↓
Send admin notification email
    ↓
Send pending approval email to user
    ↓
User sees success message
```

### 3. Resend Verification
```
User requests resend of verification email
    ↓
Check rate limit (max 3 per 5 minutes per email+IP)
    ↓
Generate new verification token
    ↓
Update token in database
    ↓
Send new verification email
    ↓
User receives updated link
```

## Configuration

### Environment Variables

```bash
# Email Service Configuration
EMAIL_PROVIDER=smtp                          # Provider type: smtp or oauth
EMAIL_SERVICE=gmail                          # Service name for nodemailer
EMAIL_HOST=smtp.gmail.com                    # SMTP host
EMAIL_PORT=587                               # SMTP port
EMAIL_SECURE=false                           # Use TLS (false) or SSL (true)
EMAIL_USER=your-email@gmail.com              # Sender email
EMAIL_PASSWORD=your-app-password             # App-specific password (Gmail)
EMAIL_FROM="App Name" <email@example.com>    # From header
EMAIL_DOMAIN=localhost                       # Domain for Message-ID
SUPPORT_EMAIL=support@example.com            # Support contact
ADMIN_EMAIL=admin@example.com                # Admin email for notifications

# Gmail OAuth (Optional, if using OAuth instead of SMTP)
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
```

### Database Schema

**users table:**
```typescript
{
  id: string;                           // User ID
  emailVerificationToken: string | null;  // Hashed verification token
  emailVerificationExpires: Date | null;  // Token expiration time
  emailVerified: boolean;               // Email verification status
  approvalStatus: 'pending_approval' | 'approved' | 'rejected'; // Admin approval
  email: string;                        // User email
  // ... other fields
}
```

**emailRateLimits table (for resend rate limiting):**
```typescript
{
  action: string;                       // 'resend_verification'
  email: string;                        // User email
  ip: string;                          // Client IP address
  count: number;                        // Request count in window
  windowStart: Date;                    // Window start time
  blockedUntil: Date | null;           // Block expiration time
  updatedAt: Date;                      // Last update
}
```

## Token Generation and Verification

### Token Security

- **Algorithm**: SHA-256 hashing
- **Token Length**: 32 bytes (64 hex characters)
- **Format**: Hex-encoded random bytes
- **Storage**: Only hash stored in database, raw token sent to user
- **Expiration**: 24 hours for email verification

```typescript
// Token generation
const token = randomBytes(32).toString('hex');           // Raw token
const tokenHash = createHash('sha256').update(token).digest('hex'); // Hash
const expiresAt = addHours(new Date(), 24);             // Expiration

// Token verification
const tokenHash = createHash('sha256').update(token).digest('hex');
const user = db.query.users.findFirst({
  where: (users, { eq, and, gt }) => 
    and(
      eq(users.emailVerificationToken, tokenHash),
      gt(users.emailVerificationExpires, new Date())
    )
});
```

## Email Sending

### Supported Providers

1. **Gmail SMTP (Recommended)**
   - Use Gmail App Passwords (not account password)
   - Enable 2FA on Gmail account
   - Configure less secure app access if using regular password

2. **Gmail OAuth2**
   - Uses Google APIs for OAuth authentication
   - Requires Google Cloud Console setup
   - Better for production environments

3. **Custom SMTP**
   - Configure any SMTP service (SendGrid, AWS SES, etc.)
   - Update EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD

### Email Templates

The system includes pre-designed HTML templates for:

1. **Verification Email** (`emailTemplates.verification`)
   - Subject: "Please verify your NRE Infusion OneHub Suite account"
   - Contains verification link button
   - Fallback plain-text link
   - Professional branded layout

2. **Password Reset Email** (`emailTemplates.passwordReset`)
   - Subject: "Reset Your NRE Infusion OneHub Suite Password"
   - 1-hour expiration warning
   - Security notice
   - Reset link button

3. **2FA Code Email** (`emailTemplates.twoFactorCode`)
   - Subject: "Your Two-Factor Authentication Code"
   - Large, easily readable code format
   - 10-minute expiration

### Fallback Mechanism

The email system includes a two-tier fallback:

```
Primary Provider (OAuth/Custom)
    ↓ (if fails)
Fallback Provider (Generic SMTP)
    ↓ (if fails)
Error handling and logging
```

This ensures emails are sent even if the primary method fails.

## Rate Limiting

### Resend Verification Rate Limit
- **Limit**: 3 requests per 5 minutes
- **Scope**: Per email + IP address
- **Implementation**: Database-backed with Redis fallback
- **Response**: HTTP 429 with Retry-After header

```typescript
// Example rate limit response
{
  "message": "Too many requests. Please try again later.",
  "headers": {
    "Retry-After": "234" // seconds until next attempt allowed
  }
}
```

## API Endpoints

### Verify Email Token
```http
GET /api/auth/verify-email?token=<verification-token>
```

**Response (Success):**
```json
{
  "message": "Email verified"
}
```

**Response (Error):**
```json
{
  "message": "Invalid or expired token"
}
```

### Resend Verification
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account exists, a verification email has been sent."
}
```

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password",
  "pseudoName": "username",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "userId": "user-id",
  "verificationToken": "raw-token-for-testing",
  "email": "user@example.com"
}
```

## Testing

### Manual Testing

1. **Register a new user**
   ```bash
   # Visit http://localhost:5000/register
   # Fill in form and submit
   # Check email for verification link
   ```

2. **Verify email**
   ```bash
   # Click verification link in email
   # Should redirect to /verify-email?token=...
   # Should show success message
   ```

3. **Test resend**
   ```bash
   # Click "Resend" on verification page
   # Enter email address
   # Submit form
   # Check rate limiting (3 attempts per 5 minutes)
   ```

### Automated Testing

Run the email verification test script:
```bash
node scripts/test-email-verification.js
```

This script verifies:
- ✅ Email configuration is valid
- ✅ Email service connection is working
- ✅ Test email was sent successfully
- ✅ Token generation is functional

### Test Email Configuration

```bash
# .env file
TEST_EMAIL_TO=your-test-email@example.com
```

## Troubleshooting

### Email Not Sending

1. **Check Gmail App Password**
   - Ensure you're using App Password, not account password
   - App passwords are 16 characters with spaces
   - .env automatically strips spaces

2. **Verify Email Configuration**
   ```bash
   node scripts/test-email-verification.js
   ```

3. **Check Server Logs**
   - Look for email error messages in server console
   - Check `/api/auth/verify-email` response errors

4. **Gmail Security**
   - Enable 2-Step Verification on Gmail
   - Generate App Password in Google Account settings
   - Allow "Less secure app access" if not using App Passwords

### Token Validation Issues

1. **Token Not Found**
   - Check URL query parameter: `/verify-email?token=xyz`
   - Token must be URL-encoded if it contains special characters

2. **Token Expired**
   - Tokens expire after 24 hours
   - User should click "Resend" to get new token
   - Rate limit applies: max 3 per 5 minutes

3. **Invalid Token**
   - Ensure token matches format (64 hex characters)
   - Check database for matching token hash
   - Verify token hasn't been used already

### Rate Limiting Issues

1. **Too Many Requests Error**
   - Check `Retry-After` header for wait time
   - Rate limit resets after 5 minutes
   - Limit is per email + IP address combination

2. **Rate Limit Not Enforced**
   - Verify Redis is running (if using distributed rate limiter)
   - Check database for `emailRateLimits` table
   - Fallback to database-backed rate limiting

## Security Considerations

### Best Practices

1. **Token Security**
   - ✅ Tokens are hashed before storage
   - ✅ Raw tokens never logged in system
   - ✅ Tokens expire after 24 hours
   - ✅ Tokens are one-time use

2. **Email Headers**
   - ✅ Anti-spam headers included
   - ✅ DKIM/SPF headers configured
   - ✅ Auto-response suppression enabled
   - ✅ Message-ID for tracking

3. **Rate Limiting**
   - ✅ Prevents email enumeration attacks
   - ✅ Per IP + email rate limiting
   - ✅ Configurable limits

4. **Admin Approval**
   - ✅ Email verification → Pending Approval status
   - ✅ Admin must approve before login
   - ✅ Prevents unauthorized account creation

### Recommendations

1. **Production Deployment**
   - Use Gmail OAuth2 instead of SMTP passwords
   - Enable Redis for distributed rate limiting
   - Configure SPF/DKIM/DMARC for domain
   - Use environment variables for all credentials
   - Never commit `.env` to version control

2. **Monitoring**
   - Track email delivery rates
   - Monitor bounce rates
   - Alert on failed email attempts
   - Log all email activity

3. **Testing**
   - Test with multiple email providers
   - Test rate limiting edge cases
   - Test token expiration scenarios
   - Test fallback mechanisms

## Performance Optimization

### Current Implementation

- **Async Email Sending**: Emails sent asynchronously without blocking registration
- **Connection Pooling**: Nodemailer connection pooling for SMTP
- **Caching**: No caching needed (minimal email traffic)
- **Rate Limiting**: Efficient database queries with indexing

### Optimization Tips

1. **Use Redis for Rate Limiting**
   - Faster than database lookups
   - Automatic TTL expiration
   - Better for high-traffic scenarios

2. **Batch Email Sending** (if implementing)
   - Queue emails for batch processing
   - Use Bull or similar job queue
   - Configure optimal batch size

3. **Monitor Email Service**
   - Track success rates
   - Monitor response times
   - Set up alerts for failures

## Maintenance

### Regular Tasks

1. **Clean Up Expired Tokens**
   - Tokens automatically expire after 24 hours
   - Consider periodic cleanup of old records
   - Archive or delete expired entries

2. **Monitor Email Service**
   - Check bounce rates
   - Monitor spam complaints
   - Update email templates as needed

3. **Test Email System**
   - Monthly test to verify setup
   - Run `test-email-verification.js` script
   - Check email headers in received emails

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Emails not sending | Wrong credentials | Run test script, verify App Password |
| Tokens not validating | Database connection | Check DB connection, verify schema |
| Rate limit too strict | Config issue | Adjust MAX_ATTEMPTS in code |
| Long email delays | SMTP timeout | Increase timeout in email.ts |

## Future Enhancements

1. **Multiple Email Templates**
   - Support for custom email templates
   - Template personalization
   - Multi-language support

2. **Advanced Rate Limiting**
   - Adaptive rate limiting based on user behavior
   - IP reputation scoring
   - Bot detection

3. **Email Analytics**
   - Track open rates
   - Click tracking on verification links
   - Delivery monitoring

4. **Improved Fallback**
   - Support multiple email providers
   - Automatic provider failover
   - Provider health monitoring

## References

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/a/answer/176600)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
- [SMTP RFC 5321](https://tools.ietf.org/html/rfc5321)
- [Date-fns Library](https://date-fns.org/)

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Status**: ✅ Production Ready
