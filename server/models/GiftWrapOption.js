import mongoose from 'mongoose';

const giftWrapOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('GiftWrapOption', giftWrapOptionSchema);
