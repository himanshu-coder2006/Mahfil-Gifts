import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { createPaymentValidator, verifyPaymentValidator } from '../validators/payment.js';

const router = express.Router();

let razorpayClient = null;
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_ID === 'demo') {
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

router.post('/create', createPaymentValidator, async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return errorResponse(res, 404, 'Order not found.', []);
    if (order.paymentStatus === 'paid') return errorResponse(res, 400, 'Order is already paid.', []);
    if (order.paymentMethod !== 'razorpay') {
      return errorResponse(res, 400, 'This order is not payable online.', []);
    }

    const expectedAmount = Number(order.totalAmount);
    if (Number(amount) !== expectedAmount) {
      return errorResponse(res, 400, 'Amount does not match the order total.', []);
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return errorResponse(res, 503, 'Online payments are not configured. Please use Cash on Delivery.', []);
    }

    const options = {
      amount: expectedAmount * 100,
      currency,
      receipt: `order_${order._id}`,
      notes: { orderId: String(order._id) },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    await Payment.create({
      user: req.user._id,
      order: order._id,
      paymentMethod: 'razorpay',
      amount: expectedAmount,
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

router.post('/verify', verifyPaymentValidator, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return errorResponse(res, 400, 'Payment verification failed.', []);
    }

    const payment = await Payment.findOne({ razorpayOrderId: orderId, user: req.user._id });
    if (!payment) return errorResponse(res, 404, 'Payment record not found.', []);

    payment.status = 'paid';
    payment.razorpayPaymentId = paymentId;
    payment.razorpaySignature = signature;
    await payment.save();

    if (payment.order) {
      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: 'paid',
        orderStatus: 'Confirmed',
        transactionId: paymentId,
      });
    }

    return successResponse(res, 200, 'Payment verified successfully.', { orderId, paymentId, valid: true });
  } catch (error) {
    return errorResponse(res, 500, 'Unable to verify payment.', [error.message]);
  }
});

// Razorpay webhook — no auth middleware, uses raw body
router.post('/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).json({ error: 'Webhook secret not configured.' });
    }

    const razorpaySignature = req.headers['x-razorpay-signature'];
    if (!razorpaySignature) {
      return res.status(400).json({ error: 'Missing webhook signature.' });
    }

    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      if (paymentEntity) {
        const { order_id, id: paymentId } = paymentEntity;
        const payment = await Payment.findOne({ razorpayOrderId: order_id });
        if (payment && payment.status !== 'paid') {
          payment.status = 'paid';
          payment.razorpayPaymentId = paymentId;
          await payment.save();

          if (payment.order) {
            await Order.findByIdAndUpdate(payment.order, {
              paymentStatus: 'paid',
              orderStatus: 'Confirmed',
              transactionId: paymentId,
            });
          }
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({ error: 'Webhook processing failed.' });
  }
});

export default router;
