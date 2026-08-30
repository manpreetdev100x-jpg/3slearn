const express = require("express")
const router = express()
const mongoose = require('mongoose');
const Student = require('../../schema/studentSchema');
const AuditLog = require("../../schema/auditLog")
const Payment = require("../../schema/payment")
const ExcelJS = require('exceljs');


// Helper to calculate 30 days from a start date
const calculateNextDueDate = (startDate) => {
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + 1);
  return dueDate;
};


// POST: /api/students
router.post('/create', async (req, res) => {
  try {
    const {
      name,
      fatherName,
      rollNumber,
      email,
      phone,
      grade,
      section,
      fees,
      startDate,
      preferredDays
    } = req.body;

    // Validate required fields
    if (!name || !fatherName || !rollNumber || !phone || !grade || fees === undefined || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory fields: name, fatherName, rollNumber, phone, grade, fees, startDate.'
      });
    }

    // Check for duplicate roll number
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: `A student with Roll Number "${rollNumber}" already exists.`
      });
    }

    // Inside router.post('/create', ...) replace the student initialization:
    const classStartDate = new Date(startDate);
    const nextDueDate = calculateNextDueDate(classStartDate);

    const student = new Student({
      name,
      fatherName,
      rollNumber,
      email,
      phone,
      grade,
      section: section || 'A',
      fees: Number(fees),
      startDate: classStartDate,
      nextDueDate: nextDueDate,          // Set +30 days from start date
      lastPaymentDate: classStartDate,
      paymentStatus: 'PAID',
      preferredDays: Array.isArray(preferredDays) ? preferredDays : []
    });

    const savedStudent = await student.save();

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: savedStudent
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating student',
      error: error.message
    });
  }
});

// GET: Fetch student by Roll Number (case-insensitive)
router.get('/search/:rollNumber', async (req, res) => {
  try {
    const student = await Student.findOne({ rollNumber: req.params.rollNumber.trim() });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const studentObj = student.toObject();
    
    // Check actual transaction history
    const paymentCount = await Payment.countDocuments({ studentId: student._id });
    const currentDate = new Date();
    const dueDate = new Date(student.nextDueDate);

    // Mark as DUE if no payment records exist OR if due date has passed
    if (paymentCount === 0 || currentDate > dueDate) {
      studentObj.paymentStatus = 'DUE';
    } else {
      studentObj.paymentStatus = 'PAID';
    }

    res.status(200).json({ success: true, data: studentObj });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET: Fetch student by Roll Number (case-insensitive)
// GET: Search student by Roll Number (Query Params)
// Endpoint: http://localhost:3000/student/search?rollNumber=3S-2026-001
router.get('/search', async (req, res) => {
  try {
    const { rollNumber, query } = req.query;

    // Search term from either rollNumber or query parameter
    const searchTerm = (rollNumber || query || '').trim();

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a roll number to search.'
      });
    }

    // Exact string match (case-insensitive)
    const student = await Student.findOne({
      rollNumber: { $regex: new RegExp(`^${searchTerm}$`, 'i') }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `No student found with Roll Number "${searchTerm}".`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student record retrieved successfully.',
      student: student,
      data: student // Included both keys so frontend reads it seamlessly
    });

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error searching for student record.',
      error: error.message
    });
  }
});

// Express.js Backend Example Concept
router.put('/update/:id', async (req, res) => {
  console.log("Update student route called for ID:", req.params.id);
  console.log(req.params);
  console.log(req.body);



  try {
    const { id } = req.params;

    // 0. Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Student ID format.'
      });
    }

    // Unpack nested payload sent by frontend
    const updatedData = req.body.updatedData ? { ...req.body.updatedData } : { ...req.body };
    const previousData = req.body.previousData ? { ...req.body.previousData } : null;

    // Prevent attempt to update immutable database _id field
    delete updatedData._id;

    // 1. Fetch current student record
    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    const {
      name,
      fatherName,
      rollNumber,
      phone,
      grade,
      section,
      fees,
      startDate
    } = updatedData;

    // 2. Validate mandatory fields
    if (!name || !fatherName || !rollNumber || !phone || !grade || fees === undefined || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory fields: name, fatherName, rollNumber, phone, grade, fees, startDate.'
      });
    }

    // 3. Check for roll number conflicts if changed
    if (rollNumber !== existingStudent.rollNumber) {
      const duplicateStudent = await Student.findOne({ rollNumber, _id: { $ne: id } });
      if (duplicateStudent) {
        return res.status(409).json({
          success: false,
          message: `Roll Number "${rollNumber}" is already assigned to another student.`
        });
      }
    }

    // Standardize section format
    updatedData.section = section || 'A';

    // 4. Safely create audit entry
    try {
      await AuditLog.create({
        studentId: id,
        previousData: previousData || existingStudent.toObject(),
        updatedData: updatedData,
        updatedAt: new Date()
      });
    } catch (auditErr) {
      console.error("Audit log failed to record, continuing update:", auditErr.message);
    }

    // 5. Update main student record
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Student record updated successfully',
      data: updatedStudent
    });

  } catch (error) {
    console.error("Error updating student:", error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating student',
      error: error.message
    });
  }
});

