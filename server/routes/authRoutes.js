import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
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

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return errorResponse(res, 400, 'Email is required.', []);
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return successResponse(res, 200, 'If an account exists, a reset link has been sent.', null);
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER || process.env.EMAIL_USER,
      to: user.email,
      subject: 'Mahfil Gifts - Password Reset',
      html: `<p>Hi ${user.name},</p><p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p><p>If you didn't request this, ignore this email.</p>`,
    });

    return successResponse(res, 200, 'If an account exists, a reset link has been sent.', null);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to process request.', [error.message]);
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return errorResponse(res, 400, 'Token and password are required.', []);
    }
    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters.', []);
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return errorResponse(res, 400, 'Invalid or expired reset token.', []);
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return successResponse(res, 200, 'Password reset successful.', null);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to reset password.', [error.message]);
  }
});

export default router;
