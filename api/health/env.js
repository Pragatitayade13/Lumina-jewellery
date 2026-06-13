export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Safe check without exposing actual values
  const envStatus = {
    GOLD_API_KEY: !!process.env.GOLD_API_KEY,
    SMTP_USER: !!process.env.SMTP_USER,
    SMTP_PASS: !!process.env.SMTP_PASS,
    SMTP_HOST: !!process.env.SMTP_HOST,
    RAZORPAY_KEY_ID: !!process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: !!process.env.RAZORPAY_KEY_SECRET,
  };

  const missing = Object.entries(envStatus)
    .filter(([_, exists]) => !exists)
    .map(([key]) => key);

  const status = missing.length === 0 ? 'healthy' : 'degraded';

  return res.status(200).json({
    status,
    missing,
    message: missing.length === 0 
      ? 'All required environment variables are set.' 
      : 'Some environment variables are missing. App features may rely on mock fallbacks.'
  });
}
