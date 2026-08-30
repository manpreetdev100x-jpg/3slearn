const express = require('express');
const excelroute = express.Router();
const ExcelJS = require('exceljs');
const Student = require('../schema/studentSchema'); // Adjust path to your Student model
const Payment = require("../schema/payment"); // Adjust path to your Payment model

// Helper to style table header rows
const applyHeaderStyle = (worksheet, columns) => {
  worksheet.columns = columns;
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DC2626' } // Matching 3S LEARN red theme
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 26;
};

// ==========================================
// 1. ENDPOINT: Export Students by Grade
// GET /api/export/grade?grade=Grade%201
// ==========================================
excelroute.get('/grade', async (req, res) => {
  try {
    const { grade } = req.query;
    if (!grade) {
      return res.status(400).json({ success: false, message: 'Grade parameter is required.' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Students - ${grade}`);

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

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Students_${grade.replace(/\s+/g, '_')}.xlsx`);

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export grade sheet', error: error.message });
  }
});

// ==========================================
// 2. ENDPOINT: Export Monthly Fee Ledger
// GET /api/export/month?month=2026-08
// ==========================================
excelroute.get('/month', async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    if (!month) {
      return res.status(400).json({ success: false, message: 'Month parameter is required (YYYY-MM).' });
    }

    const [year, m] = month.split('-');
    const startDate = new Date(year, m - 1, 1);
    const endDate = new Date(year, m, 0, 23, 59, 59);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Fee Report - ${month}`);

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

    const students = await Student.find().sort({ rollNumber: 1 });

    for (const s of students) {
      // Find payments made within the requested month
      const payments = await Payment.find({
        studentId: s._id,
        createdAt: { $gte: startDate, $lte: endDate }
      });

      const totalReceived = payments.reduce((sum, p) => sum + (p.totalPaid || 0), 0);
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

      // Highlight status column
      const statusCell = row.getCell('received');
      statusCell.font = { bold: true, color: { argb: isPaid ? '047857' : 'DC2626' } };
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Monthly_Fees_${month}.xlsx`);

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export monthly sheet', error: error.message });
  }
});

// ==========================================
// 3. ENDPOINT: Export by Custom Date Range
// GET /api/export/date-range?startDate=2026-08-01&endDate=2026-08-30
// ==========================================


// backend/routes/excel.js

// ==========================================
// 4. ENDPOINT: Export by Grade AND Date Range (Joining Date)
// GET /excel/grade-date?grade=Grade%201&startDate=2026-08-01&endDate=2026-08-30
// ==========================================
excelroute.get('/grade-date', async (req, res) => {
  try {
    const { grade, startDate, endDate } = req.query;

    if (!grade || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Grade, startDate, and endDate are all required.'
      });
    }

    const start = new Date(startDate);
    const end = new Date(`${endDate}T23:59:59`);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Grade & Date Report`);

    applyHeaderStyle(worksheet, [
      { header: 'Roll Number', key: 'rollNumber', width: 18 },
      { header: 'Student Name', key: 'name', width: 22 },
      { header: "Father's Name", key: 'fatherName', width: 22 },
      { header: 'Email', key: 'email', width: 26 },
      { header: 'Contact No', key: 'phone', width: 18 },
      { header: 'Fees ($)', key: 'fees', width: 14 },
      { header: 'Joining Date', key: 'startDate', width: 16 }
    ]);

    // Query students matching Grade and Joining Date range
    const students = await Student.find({
      grade,
      startDate: { $gte: start, $lte: end }
    }).sort({ rollNumber: 1 });

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

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Grade_${grade.replace(/\s+/g, '_')}_Date_${startDate}_to_${endDate}.xlsx`);

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export grade & date sheet', error: error.message });
  }
});


// ==========================================
// 3. UPDATED ENDPOINT: Export by Custom Date Range (+ Optional Grade Filter)
// GET /excel/date-range?startDate=2026-08-01&endDate=2026-08-30&grade=Grade%201
// ==========================================
excelroute.get('/date-range', async (req, res) => {
  try {
    const { startDate, endDate, grade } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Both startDate and endDate are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(`${endDate}T23:59:59`);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Fee Date Range Report');

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

    // Build filter for students (all grades or specific grade)
    const studentFilter = {};
    if (grade && grade !== 'ALL') {
      studentFilter.grade = grade;
    }

    const students = await Student.find(studentFilter).sort({ rollNumber: 1 });

    for (const s of students) {
      const payments = await Payment.find({
        studentId: s._id,
        createdAt: { $gte: start, $lte: end }
      });

      const totalReceived = payments.reduce((sum, p) => sum + (p.totalPaid || 0), 0);
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

      const statusCell = row.getCell('received');
      statusCell.font = { bold: true, color: { argb: isPaid ? '047857' : 'DC2626' } };
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Fees_Report_${startDate}_to_${endDate}.xlsx`);

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export date range sheet', error: error.message });
  }
});
module.exports = excelroute;