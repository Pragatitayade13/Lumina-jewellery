import Razorpay from 'razorpay';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { paymentId } = req.query;

  if (!paymentId) {
    return res.status(400).json({ message: 'paymentId is required' });
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const payment = await razorpay.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      status: payment.status,
      method: payment.method,
      amount: payment.amount,
      currency: payment.currency
    });

  } catch (error) {
    console.error("Razorpay status fetch failed:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch status', error: error.message });
  }
}
