import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;
    if (!shippingAddress) return errorResponse(res, 400, 'Shipping address is required.', []);

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) return errorResponse(res, 400, 'Your cart is empty.', []);

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      variant: item.variant,
      image: item.product.thumbnail || item.product.images[0],
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCharge = subtotal > 1999 ? 0 : 99;
    const totalAmount = subtotal + shippingCharge;

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      billingAddress: shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'razorpay' ? 'pending' : 'pending',
      orderStatus: 'Pending',
      subtotal,
      shippingCharge,
      totalAmount,
      notes,
    });

    await Cart.findOneAndDelete({ user: req.user._id });

    return successResponse(res, 201, 'Order created successfully.', order);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to create order.', [error.message]);
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, 200, 'Orders fetched successfully.', orders);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch orders.', [error.message]);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return errorResponse(res, 404, 'Order not found.', []);
    return successResponse(res, 200, 'Order fetched successfully.', order);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch order.', [error.message]);
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return errorResponse(res, 404, 'Order not found.', []);
    order.orderStatus = req.body.status || order.orderStatus;
    await order.save();
    return successResponse(res, 200, 'Order status updated.', order);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to update order status.', [error.message]);
  }
});

export default router;
