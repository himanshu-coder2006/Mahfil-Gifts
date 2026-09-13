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

export const getReviewsValidator = [
  param('productId').isMongoId().withMessage('Invalid product ID.'),
  handleValidation,
];

export const createReviewValidator = [
  param('productId').isMongoId().withMessage('Invalid product ID.'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
  body('title').optional().trim().isLength({ max: 100 }).withMessage('Title must be under 100 characters.'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be under 1000 characters.'),
  handleValidation,
];
