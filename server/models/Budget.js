import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  minimumPrice: { type: Number, default: 0 },
  maximumPrice: { type: Number, default: 0 },
  banner: { type: String, default: '' },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  status: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Budget', budgetSchema);
