import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required.', errors: [] });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || user.isBlocked) {
      return res.status(401).json({ success: false, message: 'User account is invalid or blocked.', errors: [] });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.', errors: [] });
  }
};

export const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.adminToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Admin authentication required.', errors: [] });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Admin account is invalid.', errors: [] });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token.', errors: [] });
  }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  const currentRole = req.admin?.role || req.user?.role;
  if (!roles.includes(currentRole)) {
    return res.status(403).json({ success: false, message: 'Access forbidden.', errors: [] });
  }
  next();
};
