import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    return successResponse(res, 200, 'Wishlist fetched.', user.wishlist || []);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch wishlist.', [error.message]);
  }
});

router.post('/', async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return errorResponse(res, 400, 'Product ID is required.', []);

    const product = await Product.findById(productId);
    if (!product) return errorResponse(res, 404, 'Product not found.', []);

    const user = await User.findById(req.user._id);
    if (user.wishlist.includes(productId)) {
      return errorResponse(res, 409, 'Product is already in wishlist.', []);
    }

    user.wishlist.push(productId);
    await user.save();
    return successResponse(res, 201, 'Product added to wishlist.', user.wishlist);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to add product to wishlist.', [error.message]);
  }
});

router.delete('/:productId', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
    await user.save();
    return successResponse(res, 200, 'Product removed from wishlist.', user.wishlist);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to remove product from wishlist.', [error.message]);
  }
});

export default router;
