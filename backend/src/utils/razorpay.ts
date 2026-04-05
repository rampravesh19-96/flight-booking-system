import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const createOrder = async (amount: number, currency: string = 'INR') => {
  const options = {
    amount: amount * 100, // Razorpay expects amount in paisa (multiply by 100)
    currency,
    receipt: `receipt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);
  return order;
};

export const verifySignature = (
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string = process.env.RAZORPAY_KEY_SECRET!
): boolean => {
  const sign = orderId + '|' + paymentId;
  const expectedSign = crypto
    .createHmac('sha256', secret)
    .update(sign.toString())
    .digest('hex');

  return expectedSign === signature;
};

export default razorpay;