import express from 'express';
import shippingService from '../services/shippingService.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

router.post('/check', async (req, res) => {
  try {
    const { pincode, subtotal = 0, zone = 'A' } = req.body;
    const result = shippingService.getShippingCost({ pincode, subtotal, zone });
    return successResponse(res, 200, 'Shipping serviceability checked.', result);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to check shipping.', [error.message]);
  }
});

export default router;
