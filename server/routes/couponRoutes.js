import express from 'express';
import Coupon from '../models/Coupon.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code) return errorResponse(res, 400, 'Coupon code is required.', []);

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: true });
    if (!coupon) return errorResponse(res, 404, 'Coupon not found.', []);

    if (new Date(coupon.expiryDate) < new Date()) {
      return errorResponse(res, 400, 'Coupon has expired.', []);
    }

    if (subtotal < coupon.minimumOrderAmount) {
      return errorResponse(res, 400, `Minimum order amount must be ${coupon.minimumOrderAmount}.`, []);
    }

    let discount = coupon.discountType === 'percentage'
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;

    if (coupon.maximumDiscount && discount > coupon.maximumDiscount) discount = coupon.maximumDiscount;

    return successResponse(res, 200, 'Coupon is valid.', { coupon, discount });
  } catch (error) {
    return errorResponse(res, 500, 'Unable to validate coupon.', [error.message]);
  }
});

export default router;
