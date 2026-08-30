// routes/studentRoutes.js or controllers/studentController.js
const express = require('express');
const payment = express.Router();
const Student = require('../../schema/studentSchema');
const Payment = require('../../schema/payment'); // Assuming path

// POST: Process Student Payment
payment.post('/collect', async (req, res) => {
  try {
    const { studentId, paymentMode, notes } = req.body;

    if (!studentId || !paymentMode) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Payment Mode are required.'
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const baseAmount = student.fees;
    let surchargeAmount = 0;
    let cardSurchargePercentage = 0;

    // Apply 2.5% surcharge for CARD_SWIPE
    if (paymentMode === 'CARD_SWIPE') {
      cardSurchargePercentage = 2.5;
      surchargeAmount = Number((baseAmount * 0.025).toFixed(2));
    }

    const totalPaid = Number((baseAmount + surchargeAmount).toFixed(2));

    // 1. Create Payment Record
    const newPayment = new Payment({
      studentId: student._id,
      rollNumber: student.rollNumber,
      baseAmount,
      surchargeAmount,
      totalPaid,
      paymentMode,
      cardSurchargePercentage,
      notes: notes || ''
    });

    await newPayment.save();

    // 2. Extend Student Due Date by 30 Days from today (or from current due date if in future)
    const today = new Date();
    const baseDate = new Date(student.nextDueDate) > today ? new Date(student.nextDueDate) : today;
    const newNextDueDate = new Date(baseDate);
    newNextDueDate.setDate(newNextDueDate.getDate() + 30);

    student.lastPaymentDate = today;
    student.nextDueDate = newNextDueDate;
    student.paymentStatus = 'PAID';

    await student.save();

    return res.status(200).json({
      success: true,
      message: `Payment of $${totalPaid} collected successfully via ${paymentMode.replace('_', ' ')}.`,
      data: {
        payment: newPayment,
        student
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Payment processing failed.',
      error: error.message
    });
  }
});

// GET: Fetch Payment History for a Student
payment.get('/history/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const payments = await Payment.find({ studentId }).sort({ paidAt: -1 });

    return res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history.',
      error: error.message
    });
  }
});

module.exports = payment;