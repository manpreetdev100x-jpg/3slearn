// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  rollNumber: { type: String, required: true },
  baseAmount: { type: Number, required: true },
  surchargeAmount: { type: Number, default: 0 },
  totalPaid: { type: Number, required: true },
  paymentMode: {
    type: String,
    enum: ['CASH', 'BANK_TRANSFER', 'CARD_SWIPE'],
    required: true
  },
  cardSurchargePercentage: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  paidAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);