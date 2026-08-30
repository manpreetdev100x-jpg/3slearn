const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true // Indexing for fast search history queries by student
    },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE'],
      default: 'UPDATE'
    },
    previousData: {
      type: mongoose.Schema.Types.Mixed, // Accepts full snapshot of document before changes
      required: true
    },
    updatedData: {
      type: mongoose.Schema.Types.Mixed, // Accepts full snapshot of document after changes
      required: true
    },
    updatedBy: {
      type: String,
      default: 'System / Admin' // Optional: Can track user/admin email if authentication is added later
    }
  },
  {
    timestamps: true // Automatically manages createdAt and updatedAt timestamps
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);