import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  orderId: { type: String, default: '' },
  message: { type: String, required: true },
  attachment: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Waiting for Customer', 'Resolved', 'Closed'],
    default: 'Open',
  },
}, { timestamps: true });

export default mongoose.model('SupportTicket', supportTicketSchema);
