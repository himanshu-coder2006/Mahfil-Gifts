import express from 'express';
import Occasion from '../models/Occasion.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const occasions = await Occasion.find({ status: true }).sort({ createdAt: -1 });
    return successResponse(res, 200, 'Occasions fetched successfully.', occasions);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch occasions.', [error.message]);
  }
});

export default router;
