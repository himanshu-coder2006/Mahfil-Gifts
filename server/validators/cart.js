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

export const addToCartValidator = [
  body('productId').isMongoId().withMessage('Invalid product ID.'),
  body('quantity').optional().isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10.'),
  handleValidation,
];

export const updateCartItemValidator = [
  param('id').isMongoId().withMessage('Invalid cart item ID.'),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10.'),
  handleValidation,
];

export const removeCartItemValidator = [
  param('id').isMongoId().withMessage('Invalid cart item ID.'),
  handleValidation,
];
