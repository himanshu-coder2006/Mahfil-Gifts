import mongoose from 'mongoose';

const relationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  status: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Relation', relationSchema);
