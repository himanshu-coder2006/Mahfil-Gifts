import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  websiteName: { type: String, default: 'Mahfilifts' },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  razorpayKeyId: { type: String, default: '' },
  razorpayKeySecret: { type: String, default: '' },
  codEnabled: { type: Boolean, default: true },
  shippingCharge: { type: Number, default: 99 },
  freeShippingThreshold: { type: Number, default: 1999 },
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 587 },
  smtpUser: { type: String, default: '' },
  smtpPassword: { type: String, default: '' },
  instagram: { type: String, default: '' },
  facebook: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  youtube: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Setting', settingSchema);
