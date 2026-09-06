import express from 'express';
import Category from '../models/Category.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ status: true }).sort({ createdAt: -1 });
    return successResponse(res, 200, 'Categories fetched successfully.', categories);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch categories.', [error.message]);
  }
});

export default router;
