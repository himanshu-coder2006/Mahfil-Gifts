import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import occasionRoutes from './routes/occasionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.get('/api/health', (_, res) => {
  res.json({ success: true, message: 'Mahfilifts API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/occasions', occasionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/shipping', shippingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const LOCAL_MONGO = 'mongodb://127.0.0.1:27017/mahfilifts';

const connectWithFallback = async () => {
  const primary = process.env.MONGO_URI || LOCAL_MONGO;
  try {
    await mongoose.connect(primary, { serverSelectionTimeoutMS: 8000 });
    console.log('MongoDB connected.');
  } catch (error) {
    console.warn(`Primary database unreachable (${error.message}). Falling back to local MongoDB...`);
    await mongoose.connect(LOCAL_MONGO, { serverSelectionTimeoutMS: 8000 });
    console.log('MongoDB connected (local fallback).');
  }
};

const startServer = async () => {
  try {
    await connectWithFallback();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Could not connect to any database:', error.message);
    process.exit(1);
  }
};

startServer();
