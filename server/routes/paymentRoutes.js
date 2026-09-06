import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

let razorpayClient = null;
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayClient;
};

router.use(authenticateUser);

router.post('/create', async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId } = req.body;

    const razorpay = getRazorpay();
    if (!razorpay) {
      return errorResponse(res, 503, 'Online payments are not configured. Please use Cash on Delivery.', []);
    }

    const options = {
      amount: Number(amount) * 100,
      currency,
      receipt: `order_${orderId || Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    await Payment.create({
      user: req.user._id,
      order: orderId,
      paymentMethod: 'razorpay',
      amount: Number(amount),
      currency,
      status: 'pending',
      razorpayOrderId: razorpayOrder.id,
    });

    return successResponse(res, 200, 'Razorpay order created.', {
      ...razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Unable to create Razorpay order.', [error.message]);
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
      return errorResponse(res, 400, 'Missing payment details.', []);
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isValid = generatedSignature === signature;
    if (!isValid) {
      return errorResponse(res, 400, 'Payment verification failed.', []);
    }

    const payment = await Payment.findOne({ razorpayOrderId: orderId });
    if (payment) {
      payment.status = 'paid';
      payment.razorpayPaymentId = paymentId;
      payment.razorpaySignature = signature;
      await payment.save();

      if (payment.order) {
        await Order.findByIdAndUpdate(payment.order, {
          paymentStatus: 'paid',
          orderStatus: 'Confirmed',
        });
      }
    }

    return successResponse(res, 200, 'Payment verified successfully.', { orderId, paymentId, valid: true });
  } catch (error) {
    return errorResponse(res, 500, 'Unable to verify payment.', [error.message]);
  }
});

export default router;
