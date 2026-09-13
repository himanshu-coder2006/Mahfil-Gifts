import { body, param, validationResult } from 'express-validator';

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

export const createOrderValidator = [
  body('shippingAddress').notEmpty().withMessage('Shipping address is required.'),
  body('paymentMethod').optional().isIn(['cod', 'razorpay']).withMessage('Invalid payment method.'),
  handleValidation,
];

export const getOrderValidator = [
  param('id').isMongoId().withMessage('Invalid order ID.'),
  handleValidation,
];
