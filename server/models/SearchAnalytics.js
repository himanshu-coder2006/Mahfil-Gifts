import mongoose from 'mongoose';

const searchAnalyticsSchema = new mongoose.Schema({
  query: { type: String, required: true },
  resultsCount: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  ip: { type: String, default: '' },
  source: { type: String, default: 'web' },
}, { timestamps: true });

searchAnalyticsSchema.index({ query: 1, createdAt: -1 });

export default mongoose.model('SearchAnalytics', searchAnalyticsSchema);
