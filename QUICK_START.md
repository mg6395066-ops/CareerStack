# 🚀 Quick Start Guide - NRE Infusion OneHub Suite

## ⚡ 5 Minute Setup

### 1. Environment Setup
```bash
# Copy development config
copy .env.example .env
```

### 2. Gmail Setup (Required for Email)
1. Go to [Gmail Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select **Mail** → **Windows Computer**
5. Copy the 16-character password

### 3. Update .env File
```env
# Add your Gmail app password
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Already configured:
PORT=5000
APP_URL=http://localhost:5000
EMAIL_USER=12shivamtiwari219@gmail.com
SUPPORT_EMAIL=12shivamtiwari219@gmail.com
```

### 4. Database Setup
```bash
# PostgreSQL - ensure it's running
# Then set DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost:5432/onehub_suite

# Generate and apply migrations
npm run db:generate
npm run db:push
```

### 5. Start Development
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2 (optional): Start client dev server
npm run dev:client
```

### 6. Access Application
```
http://localhost:5000
```

---

## ✅ Your Configuration

| Item | Value |
|------|-------|
| **Email** | 12shivamtiwari219@gmail.com |
| **Port** | 5000 |
| **App URL** | http://localhost:5000 |
| **SMTP Host** | smtp.gmail.com |
| **SMTP Port** | 587 |
| **App Name** | NRE Infusion OneHub Suite |
| **Company** | NRE Infusion |

---

## 📧 Email Features Enabled

✅ Account Verification Email  
✅ Password Reset Email  
✅ 2FA Code Email  
✅ Error Notifications  
✅ SMTP Relay for User Emails  

---

## 🐛 Troubleshooting

### Email Not Working?
- Verify Gmail 2FA is enabled
- Check EMAIL_PASS is exactly 16 characters (no extra spaces)
- Regenerate app password if needed
- See `EMAIL_SETUP_GUIDE.md` for detailed help

### Port 5000 Already In Use?
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Connection Error?
```bash
# Make sure PostgreSQL is running
# Create database:
createdb onehub_suite

# Update DATABASE_URL in .env
```

---

## 📚 Full Documentation

- **CONFIGURATION_SUMMARY.md** - Complete configuration reference
- **EMAIL_SETUP_GUIDE.md** - Detailed email setup instructions
- **BRANDING_UPDATE.md** - Branding changes applied
- **LINTING_FIXES_SUMMARY.md** - Code quality improvements
- **README.md** - Project documentation

---

## 🎯 Next Steps

1. ✅ Set up Gmail app password
2. ✅ Update `.env` with EMAIL_PASS
3. ✅ Set up PostgreSQL database
4. ✅ Run `npm install` (if needed)
5. ✅ Run `npm run dev`
6. ✅ Test at http://localhost:5000

---

**Status**: Ready to develop! 🚀
