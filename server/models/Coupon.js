import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minimumOrderAmount: { type: Number, default: 0 },
  maximumDiscount: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  userLimit: { type: Number, default: 1 },
  status: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);
