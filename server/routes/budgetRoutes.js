import express from 'express';
import Budget from '../models/Budget.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ status: true }).sort({ minimumPrice: 1 });
    return successResponse(res, 200, 'Budgets fetched successfully.', budgets);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch budgets.', [error.message]);
  }
});

export default router;
