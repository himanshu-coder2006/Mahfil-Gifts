import express from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, status: 'approved' }).populate('user', 'name');
    return successResponse(res, 200, 'Reviews fetched successfully.', reviews);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch reviews.', [error.message]);
  }
});

router.post('/product/:productId', authenticateUser, async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) return errorResponse(res, 404, 'Product not found.', []);

    const review = await Review.create({
      user: req.user._id,
      product: req.params.productId,
      rating,
      title,
      comment,
      verifiedPurchase: true,
      status: 'approved',
    });

    const allReviews = await Review.find({ product: req.params.productId, status: 'approved' });
    const avgRating = allReviews.reduce((total, item) => total + item.rating, 0) / allReviews.length;
    product.rating = Number(avgRating.toFixed(1));
    product.reviewCount = allReviews.length;
    await product.save();

    return successResponse(res, 201, 'Review submitted successfully.', review);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to submit review.', [error.message]);
  }
});

export default router;
