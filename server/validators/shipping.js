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

export const checkShippingValidator = [
  body('pincode').trim().matches(/^\d{6}$/).withMessage('Enter a valid 6-digit pincode.'),
  body('subtotal').optional().isNumeric().withMessage('Subtotal must be a number.'),
  body('zone').optional().isIn(['A', 'B', 'C', 'Remote']).withMessage('Invalid shipping zone.'),
  handleValidation,
];
