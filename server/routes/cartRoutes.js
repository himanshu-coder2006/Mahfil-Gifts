import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    return successResponse(res, 200, 'Cart fetched.', cart || { user: req.user._id, items: [] });
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch cart.', [error.message]);
  }
});

router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1, variant = {} } = req.body;
    if (!productId) return errorResponse(res, 400, 'Product ID is required.', []);

    const product = await Product.findById(productId);
    if (!product) return errorResponse(res, 404, 'Product not found.', []);

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId && JSON.stringify(item.variant) === JSON.stringify(variant));
    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity), variant });
    }

    await cart.save();
    return successResponse(res, 201, 'Product added to cart.', cart);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to add product to cart.', [error.message]);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return errorResponse(res, 404, 'Cart not found.', []);

    const item = cart.items.id(req.params.id);
    if (!item) return errorResponse(res, 404, 'Cart item not found.', []);

    item.quantity = Math.max(1, Number(quantity) || 1);
    await cart.save();
    return successResponse(res, 200, 'Cart updated.', cart);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to update cart.', [error.message]);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return errorResponse(res, 404, 'Cart not found.', []);

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.id);
    await cart.save();
    return successResponse(res, 200, 'Item removed from cart.', cart);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to remove cart item.', [error.message]);
  }
});

export default router;
