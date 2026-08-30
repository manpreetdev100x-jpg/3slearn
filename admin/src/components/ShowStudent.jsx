import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';

export default function SearchStudent() {
    const [rollNumber, setRollNumber] = useState('');
    const [student, setStudent] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [logsLoading, setLogsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const fetchAuditLogs = async (studentId) => {
        setLogsLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/student/history/${studentId}`);
            if (res.data.success) {
                setLogs(res.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching audit logs:', err);
        } finally {
            setLogsLoading(false);
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!rollNumber.trim()) return;

        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        setStudent(null);
        setLogs([]);
        setHasSearched(true);

        try {
            const response = await axios.get(`${API_BASE_URL}/student/search/${rollNumber.trim()}`);

            if (response.data.success && response.data.data) {
                const foundStudent = response.data.data;
                setStudent(foundStudent);
                fetchAuditLogs(foundStudent._id);
            }
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                'Student not found or server error.';
            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setRollNumber('');
        setStudent(null);
        setLogs([]);
        setErrorMessage('');
        setSuccessMessage('');
        setHasSearched(false);
    };

    const renderDiffs = (prevData, updatedData) => {
        if (!prevData || !updatedData) return null;

        const changes = [];
        const ignoreKeys = ['_id', '__v', 'createdAt', 'updatedAt'];

        Object.keys(updatedData).forEach((key) => {
            if (ignoreKeys.includes(key)) return;

            const prevVal = JSON.stringify(prevData[key]);
            const newVal = JSON.stringify(updatedData[key]);

            if (prevVal !== newVal) {
                changes.push({
                    field: key,
                    from: prevData[key] !== undefined ? String(prevData[key]) : 'N/A',
                    to: updatedData[key] !== undefined ? String(updatedData[key]) : 'N/A'
                });
            }
        });

        if (changes.length === 0) {
            return <p className="text-xs text-slate-500 italic">No specific field changes recorded.</p>;
        }

        return (
            <div className="space-y-2 mt-2">
                {changes.map((change, idx) => (
                    <div key={idx} className="text-xs flex flex-wrap items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-700 capitalize">{change.field}:</span>
                        <span className="line-through text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{change.from}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{change.to}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Search Card */}
                <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                        Search Student Record
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5 sm:mb-6">
                        Enter the student's roll number to retrieve their registered details, fee status, and history.
                    </p>

                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            required
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            placeholder="e.g. 3S-2026-001"
                            className="w-full flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
                        />
                        <div className="flex w-full sm:w-auto gap-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 shadow-md shadow-red-500/20 transition active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                {loading && (
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                )}
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                            {hasSearched && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Alerts */}
                {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-center gap-2">
                        <span>⚠</span> {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-medium flex items-center gap-2">
                        <span>✓</span> {successMessage}
                    </div>
                )}

                {/* Student Details Card */}
                {student && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

                        {/* Card Header */}
                        <div className="p-5 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                                    Student Profile
                                </span>
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-0.5 break-words">
                                    {student.name}
                                </h3>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-block px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                                    {student.rollNumber}
                                </span>

                                {/* Fee Status Badge */}
                                {student.paymentStatus === 'PAID' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        FEE PAID
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl bg-red-50 text-red-600 border border-red-200 animate-pulse">
                                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                        FEE DUE
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="p-5 sm:p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">

                                <div className="bg-slate-50/50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Father's Name</p>
                                    <p className="text-sm sm:text-base font-semibold text-slate-800 mt-1">{student.fatherName || 'N/A'}</p>
                                </div>

                                <div className="bg-slate-50/50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Grade / Class</p>
                                    <p className="text-sm sm:text-base font-semibold text-slate-800 mt-1">{student.grade}</p>
                                </div>

                                <div className="bg-slate-50/50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Section</p>
                                    <p className="text-sm sm:text-base font-bold text-slate-800 mt-1">{student.section || 'A'}</p>
                                </div>

                                <div className="bg-slate-50/50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fees Amount</p>
                                    <p className="text-sm sm:text-base font-bold text-emerald-600 mt-1">${student.fees}</p>
                                </div>

                                <div className="bg-slate-50/50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Class Start Date</p>
                                    <p className="text-sm sm:text-base font-medium text-slate-800 mt-1">
                                        {student.startDate ? new Date(student.startDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>

                                {/* Next Fee Due Date */}
                                <div className="bg-slate-50/50 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-amber-200/60 bg-amber-50/30">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Next Fee Due Date</p>
                                    <p className="text-sm sm:text-base font-bold text-amber-900 mt-1">
                                        {student.nextDueDate ? new Date(student.nextDueDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>

                                <div className="bg-slate-50/50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Last Payment Date</p>
                                    <p className="text-sm sm:text-base font-medium text-slate-800 mt-1">
                                        {student.lastPaymentDate ? new Date(student.lastPaymentDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>

                                <div className="bg-slate-50/50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Phone Number</p>
                                    <p className="text-sm sm:text-base font-medium text-slate-800 mt-1">{student.phone}</p>
                                </div>

                                <div className="bg-slate-50/50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                                    <p className="text-sm sm:text-base font-medium text-slate-800 mt-1 break-all">
                                        {student.email || 'N/A'}
                                    </p>
                                </div>

                            </div>

                            {/* Preferred Days */}
                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                                    Preferred Class Days
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {student.preferredDays && student.preferredDays.length > 0 ? (
                                        student.preferredDays.map((day) => (
                                            <span
                                                key={day}
                                                className="px-3 py-1 text-xs font-semibold rounded-lg bg-red-50 text-red-600 border border-red-200"
                                            >
                                                {day}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs sm:text-sm text-slate-400">No specific days selected</span>
                                    )}
                                </div>
                            </div>

                            {/* Revision / Update History Section */}
                            <div className="pt-6 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Update History ({logs.length})
                                    </p>
                                    {logsLoading && <span className="text-xs text-slate-400 animate-pulse">Loading logs...</span>}
                                </div>

                                {logs.length > 0 ? (
                                    <div className="space-y-3">
                                        {logs.map((log) => (
                                            <div key={log._id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-700">
                                                        Updated on {new Date(log.createdAt).toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                                        {log.action || 'UPDATE'}
                                                    </span>
                                                </div>

                                                {renderDiffs(log.previousData, log.updatedData)}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">No previous updates recorded for this student.</p>
                                )}
                            </div>

                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}