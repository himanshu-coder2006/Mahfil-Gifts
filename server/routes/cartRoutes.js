import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { getPricing, computeTotals } from '../services/totalService.js';
import { addToCartValidator, updateCartItemValidator, removeCartItemValidator } from '../validators/cart.js';

const router = express.Router();

router.use(authenticateUser);

const withTotals = async (cart) => {
  if (!cart) {
    return { user: null, items: [], totals: null };
  }
  await cart.populate('items.product');
  const pricing = await getPricing();
  const rawItems = cart.items.map((item) => ({ product: item.product, quantity: item.quantity, variant: item.variant }));
  const totals = computeTotals(cart.items.map((i) => ({ price: i.product?.price, quantity: i.quantity })), pricing);
  return { ...cart.toObject(), items: cart.items.map((item) => item.toObject?.() || item), totals };
};

router.get('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    const payload = await withTotals(cart);
    return successResponse(res, 200, 'Cart fetched.', payload);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch cart.', [error.message]);
  }
});

router.post('/', addToCartValidator, async (req, res) => {
  try {
    const { productId, quantity = 1, variant = {} } = req.body;
    const qty = Math.max(1, Math.min(10, Number(quantity) || 1));

    const product = await Product.findById(productId);
    if (!product) return errorResponse(res, 404, 'Product not found.', []);
    if (product.stock < qty) return errorResponse(res, 400, `Only ${product.stock} units of "${product.name}" are in stock.`, []);

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId && JSON.stringify(item.variant || {}) === JSON.stringify(variant));
    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += qty;
      if (cart.items[existingItemIndex].quantity > product.stock) {
        return errorResponse(res, 400, `Only ${product.stock} units of "${product.name}" are in stock.`, []);
      }
    } else {
      cart.items.push({ product: productId, quantity: qty, variant });
    }

    await cart.save();
    const payload = await withTotals(cart);
    return successResponse(res, 201, 'Product added to cart.', payload);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to add product to cart.', [error.message]);
  }
});

router.put('/:id', updateCartItemValidator, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return errorResponse(res, 404, 'Cart not found.', []);

    const item = cart.items.id(req.params.id);
    if (!item) return errorResponse(res, 404, 'Cart item not found.', []);

    const nextQty = Math.max(1, Number(quantity) || 1);
    const product = await Product.findById(item.product);
    if (product && product.stock < nextQty) {
      return errorResponse(res, 400, `Only ${product.stock} units of "${product.name}" are in stock.`, []);
    }

    item.quantity = nextQty;
    await cart.save();
    const payload = await withTotals(cart);
    return successResponse(res, 200, 'Cart updated.', payload);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to update cart.', [error.message]);
  }
});

router.delete('/:id', removeCartItemValidator, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return errorResponse(res, 404, 'Cart not found.', []);

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.id);
    await cart.save();
    const payload = await withTotals(cart);
    return successResponse(res, 200, 'Item removed from cart.', payload);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to remove cart item.', [error.message]);
  }
});

export default router;
