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

export const registerValidator = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('mobile').trim().matches(/^\d{10}$/).withMessage('Enter a valid 10-digit mobile number.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  handleValidation,
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidation,
];
