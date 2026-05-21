// Email Service - Send transactional emails
// Uses Nodemailer for sending emails (can be extended to use SendGrid, SES, etc.)

import nodemailer from 'nodemailer';

const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

let transporter = null;

const getTransporter = () => {
  if (!transporter && EMAIL_CONFIG.auth.user) {
    transporter = nodemailer.createTransport(EMAIL_CONFIG);
  }
  return transporter;
};

// Escape HTML entities to prevent XSS
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Send license activation email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.customerName - Customer name
 * @param {string} options.pluginName - Plugin name
 * @param {string} options.licenseKey - License key (PVLT format)
 * @param {string} options.activationCode - One-time activation code
 * @param {string} options.downloadUrl - Plugin download URL
 */
export const sendLicenseEmail = async ({
  to,
  customerName,
  pluginName,
  licenseKey,
  activationCode,
  downloadUrl,
}) => {
  const mailTransporter = getTransporter();

  if (!mailTransporter) {
    console.warn('Email transporter not configured. Skipping email send.');
    return { sent: false, reason: 'Email not configured' };
  }

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; }
    .activation-code { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
    .activation-code strong { font-size: 28px; color: #667eea; letter-spacing: 2px; }
    .license-key { background: #333; color: #00ff00; padding: 15px; font-family: monospace; font-size: 16px; text-align: center; border-radius: 4px; margin: 15px 0; }
    .instructions { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .warning { background: #ffe6e6; border: 1px solid #ff6666; padding: 15px; border-radius: 5px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>PluginVault</h1>
    <p>Your Plugin License</p>
  </div>
  <div class="content">
    <p>Hello ${escapeHtml(customerName)},</p>
    <p>Thank you for purchasing <strong>${escapeHtml(pluginName)}</strong>!</p>
    <p>Your <strong>ONE-TIME ACTIVATION CODE</strong> is:</p>
    <div class="activation-code">
      <strong>${escapeHtml(activationCode)}</strong>
    </div>
    <p class="warning">⚠️ <strong>Important:</strong> This activation code can only be used ONCE. Once activated, it cannot be used again. Keep it safe!</p>
    <p>Your License Key (for reference):</p>
    <div class="license-key">${escapeHtml(licenseKey)}</div>
    <div class="instructions">
      <strong>📋 How to Activate:</strong><br>
      1. Download and install the plugin in WordPress<br>
      2. Go to Settings → Plugin License<br>
      3. Enter the ONE-TIME ACTIVATION CODE above<br>
      4. Click "Activate" - that's it!
    </div>
    <p style="text-align: center;">
      <a href="${escapeHtml(downloadUrl)}" class="btn">Download Plugin</a>
    </p>
    <p>If you need help, contact us at support@pluginvault.com</p>
  </div>
  <div class="footer">
    <p>© 2024 PluginVault. All rights reserved.</p>
  </div>
</body>
</html>
`;

  try {
    const info = await mailTransporter.sendMail({
      from: `"PluginVault" <${EMAIL_CONFIG.auth.user}>`,
      to,
      subject: `Your Activation Code for ${escapeHtml(pluginName)} - PluginVault`,
      html: emailHtml,
    });

    console.log('License email sent:', info.messageId);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error('Failed to send license email:', err);
    return { sent: false, reason: err.message };
  }
};

export const sendWelcomeEmail = async ({ to, name, role }) => {
  const mailTransporter = getTransporter();

  if (!mailTransporter) {
    console.warn('Email transporter not configured.');
    return { sent: false, reason: 'Email not configured' };
  }

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; }
    .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome to PluginVault!</h1>
  </div>
  <div class="content">
    <p>Hello ${name},</p>
    <p>Your ${role} account has been created successfully!</p>
    <p>You can now:</p>
    <ul>
      ${role === 'developer' ? '<li>Upload and manage WordPress plugins</li><li>Track sales and revenue</li>' : ''}
      ${role === 'customer' ? '<li>Browse and purchase premium plugins</li><li>Manage your licenses and downloads</li>' : ''}
    </ul>
    <p style="text-align: center;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="btn">Get Started</a>
    </p>
  </div>
  <div class="footer">
    <p>© 2024 PluginVault. All rights reserved.</p>
  </div>
</body>
</html>
`;

  try {
    const info = await mailTransporter.sendMail({
      from: `"PluginVault" <${EMAIL_CONFIG.auth.user}>`,
      to,
      subject: 'Welcome to PluginVault!',
      html: emailHtml,
    });
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error('Failed to send welcome email:', err);
    return { sent: false, reason: err.message };
  }
};