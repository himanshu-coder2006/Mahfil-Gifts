import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { authenticateAdmin, authorizeRoles } from '../middleware/authMiddleware.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

const generateAdminToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required.', []);
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return errorResponse(res, 401, 'Invalid admin credentials.', []);

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return errorResponse(res, 401, 'Invalid admin credentials.', []);

    const token = generateAdminToken(admin._id);
    res.cookie('adminToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return successResponse(res, 200, 'Admin login successful.', {
      admin: { ...admin.toObject(), password: undefined },
      token,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Unable to log in admin.', [error.message]);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('adminToken');
  return successResponse(res, 200, 'Admin logged out.', null);
});

router.get('/dashboard', authenticateAdmin, authorizeRoles('super-admin', 'admin', 'staff'), async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalSales = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    const products = await Product.countDocuments();
    const customers = await User.countDocuments({ role: 'customer' });
    const lowStock = await Product.countDocuments({ stock: { $lt: 10 } });

    return successResponse(res, 200, 'Dashboard data fetched.', {
      totalOrders,
      totalSales: totalSales[0]?.total || 0,
      totalProducts: products,
      totalCustomers: customers,
      lowStock,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch dashboard data.', [error.message]);
  }
});

export default router;
