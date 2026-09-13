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

export const createPaymentValidator = [
  body('orderId').isMongoId().withMessage('Invalid order ID.'),
  body('amount').isNumeric().withMessage('Amount must be a number.'),
  body('currency').optional().isIn(['INR']).withMessage('Currency must be INR.'),
  handleValidation,
];

export const verifyPaymentValidator = [
  body('orderId').notEmpty().withMessage('Razorpay order ID is required.'),
  body('paymentId').notEmpty().withMessage('Razorpay payment ID is required.'),
  body('signature').notEmpty().withMessage('Payment signature is required.'),
  handleValidation,
];
