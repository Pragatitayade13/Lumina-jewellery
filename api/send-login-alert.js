import nodemailer from 'nodemailer';
import { withRateLimit, withCSRF } from './middleware/security.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userName, email, role, loginTime, ipAddress, deviceInfo, status } = req.body;

  try {
    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials missing, skipping email alert.');
      return res.status(200).json({ success: true, warning: 'SMTP credentials missing' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === '465', 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const adminEmail = process.env.SUPERADMIN_EMAIL || process.env.SMTP_USER;
    const shopEmail = process.env.SHOP_EMAIL;
    
    const toEmails = [...new Set([adminEmail, shopEmail].filter(Boolean))].join(', ');
    const fromEmail = process.env.SMTP_FROM || `"Security Alert" <${process.env.SMTP_USER}>`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        <h2 style="color: ${status === 'failed' ? '#e74c3c' : '#2ecc71'}; border-bottom: 2px solid ${status === 'failed' ? '#e74c3c' : '#2ecc71'}; padding-bottom: 10px;">
          Security Alert: Login ${status === 'failed' ? 'Failure' : 'Success'}
        </h2>
        <p>A login attempt was recorded on the Jewellery Management System.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 35%;">Name</td><td style="padding: 10px; border: 1px solid #ddd;">${userName || 'Unknown'}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td><td style="padding: 10px; border: 1px solid #ddd;">${email}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Role</td><td style="padding: 10px; border: 1px solid #ddd;">${role}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Status</td><td style="padding: 10px; border: 1px solid #ddd; color: ${status === 'failed' ? '#e74c3c' : '#2ecc71'}; font-weight: bold;">${status.toUpperCase()}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Time</td><td style="padding: 10px; border: 1px solid #ddd;">${loginTime}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">IP Address</td><td style="padding: 10px; border: 1px solid #ddd;">${ipAddress}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Device Info</td><td style="padding: 10px; border: 1px solid #ddd;">${deviceInfo}</td></tr>
        </table>
        <p style="margin-top: 20px; font-size: 12px; color: #888;">This is an automated security email. If this activity seems suspicious, please review the security logs in the Super Admin dashboard.</p>
      </div>
    `;

    const subject = `[Security] Login ${status === 'failed' ? 'Failure' : 'Alert'} - ${email}`;

    await transporter.sendMail({
      from: fromEmail,
      to: toEmails,
      subject: subject,
      html: htmlContent,
    });

    return res.status(200).json({ success: true, message: 'Alert sent successfully' });
  } catch (error) {
    console.error('Error sending login alert:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

export default withCSRF(withRateLimit(handler, 5, 60000));
