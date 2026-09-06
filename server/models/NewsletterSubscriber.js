import mongoose from 'mongoose';

const newsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  subscribedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
