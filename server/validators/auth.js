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
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('mobile').trim().matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit mobile number.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Passwords do not match.');
    return true;
  }),
  handleValidation,
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidation,
];
