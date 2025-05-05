import Razorpay from 'razorpay';

export const key_id = process.env.RAZOR_PAY_KEY;
export const key_secret = process.env.RAZOR_PAY_SECRET;

// razor pay instance
export const razorpayInstance = new Razorpay({ key_id, key_secret });
