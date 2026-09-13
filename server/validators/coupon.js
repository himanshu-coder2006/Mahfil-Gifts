import { body, validationResult } from 'express-validator';

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => e.msg),
    });
  }
  next();
};

export const validateCouponValidator = [
  body('code').trim().notEmpty().withMessage('Coupon code is required.'),
  body('subtotal').optional().isNumeric().withMessage('Subtotal must be a number.'),
  handleValidation,
];
