import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String, default: '' },
  landmark: { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Address', addressSchema);