// GET: /student/history/:studentId
router.get('/history/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid Student ID.' });
    }

    const logs = await AuditLog.find({ studentId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch update history',
      error: error.message
    });
  }
});

// PUT: /student/renew-fee/:id
router.put('/renew-fee/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const today = new Date();
    const newNextDueDate = new Date(today);
    newNextDueDate.setDate(today.getDate() + 30); // Extend by 30 days from today

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        lastPaymentDate: today,
        nextDueDate: newNextDueDate,
        paymentStatus: 'PAID'
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Payment received successfully! Fee status updated to PAID.',
      data: updatedStudent
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});




// GET /api/export/excel?type=grade|month|date&grade=Grade%203&month=2026-08&startDate=2026-08-01&endDate=2026-08-31
router.get('/excel', async (req, res) => {
  try {
    const { type, grade, month, startDate, endDate } = req.query;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Student Report');

    // Styling helpers for headers
    const applyHeaderStyle = (sheet, columns) => {
      sheet.columns = columns;
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'DC2626' } // Red accent header matching 3S LEARN theme
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.height = 24;
    };

    // SECTION 1: Export by Grade
    if (type === 'grade') {
      if (!grade) return res.status(400).json({ success: false, message: 'Grade is required' });

      applyHeaderStyle(worksheet, [
        { header: 'Roll Number', key: 'rollNumber', width: 18 },
        { header: 'Student Name', key: 'name', width: 22 },
        { header: "Father's Name", key: 'fatherName', width: 22 },
        { header: 'Email', key: 'email', width: 26 },
        { header: 'Contact No', key: 'phone', width: 18 },
        { header: 'Fees ($)', key: 'fees', width: 14 },
        { header: 'Joining Date', key: 'startDate', width: 16 }
      ]);

      const students = await Student.find({ grade }).sort({ rollNumber: 1 });

      students.forEach((s) => {
        worksheet.addRow({
          rollNumber: s.rollNumber,
          name: s.name,
          fatherName: s.fatherName || 'N/A',
          email: s.email || 'N/A',
          phone: s.phone || 'N/A',
          fees: s.fees,
          startDate: s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : 'N/A'
        });
      });
    }

    // SECTION 2 & 3: Export by Month or Date Range
    else if (type === 'month' || type === 'date') {
      applyHeaderStyle(worksheet, [
        { header: 'Roll Number', key: 'rollNumber', width: 18 },
        { header: 'Student Name', key: 'name', width: 22 },
        { header: "Father's Name", key: 'fatherName', width: 22 },
        { header: 'Email', key: 'email', width: 26 },
        { header: 'Contact No', key: 'phone', width: 18 },
        { header: 'Fees ($)', key: 'fees', width: 14 },
        { header: 'Due Date', key: 'dueDate', width: 16 },
        { header: 'Received Status', key: 'received', width: 18 },
        { header: 'Received Amount ($)', key: 'receivedAmount', width: 20 }
      ]);

      let dateFilter = {};

      if (type === 'month') {
        if (!month) return res.status(400).json({ success: false, message: 'Month is required (YYYY-MM)' });
        const [year, m] = month.split('-');
        const start = new Date(year, m - 1, 1);
        const end = new Date(year, m, 0, 23, 59, 59);
        dateFilter = { $gte: start, $lte: end };
      } else {
        if (!startDate || !endDate) {
          return res.status(400).json({ success: false, message: 'Start date and End date are required' });
        }
        dateFilter = { $gte: new Date(startDate), $lte: new Date(`${endDate}T23:59:59`) };
      }

      // Find all students whose nextDueDate falls in this period
      const students = await Student.find({ nextDueDate: dateFilter }).sort({ rollNumber: 1 });

      for (const s of students) {
        // Fetch payments made by student within this specific range
        const payments = await Payment.find({
          studentId: s._id,
          createdAt: dateFilter
        });

        const totalReceived = payments.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);
        const isPaid = totalReceived >= s.fees;

        const row = worksheet.addRow({
          rollNumber: s.rollNumber,
          name: s.name,
          fatherName: s.fatherName || 'N/A',
          email: s.email || 'N/A',
          phone: s.phone || 'N/A',
          fees: s.fees,
          dueDate: s.nextDueDate ? new Date(s.nextDueDate).toISOString().split('T')[0] : 'N/A',
          received: isPaid ? 'PAID' : 'DUE',
          receivedAmount: totalReceived
        });

        // Color coding status cell
        const statusCell = row.getCell('received');
        if (isPaid) {
          statusCell.font = { color: { argb: '047857' }, bold: true };
        } else {
          statusCell.font = { color: { argb: 'DC2626' }, bold: true };
        }
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid export type requested' });
    }

    // Set Response Headers for File Download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Student_Report_${type}_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.status(200).end();

  } catch (error) {
    console.error('Excel Generation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate excel file', error: error.message });
  }
});



module.exports = router;

