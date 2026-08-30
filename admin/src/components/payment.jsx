import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';

export default function StudentPaymentPage() {
    const [rollNumber, setRollNumber] = useState('');
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    // Payment Panel Form States
    const [paymentMode, setPaymentMode] = useState('CASH');
    const [notes, setNotes] = useState('');
    const [payLoading, setPayLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Payment calculations
    const baseFee = Number(student?.fees || 0);
    const surchargeRate = paymentMode === 'CARD_SWIPE' ? 0.025 : 0;
    const surchargeAmount = Number((baseFee * surchargeRate).toFixed(2));
    const totalAmount = Number((baseFee + surchargeAmount).toFixed(2));

    // Fetch Payment History
    const fetchPaymentHistory = async (studentId) => {
        if (!studentId) return;
        setHistoryLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/payment/history/${studentId}`);
            if (res.data.success) {
                setHistory(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to load payment history:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    // Search Student Handler
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!rollNumber.trim()) return;

        setLoading(true);
        setErrorMessage('');
        setMessage({ type: '', text: '' });
        setStudent(null);
        setHistory([]);

        try {
            const res = await axios.get(`${API_BASE_URL}/student/search/${rollNumber.trim()}`);
            if (res.data.success && res.data.data) {
                const foundStudent = res.data.data;
                setStudent(foundStudent);
                fetchPaymentHistory(foundStudent._id);
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Student not found.');
        } finally {
            setLoading(false);
        }
    };

    // Collect Payment Handler
    const handleCollectPayment = async (e) => {
        e.preventDefault();
        if (!student?._id) return;

        setPayLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await axios.post(`${API_BASE_URL}/payment/collect`, {
                studentId: student._id,
                paymentMode,
                notes
            });

            if (res.data.success) {
                setMessage({ type: 'success', text: res.data.message });
                setStudent(res.data.data.student);
                setNotes('');
                fetchPaymentHistory(student._id);
            }
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Payment collection failed.'
            });
        } finally {
            setPayLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* 1. Search Box */}
                <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                        Student Fee Payment
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
                        Search student by roll number to open payment portal.
                    </p>

                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            required
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            placeholder="Enter Roll Number (e.g. 3S-2026-001)"
                            className="w-full flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                </div>

                {/* Error Alert */}
                {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                        ⚠ {errorMessage}
                    </div>
                )}

                {/* 2. Payment Panel (Renders once student is found) */}
                {student && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-8 space-y-6">

                        {/* Profile Summary Header */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">Student Found</span>
                                <h3 className="text-xl font-bold text-slate-800">{student.name}</h3>
                                <p className="text-xs text-slate-500">Class: {student.grade} ({student.section || 'A'})</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                                    {student.rollNumber}
                                </span>
                                <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                                    student.paymentStatus === 'PAID' 
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                        : 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                                }`}>
                                    STATUS: {student.paymentStatus || 'PAID'}
                                </span>
                            </div>
                        </div>

                        {/* Success / Error Message */}
                        {message.text && (
                            <div className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium border ${
                                message.type === 'success' 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                    : 'bg-red-50 border-red-200 text-red-700'
                            }`}>
                                {message.type === 'success' ? '✓ ' : '⚠ '} {message.text}
                            </div>
                        )}

                        {/* Mode Selection & Calculation Form */}
                        <form onSubmit={handleCollectPayment} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="space-y-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Select Payment Mode
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'CASH', label: 'Cash', icon: '💵' },
                                        { id: 'BANK_TRANSFER', label: 'Bank', icon: '🏦' },
                                        { id: 'CARD_SWIPE', label: 'Card (+2.5%)', icon: '💳' }
                                    ].map((mode) => (
                                        <button
                                            key={mode.id}
                                            type="button"
                                            onClick={() => setPaymentMode(mode.id)}
                                            className={`p-3 rounded-xl border text-center text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                                                paymentMode === mode.id
                                                    ? 'border-red-600 bg-red-50/50 text-red-600 ring-2 ring-red-500/20'
                                                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            <span className="text-base">{mode.icon}</span>
                                            <span>{mode.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                        Payment Notes (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="e.g. Transaction Ref / Receipt No."
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
                                    />
                                </div>
                            </div>

                            {/* Summary Calculation Box */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Payment Summary
                                </span>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Base Fee:</span>
                                        <span className="font-bold text-slate-800">${baseFee.toFixed(2)}</span>
                                    </div>

                                    {paymentMode === 'CARD_SWIPE' ? (
                                        <div className="flex justify-between text-amber-600 font-medium bg-amber-50 p-2 rounded-lg border border-amber-200/60">
                                            <span>Card Surcharge (2.5%):</span>
                                            <span className="font-bold">+${surchargeAmount.toFixed(2)}</span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between text-slate-400">
                                            <span>Surcharge:</span>
                                            <span>$0.00</span>
                                        </div>
                                    )}

                                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-800">Total Amount:</span>
                                        <span className="text-lg font-extrabold text-emerald-600">${totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={payLoading}
                                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-[0.98] disabled:opacity-60"
                                >
                                    {payLoading ? 'Processing...' : `Collect $${totalAmount.toFixed(2)} & Renew`}
                                </button>
                            </div>
                        </form>

                        {/* Transaction History Table */}
                        <div className="pt-4 border-t border-slate-100 space-y-3">
                            <div className="flex justify-between items-center">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Past Transactions ({history.length})
                                </p>
                                {historyLoading && <span className="text-xs text-slate-400 animate-pulse">Loading history...</span>}
                            </div>

                            {history.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                                                <th className="py-2">Date</th>
                                                <th className="py-2">Mode</th>
                                                <th className="py-2">Base</th>
                                                <th className="py-2">Surcharge</th>
                                                <th className="py-2">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                            {history.map((tx) => (
                                                <tr key={tx._id}>
                                                    <td className="py-2.5">{new Date(tx.paidAt || tx.createdAt).toLocaleDateString()}</td>
                                                    <td className="py-2.5">
                                                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                                            {tx.paymentMode}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5">${tx.baseAmount}</td>
                                                    <td className="py-2.5 text-amber-600">${tx.surchargeAmount}</td>
                                                    <td className="py-2.5 font-bold text-emerald-600">${tx.totalPaid}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">No past payments recorded.</p>
                            )}
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}