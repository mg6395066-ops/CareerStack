/**
 * Centralized Branding Configuration
 * Single source of truth for all application branding elements
 * Update this file to change branding across the entire application
 */

export const branding = {
  // Application Identity
  appName: 'NRE Infusion OneHub Suite',
  shortName: 'OneHub Suite',
  companyName: 'NRE Infusion',
  
  // URL & Domains
  domain: process.env.DOMAIN || 'localhost:3000',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  
  // Contact Information
  supportEmail: process.env.SUPPORT_EMAIL || '12shivamtiwari219@gmail.com',
  noreplyEmail: process.env.EMAIL_USER || '12shivamtiwari219@gmail.com',
  
  // Versioning
  version: '1.0.0',
  
  // Email Configuration
  email: {
    from: process.env.EMAIL_FROM || 'NRE Infusion <12shivamtiwari219@gmail.com>',
    replyTo: process.env.EMAIL_REPLY_TO || '12shivamtiwari219@gmail.com',
    displayName: 'NRE Infusion OneHub Suite',
    senderName: 'The NRE Infusion OneHub Suite Team',
  },
  
  // Branding Colors (can be used for themed emails, etc.)
  colors: {
    primary: '#1e40af', // Blue
    accent: '#f59e0b', // Amber
    success: '#10b981', // Green
    error: '#ef4444', // Red
    warning: '#f59e0b', // Amber
  },
  
  // Social & Links
  social: {
    twitter: process.env.SOCIAL_TWITTER || 'https://twitter.com/NREinfusion',
    linkedin: process.env.SOCIAL_LINKEDIN || 'https://linkedin.com/company/nre-infusion',
    github: process.env.SOCIAL_GITHUB || 'https://github.com/nreinfusion',
  },
  
  // Legal
  legal: {
    privacyUrl: 'https://nreinfusion.com/privacy',
    termsUrl: 'https://nreinfusion.com/terms',
    cookiePolicyUrl: 'https://nreinfusion.com/cookies',
  },
  
  // Module Names (extensible for features)
  modules: {
    emailClient: 'Email Client',
    resumeEditor: 'Resume Editor',
    marketing: 'Marketing Suite',
    admin: 'Admin Panel',
    multiEditor: 'Multi-Editor',
  },
  
  // Feature Flags (can be extended for gradual rollouts)
  features: {
    emailIntegration: true,
    googleDriveSync: true,
    twoFactorAuth: true,
    marketingModule: true,
  },
} as const;

/**
 * Helper function to get email templates with proper branding
 */
export const getEmailHeader = (): string => {
  return `
    <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">${branding.appName}</h1>
    </div>
  `;
};

/**
 * Helper function to get email footer with proper branding
 */
export const getEmailFooter = (): string => {
  return `
    <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
      <p>Best regards,<br><strong>${branding.email.senderName}</strong></p>
      <p>This is an automated message. Please do not reply to this email.</p>
      <p style="margin: 10px 0 0 0;">
        <a href="${branding.legal.privacyUrl}" style="color: #0066cc; text-decoration: none;">Privacy Policy</a> | 
        <a href="${branding.legal.termsUrl}" style="color: #0066cc; text-decoration: none;">Terms of Service</a>
      </p>
    </div>
  `;
};

/**
 * Helper to get branded subject lines
 */
export const getBrandedSubject = (topic: string): string => {
  return `[${branding.shortName}] ${topic}`;
};

export default branding;
