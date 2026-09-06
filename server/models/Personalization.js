import mongoose from 'mongoose';

const personalizationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  cartItem: { type: mongoose.Schema.Types.ObjectId, default: null },
  orderItem: { type: mongoose.Schema.Types.ObjectId, default: null },
  fields: [{
    key: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, default: '' },
    type: { type: String, default: 'TEXT' },
  }],
  uploadedFiles: [{
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    fileType: { type: String, default: 'image' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  }],
  isLocked: { type: Boolean, default: false },
  lockedReason: { type: String, default: '' },
  previewData: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default mongoose.model('Personalization', personalizationSchema);
