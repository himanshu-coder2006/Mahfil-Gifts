import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String, default: '' },
  comment: { type: String, default: '' },
  images: [{ type: String }],
  verifiedPurchase: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  helpful: { type: Number, default: 0 },
}, { timestamps: true });

reviewSchema.index({ product: 1, status: 1 });

export default mongoose.model('Review', reviewSchema);
