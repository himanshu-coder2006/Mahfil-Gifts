import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  banner: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  sorting: { type: Number, default: 0 },
  status: { type: Boolean, default: true },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('Collection', collectionSchema);
