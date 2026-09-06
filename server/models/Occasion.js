import mongoose from 'mongoose';

const occasionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  banner: { type: String, default: '' },
  mobileBanner: { type: String, default: '' },
  description: { type: String, default: '' },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  status: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Occasion', occasionSchema);
