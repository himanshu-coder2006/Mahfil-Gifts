import express from 'express';
import Setting from '../models/Setting.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

const sanitizeSettings = (settings) => {
  const obj = settings?.toObject ? settings.toObject() : settings;
  if (!obj) return null;
  delete obj.razorpayKeySecret;
  delete obj.smtpPassword;
  return obj;
};

router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) settings = await Setting.create({});
    return successResponse(res, 200, 'Settings fetched successfully.', sanitizeSettings(settings));
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch settings.', [error.message]);
  }
});

router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const allowed = [
      'websiteName', 'logo', 'favicon', 'email', 'phone', 'address',
      'razorpayKeyId', 'codEnabled', 'shippingCharge', 'freeShippingThreshold', 'codCharge',
      'buy2Discount', 'buy3Discount', 'instagram', 'facebook', 'linkedin', 'youtube',
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

export default router;