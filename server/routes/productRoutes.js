import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, featured, bestseller, newArrival, search, sort = 'newest', minPrice, maxPrice } = req.query;
    const filters = { status: true };

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (!cat) return successResponse(res, 200, 'Products fetched successfully.', []);
      filters.category = cat._id;
    }
    if (featured === 'true') filters.featured = true;
    if (bestseller === 'true') filters.bestseller = true;
    if (newArrival === 'true') filters.newArrival = true;
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    const conditions = { ...filters };
    if (search) {
      conditions.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let query = Product.find(conditions).populate('category subcategory');

    switch (sort) {
      case 'price-low-high': query = query.sort({ price: 1 }); break;
      case 'price-high-low': query = query.sort({ price: -1 }); break;
      case 'rating': query = query.sort({ rating: -1 }); break;
      case 'popular': query = query.sort({ reviewCount: -1 }); break;
      default: query = query.sort({ createdAt: -1 });
    }

    const products = await query.exec();
    return successResponse(res, 200, 'Products fetched successfully.', products);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch products.', [error.message]);
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category subcategory');
    if (!product) return errorResponse(res, 404, 'Product not found.', []);
    return successResponse(res, 200, 'Product fetched successfully.', product);
  } catch (error) {
    return errorResponse(res, 500, 'Unable to fetch product.', [error.message]);
  }
});

export default router;
