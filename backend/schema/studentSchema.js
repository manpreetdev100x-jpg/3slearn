const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      enum: [
        'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
        'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8',
        'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
      ]
    },
    section: {
      type: String,
      default: 'A',
      trim: true,
      uppercase: true
    },
    fees: {
      type: Number,
      required: [true, 'Fee amount is required'],
      min: 0
    },
    startDate: {
      type: Date,
      required: [true, 'Starting date is required']
    },
    // --- NEW 30-DAY FEE TRACKING FIELDS ---
    nextDueDate: {
      type: Date,
      required: [true, 'Next fee due date is required']
    },
    lastPaymentDate: {
      type: Date,
      default: Date.now
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'DUE'],
      default: 'DUE'
    },
    // --------------------------------------
    preferredDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);