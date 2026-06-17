const path = require('path');
const fs = require('fs');
const envPath = fs.existsSync(path.resolve(__dirname, '../.env.local')) 
  ? path.resolve(__dirname, '../.env.local') 
  : path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('./config/firebase'); // Initializes Firebase Admin SDK

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes); // Changed from /api/jewellery as per PRD
// Keep old route for backward compatibility during transition if needed
app.use('/api/jewellery', productRoutes); 

// Root Endpoint for checking API health
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to LuxeOrbit API (Firebase)' });
});

// Newsletter Subscription & Email Endpoint
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    let transporter;
    
    // Check if real SMTP credentials are provided in .env
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      require('dns').setDefaultResultOrder('ipv4first');
      
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        requireTLS: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    } else {
      // Create a test account using Ethereal Mail for development
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const info = await transporter.sendMail({
      from: '"Lumina Jewels" <luminajewels.app@gmail.com>',
      to: email,
      subject: "Welcome to Lumina Jewels! ✨ Here is your ₹500 Voucher",
      text: "Thank you for subscribing to our newsletter! As promised, here is your ₹500 Welcome Voucher code: LUMINA500",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 2rem; border-radius: 8px; text-align: center;">
          <h1 style="color: #c9a84c;">Welcome to Lumina Jewels! ✨</h1>
          <p style="font-size: 16px; color: #e0e0e0;">Thank you for subscribing to our exclusive newsletter. You will now be the first to know about new collections, festive offers, and more.</p>
          <div style="background: rgba(201, 168, 76, 0.1); border: 1px dashed #c9a84c; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="margin: 0; color: #c9a84c; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Welcome Voucher</p>
            <h2 style="margin: 10px 0 0; color: #fff; font-size: 28px; letter-spacing: 3px;">LUMINA500</h2>
          </div>
          <p style="font-size: 14px; color: #888;">Use this code at checkout to get ₹500 off your first purchase.</p>
        </div>
      `
    });

    // If using Ethereal, log the preview URL
    let previewUrl = null;
    if (!process.env.SMTP_USER) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("Email Preview URL: %s", previewUrl);
    }

    res.json({ success: true, message: 'Email sent successfully', previewUrl });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Support Ticket Reply Endpoint
app.post('/api/support/reply', async (req, res) => {
  const { email, customer, subject, message, originalMessage } = req.body;
  if (!email || !message) return res.status(400).json({ error: 'Email and message are required' });

  try {
    let transporter;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      require('dns').setDefaultResultOrder('ipv4first');
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        requireTLS: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: { rejectUnauthorized: false }
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const mailOptions = {
      from: '"Lumina Jewels Support" <support@luminajewels.com>',
      to: email,
      subject: `Re: ${subject || 'Your Support Ticket'}`,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Hello ${customer || 'Customer'},</h2>
          <p style="white-space: pre-wrap;">${message}</p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 12px;">Original Message:</p>
          <blockquote style="margin: 0; padding-left: 10px; border-left: 3px solid #ccc; color: #666;">
            ${originalMessage || ''}
          </blockquote>
        </div>
      `
    };

    let info;
    try {
      info = await transporter.sendMail(mailOptions);
    } catch (sendErr) {
      console.warn("SMTP sending failed, falling back to Ethereal Mail.", sendErr.message);
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      info = await transporter.sendMail(mailOptions);
      
      // Force it to act like Ethereal so frontend gets preview URL
      process.env.SMTP_USER = ''; 
    }

    let previewUrl = null;
    if (!process.env.SMTP_USER) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("Support Email Preview URL: %s", previewUrl);
    }

    res.json({ success: true, message: 'Email sent successfully', previewUrl });
  } catch (err) {
    console.error("Support Email Error:", err);
    res.status(500).json({ error: 'Failed to send support email' });
  }
});

// Email Notification Endpoint
app.post('/api/notifications/send', async (req, res) => {
  const { email, customer, subject, message } = req.body;
  if (!email || !message) return res.status(400).json({ error: 'Email and message are required' });

  try {
    let transporter;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      require('dns').setDefaultResultOrder('ipv4first');
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', port: 587, secure: false, requireTLS: true,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls: { rejectUnauthorized: false }
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email', port: 587, secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    }

    const mailOptions = {
      from: '"Lumina Jewels Updates" <updates@luminajewels.com>',
      to: email,
      subject: subject || 'New Notification from Lumina Jewels',
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Hello ${customer || 'Customer'},</h2>
          <p style="white-space: pre-wrap;">${message}</p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 12px; text-align: center;">You are receiving this because you are subscribed to Lumina Jewels notifications.</p>
        </div>
      `
    };

    let info;
    try {
      info = await transporter.sendMail(mailOptions);
    } catch (sendErr) {
      console.warn("SMTP sending failed, falling back to Ethereal Mail.", sendErr.message);
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email', port: 587, secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      info = await transporter.sendMail(mailOptions);
      process.env.SMTP_USER = ''; 
    }

    let previewUrl = null;
    if (!process.env.SMTP_USER) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("Notification Preview URL: %s", previewUrl);
    }

    res.json({ success: true, message: 'Notification sent successfully', previewUrl });
  } catch (err) {
    console.error("Notification Email Error:", err);
    res.status(500).json({ error: 'Failed to send notification email' });
  }
});

// Route consolidated delivery API calls to delivery.js
app.all('/api/delivery/:action', async (req, res) => {
  const { action } = req.params;
  req.query.action = action;
  const path = require('path');
  const apiFilePath = path.resolve(__dirname, '..', 'api', 'delivery.js');
  try {
    const apiModule = await import(`file://${apiFilePath}`);
    await apiModule.default(req, res);
  } catch (err) {
    console.error(`Error running consolidated delivery handler for ${action}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Dynamic serverless handler loader for nested API files (e.g. /api/payment/create-order)
app.all('/api/:folder/:file', async (req, res) => {
  const { folder, file } = req.params;
  const path = require('path');
  const fs = require('fs');

  const apiFilePath = path.resolve(__dirname, '..', 'api', folder, `${file}.js`);

  if (fs.existsSync(apiFilePath)) {
    try {
      const apiModule = await import(`file://${apiFilePath}`);
      await apiModule.default(req, res);
    } catch (err) {
      console.error(`Error running serverless handler ${folder}/${file}:`, err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(404).json({ error: `Serverless API not found at ${folder}/${file}` });
  }
});

// Dynamic serverless handler loader for root-level API files (e.g. /api/gold-rates)
app.all('/api/:file', async (req, res) => {
  const { file } = req.params;
  const path = require('path');
  const fs = require('fs');

  const apiFilePath = path.resolve(__dirname, '..', 'api', `${file}.js`);

  if (fs.existsSync(apiFilePath)) {
    try {
      const apiModule = await import(`file://${apiFilePath}`);
      await apiModule.default(req, res);
    } catch (err) {
      console.error(`Error running serverless handler ${file}:`, err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(404).json({ error: `Serverless API not found at ${file}` });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
