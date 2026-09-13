import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { computeOrderTotals } from '../services/totalService.js';
import { createOrderValidator, getOrderValidator } from '../validators/order.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', createOrderValidator, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'cod', notes } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) return errorResponse(res, 400, 'Your cart is empty.', []);

    const items = [];
    for (const item of cart.items) {
      const product = item.product;
      if (!product || product.status === false) {
        return errorResponse(res, 400, `"${product?.name || 'One of the items'}" is no longer available.`, []);
      }
      if (product.stock < item.quantity) {
        return errorResponse(res, 400, `Insufficient stock for "${product.name}". Only ${product.stock} left.`, []);
      }
      items.push(product);
    }

    const orderItems = cart.items.map((item, idx) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      variant: item.variant || {},
      image: item.product.thumbnail || item.product.images?.[0] || '',
    }));

    const totals = await computeOrderTotals(orderItems, paymentMethod);
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      billingAddress: shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'Pending',
      subtotal: totals.subtotal,
      discount: totals.discount,
      shippingCharge: totals.shipping,
      totalAmount: totals.totalAmount,
      notes: notes || '',
    });

    const decremented = [];
    try {
      for (let i = 0; i < items.length; i += 1) {
        const product = items[i];
        const quantity = cart.items[i].quantity;
        const updated = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true }
        );
        if (!updated) {
          throw new Error(`Insufficient stock for "${product.name}".`);
        }
        decremented.push({ product, quantity });
      }
    } catch (stockError) {
      for (const d of decremented) {
        await Product.findByIdAndUpdate(d.product._id, { $inc: { stock: d.quantity } });
      }
      await Order.findByIdAndDelete(order._id);
      return errorResponse(res, 400, stockError.message, []);
    }

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

router.get('/:id', getOrderValidator, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return errorResponse(res, 404, 'Order not found.', []);
    return successResponse(res, 200, 'Order fetched successfully.', order);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch order.', [error.message]);
  }
});

export default router;
