import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, customer, subject, message, originalMessage } = req.body;

  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required' });
  }

  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials missing, skipping email dispatch.');
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

    const fromEmail = process.env.SMTP_FROM || process.env.VITE_SMTP_FROM || `"Lumina Support" <${process.env.SMTP_USER}>`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        <h2 style="color: #c9a84c; border-bottom: 2px solid #c9a84c; padding-bottom: 10px;">
          Support Ticket Resolved
        </h2>
        <p>Dear ${customer || 'Customer'},</p>
        <p>Your support ticket regarding <strong>"${subject || 'General Inquiry'}"</strong> has been resolved by our team.</p>
        
        <div style="background: #f9f9f9; border-left: 4px solid #c9a84c; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #333;">Resolution / Response:</h4>
          <p style="white-space: pre-wrap; margin-bottom: 0;">${message}</p>
        </div>

        ${originalMessage ? `
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #ddd; font-size: 13px; color: #666;">
            <strong>Your original message:</strong><br/>
            <p style="white-space: pre-wrap;">${originalMessage}</p>
          </div>
        ` : ''}

        <p style="margin-top: 25px; font-size: 12px; color: #888;">
          If you need further assistance, please reply directly to this email or visit our support center.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: `Re: ${subject || 'Support Ticket Update'}`,
      html: htmlContent,
    });

    return res.status(200).json({ success: true, message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Error sending support reply:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
