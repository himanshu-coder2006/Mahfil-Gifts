import express from 'express';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, 'Email is required.', []);

    const subscriber = await NewsletterSubscriber.findOneAndUpdate(
      { email },
      { email, status: 'active' },
      { new: true, upsert: true }
    );

    return successResponse(res, 200, 'Subscribed successfully.', subscriber);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to subscribe.', [error.message]);
  }
});

export default router;
