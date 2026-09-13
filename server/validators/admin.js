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

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'];

export const adminLoginValidator = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidation,
];

export const orderStatusValidator = [
  param('id').isMongoId().withMessage('Invalid order ID.'),
  body('status').isIn(ORDER_STATUSES).withMessage(`Invalid status. Allowed: ${ORDER_STATUSES.join(', ')}`),
  handleValidation,
];

export const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required.'),
  body('category').isMongoId().withMessage('Invalid category ID.'),
  body('price').isNumeric().withMessage('Price must be a number.'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
  handleValidation,
];

export const updateProductValidator = [
  param('id').isMongoId().withMessage('Invalid product ID.'),
  handleValidation,
];

export const updateSettingsValidator = [
  body('websiteName').optional().trim().notEmpty().withMessage('Website name cannot be empty.'),
  body('email').optional().trim().isEmail().withMessage('Enter a valid email address.'),
  body('phone').optional().trim().isMobilePhone('any').withMessage('Enter a valid phone number.'),
  body('shippingCharge').optional().isNumeric().withMessage('Shipping charge must be a number.'),
  body('freeShippingThreshold').optional().isNumeric().withMessage('Free shipping threshold must be a number.'),
  body('codCharge').optional().isNumeric().withMessage('COD charge must be a number.'),
  body('buy2Discount').optional().isNumeric().withMessage('Buy 2 discount must be a number.'),
  body('buy3Discount').optional().isNumeric().withMessage('Buy 3 discount must be a number.'),
  handleValidation,
];
