import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  status: { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });

export default mongoose.model('Category', categorySchema);
