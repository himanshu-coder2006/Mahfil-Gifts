import express from 'express';
import Collection from '../models/Collection.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find({ status: true }).sort({ sorting: 1, createdAt: -1 });
    return successResponse(res, 200, 'Collections fetched successfully.', collections);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch collections.', [error.message]);
  }
});

export default router;
