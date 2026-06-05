import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials missing, skipping welcome email dispatch.');
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

    const fromEmail = process.env.SMTP_FROM || process.env.VITE_SMTP_FROM || `"Lumina Jewels" <${process.env.SMTP_USER}>`;

    const htmlContent = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; background: #fafafa;">
        <div style="background: #0D0800; padding: 30px; text-align: center;">
          <h1 style="color: #c9a84c; margin: 0; font-weight: 300; letter-spacing: 2px;">LUMINA JEWELS</h1>
        </div>
        
        <div style="padding: 40px 30px; background: #fff;">
          <h2 style="color: #333; font-weight: 500; margin-top: 0;">Welcome to the Lumina Family! ✨</h2>
          <p style="color: #555; line-height: 1.6;">
            Thank you for subscribing to our newsletter. You're now on the exclusive list to receive early access to new collections, special offers, and styling inspiration.
          </p>
          
          <div style="margin: 30px 0; padding: 25px; border: 1px dashed #c9a84c; background: #fffdf5; text-align: center; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Exclusive Welcome Voucher</p>
            <h3 style="margin: 0; color: #c9a84c; font-size: 32px; font-weight: bold;">₹500 OFF</h3>
            <p style="margin: 10px 0 0 0; color: #555; font-size: 13px;">Use code <strong>WELCOME500</strong> at checkout</p>
          </div>

          <p style="color: #555; line-height: 1.6;">
            We can't wait to help you shine brighter.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #333; font-weight: 500;">Warm regards,</p>
            <p style="margin: 5px 0 0 0; color: #c9a84c;">The Lumina Jewels Team</p>
          </div>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #888; font-size: 12px;">
          <p style="margin: 0;">You received this because you subscribed on our website.</p>
          <p style="margin: 5px 0 0 0;">© 2026 Lumina Jewels. All rights reserved.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: `Welcome to Lumina Jewels! Here's your ₹500 Voucher ✨`,
      html: htmlContent,
    });

    return res.status(200).json({ success: true, message: 'Welcome email sent successfully' });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
