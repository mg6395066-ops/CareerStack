# 📧 Email Configuration Guide

## Quick Setup for 12shivamtiwari219@gmail.com

Your application is configured to use **Gmail SMTP** for sending emails. Here's how to set it up:

---

## Configuration Details

### Email Address
- **Email**: `12shivamtiwari219@gmail.com`
- **SMTP Host**: `smtp.gmail.com`
- **SMTP Port**: `587`
- **Security**: TLS (StartTLS)

### Environment Variables (Already Set in .env.example)
```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=12shivamtiwari219@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=NRE Infusion <12shivamtiwari219@gmail.com>
SUPPORT_EMAIL=12shivamtiwari219@gmail.com

# Server Configuration
PORT=5000
APP_URL=http://localhost:5000
```

---

## Gmail App Password Setup (Required)

Gmail no longer allows "Less Secure Apps" and requires an **App Password** for SMTP. Follow these steps:

### Step 1: Enable 2-Factor Authentication
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Click on **2-Step Verification**
3. Follow the prompts to enable it
4. Save backup codes safely

### Step 2: Generate App Password
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - (If you don't see this link, 2FA is not enabled)
2. Select **Mail** and **Windows Computer** (or your device)
3. Click **Generate**
4. Copy the 16-character password

### Step 3: Update .env File
1. Open `.env` in your project root
2. Find `EMAIL_PASS=`
3. Replace with your 16-character app password:
   ```env
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```
4. Save file

---

## Email Features Enabled

With this configuration, your app supports:

✅ **Email Verification** - New user account verification  
✅ **Password Reset** - Account password recovery  
✅ **2FA Codes** - Two-factor authentication via email  
✅ **Error Reports** - Admin notifications for system errors  
✅ **Email Client Integration** - SMTP relay for user emails  
✅ **Transactional Emails** - System notifications

---

## Testing Email

### Test Email Configuration
Create a `.env.test` file (optional):
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=12shivamtiwari219@gmail.com
EMAIL_PASS=your_app_password
```

### Send Test Email (Node.js)
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: '12shivamtiwari219@gmail.com',
    pass: 'your_app_password', // 16-char app password
  },
});

const result = await transporter.sendMail({
  from: '"NRE Infusion OneHub Suite" <12shivamtiwari219@gmail.com>',
  to: 'your-email@example.com',
  subject: 'Test Email',
  text: 'This is a test email',
  html: '<b>This is a test email</b>',
});

console.log('Message sent:', result.messageId);
```

### Run via npm script
```bash
npm run test:email
```

---

## Starting the Application

### Development
```bash
# Copy env variables
copy .env.example .env

# Update EMAIL_PASS with your 16-character app password
# Update other variables as needed

# Start server
npm run dev

# In another terminal, start client
npm run dev:client
```

### Production
```bash
# Copy production config
copy .env.production.example .env.production

# Update EMAIL_PASS and other sensitive variables
# Update APP_URL to your production domain

# Build and start
npm run build
npm run start
```

---

## Troubleshooting

### "Invalid login credentials"
- ✅ Check 2FA is enabled on Gmail account
- ✅ Verify app password is 16 characters
- ✅ No spaces in EMAIL_PASS (remove extra spaces)
- ✅ App password is fresh (regenerate if needed)

### "Connection timeout"
- ✅ Check firewall allows port 587 outbound
- ✅ Verify EMAIL_HOST=smtp.gmail.com
- ✅ Verify EMAIL_PORT=587

### "Email not being sent"
- ✅ Check EMAIL_USER is correct
- ✅ Verify SUPPORT_EMAIL in .env
- ✅ Check application logs: `npm run docker:logs`

### "Gmail blocks login attempt"
- This is normal for new app passwords
- Go to [myaccount.google.com/security](https://myaccount.google.com/security)
- Look for "Less secure app access" and allow it
- Or regenerate app password from [apppasswords](https://myaccount.google.com/apppasswords)

---

## Email Templates

All email templates are branded with "NRE Infusion OneHub Suite":

### Verification Email
- Sent when: New user registration
- Subject: `Please verify your NRE Infusion OneHub Suite account`
- Contains: Verification link

### Password Reset Email
- Sent when: User requests password reset
- Subject: `Reset Your NRE Infusion OneHub Suite Password`
- Contains: Reset link (expires in 1 hour)

### 2FA Code Email
- Sent when: Two-factor authentication enabled
- Subject: `Your Two-Factor Authentication Code`
- Contains: 6-digit code (expires in 10 minutes)

### Error Report Notification
- Sent to: Admin email
- Subject: `🚨 New Error Report - [Error Message]`
- Contains: Error details and admin link

---

## Security Best Practices

⚠️ **Important:**
- Never commit `.env` files to version control
- Keep app password secure (use in environment only)
- Use `.gitignore` to exclude `.env`:
  ```
  .env
  .env.local
  .env.*.local
  ```
- Rotate app password periodically
- Monitor email sending for suspicious activity

---

## Configuration Summary

| Item | Value |
|------|-------|
| Email Provider | Gmail (SMTP) |
| Email Address | 12shivamtiwari219@gmail.com |
| SMTP Host | smtp.gmail.com |
| SMTP Port | 587 |
| Security | TLS (StartTLS) |
| Server Port | 5000 |
| App URL | http://localhost:5000 |
| Company | NRE Infusion |
| App Name | OneHub Suite |

---

## Next Steps

1. ✅ Enable 2FA on Gmail account
2. ✅ Generate app password
3. ✅ Update `EMAIL_PASS` in `.env` file
4. ✅ Start application with `npm run dev`
5. ✅ Test email with `npm run test:email`
6. ✅ Monitor email delivery in application logs

---

**Last Updated**: October 30, 2025  
**Email**: 12shivamtiwari219@gmail.com  
**App**: NRE Infusion OneHub Suite
