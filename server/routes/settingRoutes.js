import express from 'express';
import Setting from '../models/Setting.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) settings = await Setting.create({});
    return successResponse(res, 200, 'Settings fetched successfully.', settings);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch settings.', [error.message]);
  }
});

router.put('/', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) settings = await Setting.create({});
    Object.assign(settings, req.body);
    await settings.save();
    return successResponse(res, 200, 'Settings updated successfully.', settings);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to update settings.', [error.message]);
  }
});

export default router;
