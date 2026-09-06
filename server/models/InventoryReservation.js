import mongoose from 'mongoose';

const inventoryReservationSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  quantity: { type: Number, default: 1 },
  expiresAt: { type: Date, required: true },
  status: { type: String, enum: ['active', 'released', 'confirmed'], default: 'active' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
}, { timestamps: true });

inventoryReservationSchema.index({ product: 1, status: 1, expiresAt: 1 });

export default mongoose.model('InventoryReservation', inventoryReservationSchema);
