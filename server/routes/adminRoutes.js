import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Setting from '../models/Setting.js';
import { authenticateAdmin, authorizeRoles } from '../middleware/authMiddleware.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { cookieOptions, clearCookieOptions } from '../utils/authCookies.js';
import { adminLoginValidator, orderStatusValidator, createProductValidator, updateProductValidator, updateSettingsValidator } from '../validators/admin.js';

const router = express.Router();

const generateAdminToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/login', adminLoginValidator, async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) return errorResponse(res, 401, 'Invalid admin credentials.', []);

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return errorResponse(res, 401, 'Invalid admin credentials.', []);

    if (!admin.isActive) return errorResponse(res, 403, 'Admin account is inactive.', []);

    const token = generateAdminToken(admin._id);
    res.cookie('adminToken', token, cookieOptions);

    return successResponse(res, 200, 'Admin login successful.', {
      admin: { ...admin.toObject(), password: undefined },
      token,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Unable to log in admin.', [error.message]);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('adminToken', clearCookieOptions);
  return successResponse(res, 200, 'Admin logged out.', null);
});

router.get('/me', authenticateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    return successResponse(res, 200, 'Admin profile fetched.', admin);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch admin profile.', [error.message]);
  }
});

router.get('/dashboard', authenticateAdmin, authorizeRoles('super-admin', 'admin', 'staff'), async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalSales = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    const products = await Product.countDocuments();
    const customers = await User.countDocuments({});
    const lowStock = await Product.countDocuments({ stock: { $lte: 5 }, status: true });

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

router.get('/orders', authenticateAdmin, authorizeRoles('super-admin', 'admin', 'staff'), async (req, res) => {
  try {
    const status = req.query.status;
    const filter = status && status !== 'All' ? { orderStatus: status } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200).populate('user', 'name email mobile');
    return successResponse(res, 200, 'Orders fetched.', orders);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch orders.', [error.message]);
  }
});

router.put('/orders/:id/status', authenticateAdmin, authorizeRoles('super-admin', 'admin', 'staff'), orderStatusValidator, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return errorResponse(res, 404, 'Order not found.', []);

    order.orderStatus = status;
    if (status === 'Delivered') order.paymentStatus = order.paymentMethod === 'cod' ? 'paid' : order.paymentStatus;
    if (status === 'Cancelled') order.paymentStatus = 'refunded';
    await order.save();

    return successResponse(res, 200, 'Order status updated.', order);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to update order status.', [error.message]);
  }
});

router.get('/customers', authenticateAdmin, authorizeRoles('super-admin', 'admin', 'staff'), async (req, res) => {
  try {
    const users = await User.find({}, 'name email mobile createdAt').sort({ createdAt: -1 }).limit(500);
    const orderStats = await Order.aggregate([
      { $group: { _id: '$user', orderCount: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } },
    ]);
    const statsMap = {};
    orderStats.forEach((s) => { statsMap[String(s._id)] = { orders: s.orderCount, spent: s.totalSpent }; });

    const customers = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.mobile,
      mobile: u.mobile,
      joined: u.createdAt,
      orders: statsMap[String(u._id)]?.orders || 0,
      spent: statsMap[String(u._id)]?.spent || 0,
    }));

    return successResponse(res, 200, 'Customers fetched.', customers);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch customers.', [error.message]);
  }
});

const sanitizeSettings = (settings) => {
  const obj = settings?.toObject ? settings.toObject() : settings;
  if (!obj) return null;
  delete obj.razorpayKeySecret;
  delete obj.smtpPassword;
  return obj;
};

router.get('/settings', authenticateAdmin, authorizeRoles('super-admin', 'admin'), async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) settings = await Setting.create({});
    return successResponse(res, 200, 'Settings fetched.', sanitizeSettings(settings));
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch settings.', [error.message]);
  }
});

router.put('/settings', authenticateAdmin, authorizeRoles('super-admin', 'admin'), updateSettingsValidator, async (req, res) => {
  try {
    const allowed = [
      'websiteName', 'logo', 'favicon', 'email', 'phone', 'address',
      'razorpayKeyId', 'codEnabled', 'shippingCharge', 'freeShippingThreshold', 'codCharge',
      'buy2Discount', 'buy3Discount', 'smtpHost', 'smtpPort', 'smtpUser', 'smtpPassword',
      'instagram', 'facebook', 'linkedin', 'youtube',
    ];
    const payload = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }

    let settings = await Setting.findOne();
    if (!settings) settings = await Setting.create({});
    Object.assign(settings, payload);
    await settings.save();

    return successResponse(res, 200, 'Settings updated successfully.', sanitizeSettings(settings));
  } catch (error) {
    return errorResponse(res, 500, 'Unable to update settings.', [error.message]);
  }
});

router.get('/products', authenticateAdmin, authorizeRoles('super-admin', 'admin', 'staff'), async (req, res) => {
  try {
    const products = await Product.find().populate('category subcategory').sort({ createdAt: -1 });
    return successResponse(res, 200, 'Products fetched.', products);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch products.', [error.message]);
  }
});

router.post('/products', authenticateAdmin, authorizeRoles('super-admin', 'admin'), createProductValidator, async (req, res) => {
  try {
    const { name, slug, category, price, stock, status, description, originalPrice, images, thumbnail, tags } = req.body;

    const productSlug = (slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')).replace(/^-+|-+$/g, '');
    const product = await Product.create({
      name,
      slug: productSlug,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : 0,
      stock: Number(stock) || 0,
      status: status !== undefined ? status : true,
      description: description || '',
      images: images || [],
      thumbnail: thumbnail || (images && images[0]) || '',
      tags: tags || [],
      sku: `MF-${Math.floor(1000 + Math.random() * 9000)}`,
    });

    return successResponse(res, 201, 'Product created.', product);
  } catch (error) {
    if (error?.code === 11000) return errorResponse(res, 409, 'A product with this slug or SKU already exists.', []);
    return errorResponse(res, 500, 'Unable to create product.', [error.message]);
  }
});

router.put('/products/:id', authenticateAdmin, authorizeRoles('super-admin', 'admin'), updateProductValidator, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 404, 'Product not found.', []);

    const allowed = ['name', 'slug', 'category', 'subcategory', 'price', 'originalPrice', 'stock', 'status', 'description', 'shortDescription', 'images', 'thumbnail', 'tags', 'featured', 'bestseller', 'newArrival', 'variants'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) product[key] = req.body[key];
    }
    await product.save();
    return successResponse(res, 200, 'Product updated.', product);
  } catch (error) {
    if (error?.code === 11000) return errorResponse(res, 409, 'A product with this slug or SKU already exists.', []);
    return errorResponse(res, 500, 'Unable to update product.', [error.message]);
  }
});

router.delete('/products/:id', authenticateAdmin, authorizeRoles('super-admin', 'admin'), updateProductValidator, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 404, 'Product not found.', []);
    await product.deleteOne();
    return successResponse(res, 200, 'Product deleted.', null);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to delete product.', [error.message]);
  }
});

export default router;
