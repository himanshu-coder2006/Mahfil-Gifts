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
import { sanitizeMiddleware } from './middleware/sanitize.js';
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
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

if (isProduction) {
  allowedOrigins.push('https://mahfil-gifts.onrender.com');
}

app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://res.cloudinary.com"],
      connectSrc: ["'self'", process.env.CLIENT_URL, "https://*.vercel.app", "https://images.unsplash.com", "https://res.cloudinary.com", "https://checkout.razorpay.com"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      fontSrc: ["'self'", "https:", "data:"],
    },
  },
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (!isProduction && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Raw body for Razorpay webhook — must be before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(sanitizeMiddleware);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

app.get('/api/health', (_, res) => {
  res.json({ success: true, message: 'MahfilGifts API is running.' });
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
  if (isProduction && !process.env.MONGO_URI) {
    console.error('MONGO_URI is required in production.');
    process.exit(1);
  }

  const primary = process.env.MONGO_URI || LOCAL_MONGO;
  try {
    await mongoose.connect(primary, { serverSelectionTimeoutMS: 8000 });
    console.log('MongoDB connected.');
  } catch (error) {
    if (isProduction) {
      console.error('Database connection failed in production:', error.message);
      process.exit(1);
    }
    console.error('Primary database unreachable:', error.message);
    console.log('Falling back to local MongoDB...');
    try {
      await mongoose.connect(LOCAL_MONGO, { serverSelectionTimeoutMS: 8000 });
      console.log('MongoDB connected (local fallback).');
    } catch (fallbackError) {
      console.error('Local MongoDB connection error:', fallbackError.message);
      process.exit(1);
    }
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
