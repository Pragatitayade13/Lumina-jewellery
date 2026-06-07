import nodemailer from 'nodemailer';
import { withAuth, withRateLimit } from './middleware/security.js';

async function handler(req, res) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { shipmentId, status, customerEmail, customerName, otp } = req.body;

  try {
    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials missing, simulating email alert.');
      return res.status(200).json({ success: true, warning: 'SMTP credentials missing, simulated successfully' });
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

    const toEmail = customerEmail || 'customer@example.com';
    const fromEmail = process.env.SMTP_FROM || `"Lumina Logistics" <${process.env.SMTP_USER}>`;

    const isOutForDelivery = status === 'OUT_FOR_DELIVERY';
    
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        <h2 style="color: #c9a84c; border-bottom: 2px solid #c9a84c; padding-bottom: 10px;">
          Lumina Jewels - Order Status Update
        </h2>
        <p>Dear ${customerName || 'Customer'},</p>
        <p>Your order tracking for shipment <strong>#${shipmentId.slice(0,8).toUpperCase()}</strong> has been updated.</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #eee;">
          <h3 style="margin-top: 0; color: #333;">Current Status: <span style="color: #c9a84c;">${status.replace(/_/g, ' ')}</span></h3>
    `;

    if (isOutForDelivery && otp) {
      htmlContent += `
          <div style="margin-top: 15px; padding: 15px; background: #fff8e1; border: 1px dashed #c9a84c; border-radius: 5px; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #555;">Delivery Verification OTP</p>
            <h1 style="margin: 0; color: #c9a84c; letter-spacing: 5px;">${otp}</h1>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #888;">Please share this secure pin with the delivery executive.</p>
          </div>
      `;
    }

    htmlContent += `
        </div>
        
        <p style="margin-top: 20px; font-size: 14px;">You can track your order live via your account dashboard.</p>
        <p style="margin-top: 20px; font-size: 12px; color: #888;">For support, contact care@luminajewels.com</p>
      </div>
    `;

    const subject = `Order Update: ${status.replace(/_/g, ' ')} - #${shipmentId.slice(0,8).toUpperCase()}`;

    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: subject,
      html: htmlContent,
    });

    return res.status(200).json({ success: true, message: 'Order alert sent successfully' });
  } catch (error) {
    console.error('Error sending order alert:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
}

export default withAuth(withRateLimit(handler, 10, 60000));
