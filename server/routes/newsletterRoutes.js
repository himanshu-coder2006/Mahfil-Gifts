import express from 'express';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { subscribeValidator } from '../validators/newsletter.js';

const router = express.Router();

router.post('/subscribe', subscribeValidator, async (req, res) => {
  try {
    const { email } = req.body;

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
