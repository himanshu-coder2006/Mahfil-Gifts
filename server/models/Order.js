import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  variant: { type: Object, default: {} },
  image: { type: String, default: '' },
}, { _id: true });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [orderItemSchema],
  shippingAddress: { type: Object, required: true },
  billingAddress: { type: Object, default: {} },
  paymentMethod: { type: String, enum: ['razorpay', 'cod'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'],
    default: 'Pending',
  },
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
  transactionId: { type: String, default: '' },
  trackingNumber: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);
