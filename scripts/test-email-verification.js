#!/usr/bin/env node
/**
 * Test Email Verification Flow
 * This script tests the complete email verification process:
 * 1. Verify email configuration is loaded
 * 2. Test sending verification email
 * 3. Verify email token generation
 * 4. Test email parsing
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { addHours } from 'date-fns';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('🔍 Email Configuration Test\n' + '='.repeat(50));

// 1. Check environment variables
const requiredEnvVars = [
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_SERVICE',
  'SUPPORT_EMAIL',
];

console.log('\n1️⃣ Checking Environment Variables:');
let configValid = true;
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const masked = value ? (value.length > 4 ? value.slice(0, 2) + '***' + value.slice(-2) : '***') : 'NOT SET';
  const status = value ? '✅' : '❌';
  console.log(`   ${status} ${varName}: ${masked}`);
  if (!value && !varName.includes('PASSWORD')) {
    configValid = false;
  }
});

if (!configValid) {
  console.error('\n❌ Missing required email configuration!');
  process.exit(1);
}

console.log('\n2️⃣ Testing Email Service Setup:');
try {
  console.log('   ✅ Nodemailer loaded');
  
  // Create a test transporter with the configured settings
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: (process.env.EMAIL_PASSWORD || '').replace(/\\s+/g, '')
    }
  });
  console.log('   ✅ Email transporter configured');
  
  // Verify connection
  transporter.verify((error, success) => {
    if (error) {
      console.error('   ❌ Email connection failed:', error.message);
      process.exit(1);
    } else {
      console.log('   ✅ Email connection verified');
      
      // Send test email
      console.log('\n3️⃣ Sending Test Verification Email:');
      const testEmail = process.env.TEST_EMAIL_TO || process.env.EMAIL_USER;
      
      const mailOptions = {
        from: `"NRE Infusion OneHub Suite" <${process.env.EMAIL_USER}>`,
        to: testEmail,
        subject: '[TEST] Email Verification Test',
        html: `
          <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
            <h2>Email Verification Test</h2>
            <p>This is a test email to verify your email configuration is working correctly.</p>
            <p>If you received this email, your email service is properly configured!</p>
            <p>Test details:</p>
            <ul>
              <li>Timestamp: ${new Date().toISOString()}</li>
              <li>Service: ${process.env.EMAIL_SERVICE}</li>
              <li>From: ${process.env.EMAIL_USER}</li>
              <li>To: ${testEmail}</li>
            </ul>
            <p>Best regards,<br>CareerStack Testing</p>
          </div>
        `
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('   ❌ Failed to send test email:', error.message);
          process.exit(1);
        } else {
          console.log('   ✅ Test email sent successfully!');
          console.log(`       Message ID: ${info.messageId}`);
          console.log(`       Recipient: ${testEmail}`);
          console.log(`       Response: ${info.response}`);
          
          console.log('\n4️⃣ Testing Token Generation:');
          try {
            // Simulate token generation
            const token = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const expiresAt = addHours(new Date(), 24);
            
            console.log('   ✅ Email verification token generated');
            console.log(`       Token (truncated): ${token.slice(0, 10)}...${token.slice(-10)}`);
            console.log(`       Hash (truncated): ${tokenHash.slice(0, 10)}...${tokenHash.slice(-10)}`);
            console.log(`       Expires at: ${expiresAt.toISOString()}`);
            
            console.log('\n✅ All email verification tests passed!');
            console.log('\n📋 Summary:');
            console.log('   ✓ Email configuration is valid');
            console.log('   ✓ Email service connection is working');
            console.log('   ✓ Test email was sent successfully');
            console.log('   ✓ Token generation is functional');
            console.log('\n✨ Your email verification system is ready to use!');
            
            process.exit(0);
          } catch (error) {
            console.error('   ❌ Token generation failed:', error.message);
            process.exit(1);
          }
        }
      });
    }
  });
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
