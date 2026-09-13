import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { cookieOptions, clearCookieOptions } from '../utils/authCookies.js';
import { registerValidator, loginValidator } from '../validators/auth.js';

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', registerValidator, async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = String(mobile).trim();

    const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { mobile: normalizedMobile }] });
    if (existing) {
      const message = existing.email === normalizedEmail
        ? 'An account with this email already exists.'
        : 'An account with this mobile number already exists.';
      return errorResponse(res, 409, message, []);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: normalizedMobile,
      password: hashedPassword,
      isVerified: true,
    });

    const token = generateToken(user._id);
    res.cookie('token', token, cookieOptions);

    return successResponse(res, 201, 'Registration successful.', {
      user: { ...user.toObject(), password: undefined },
      token,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(res, 409, 'An account with this email or mobile number already exists.', []);
    }
    return errorResponse(res, 500, 'Unable to register user.', [error.message]);
  }
});

router.post('/login', loginValidator, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return errorResponse(res, 401, 'Invalid email or password.', []);
    }

    const token = generateToken(user._id);
    res.cookie('token', token, cookieOptions);

    return successResponse(res, 200, 'Login successful.', {
      user: { ...user.toObject(), password: undefined },
      token,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Unable to log in.', [error.message]);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', clearCookieOptions);
  return successResponse(res, 200, 'Logged out successfully.', null);
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) return successResponse(res, 200, 'No user session.', null);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    return successResponse(res, 200, 'User fetched.', user);
  } catch (error) {
    return successResponse(res, 200, 'No user session.', null);
  }
});

export default router;
