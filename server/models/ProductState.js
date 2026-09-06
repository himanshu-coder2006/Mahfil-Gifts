import mongoose from 'mongoose';

const productStateSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  state: {
    type: String,
    enum: ['Active', 'Draft', 'Published', 'Hidden', 'Out of Stock', 'Low Stock', 'Pre-Order', 'Coming Soon', 'Discontinued'],
    default: 'Active',
  },
  reason: { type: String, default: '' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
}, { timestamps: true });

export default mongoose.model('ProductState', productStateSchema);
