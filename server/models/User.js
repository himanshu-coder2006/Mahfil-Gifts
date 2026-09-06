import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'admin', 'staff'], default: 'customer' },
  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verificationToken: String,
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ mobile: 1 });

export default mongoose.model('User', userSchema);
