import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  size: { type: String },
  color: { type: String },
  material: { type: String },
  weight: { type: String },
  customization: { type: String },
  price: { type: Number },
  stock: { type: Number, default: 0 },
  sku: { type: String },
}, { _id: true });

const specificationSchema = new mongoose.Schema({
  key: String,
  value: String,
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  shortDescription: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  brand: { type: String, default: '' },
  images: [{ type: String }],
  thumbnail: { type: String, default: '' },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  sku: { type: String, required: true, unique: true },
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  variants: [variantSchema],
  specifications: [specificationSchema],
  tags: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  bestseller: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
}, { timestamps: true });

productSchema.index({ name: 'text', brand: 'text', tags: 'text', sku: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ featured: 1, bestseller: 1 });

export default mongoose.model('Product', productSchema);
