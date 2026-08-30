import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';

export default function ExcelExportPanel() {
    const gradesList = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

    // Section 1: Grade
    const [grade1, setGrade1] = useState('Grade 1');

    // Section 2: Month
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

    // Section 3: Custom Date Range + Grade Filter
    const [dateGrade, setDateGrade] = useState('ALL');
    const [startDate3, setStartDate3] = useState('');
    const [endDate3, setEndDate3] = useState('');

    // Section 4: Grade + Joining Date Range
    const [grade4, setGrade4] = useState('Grade 1');
    const [startDate4, setStartDate4] = useState('');
    const [endDate4, setEndDate4] = useState('');

    const [loadingSection, setLoadingSection] = useState(null);

    const handleDownload = async (endpoint, params, typeName) => {
        setLoadingSection(typeName);
        try {
            const query = new URLSearchParams(params).toString();
            const response = await axios.get(`${API_BASE_URL}/excel/${endpoint}?${query}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Student_Report_${typeName}_${Date.now()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download Excel report.');
        } finally {
            setLoadingSection(null);
        }
    };

    return (
        <div className="W-[50%] min-h-screen bg-slate-50 p-6 md:p-10 pl-72 space-y-8">
            <div >
                <h1 className="text-2xl font-bold text-slate-800">Financial & Student Reports Export</h1>
                <p className="text-xs text-slate-500 mt-1">
                    Generate structured Excel spreadsheets across four dedicated report modules.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* 1. SECTION: Export by Grade */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between space-y-5">
                    <div className="space-y-2">
                        <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-lg font-bold">📊</div>
                        <h3 className="text-sm font-bold text-slate-800">1. Export by Grade</h3>
                        <p className="text-[11px] text-slate-500">Roll, student name, father name, email, phone, fees & joining date.</p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Grade</label>
                            <select
                                value={grade1}
                                onChange={(e) => setGrade1(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-red-600"
                            >
                                {gradesList.map((g) => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={() => handleDownload('grade', { grade: grade1 }, 'Grade')}
                            disabled={loadingSection === 'Grade'}
                            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition disabled:opacity-60"
                        >
                            {loadingSection === 'Grade' ? 'Generating...' : 'Export Grade (.xlsx)'}
                        </button>
                    </div>
                </div>

                {/* 2. SECTION: Export Monthly Fees */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between space-y-5">
                    <div className="space-y-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-bold">📅</div>
                        <h3 className="text-sm font-bold text-slate-800">2. Export Monthly Fees</h3>
                        <p className="text-[11px] text-slate-500">Monthly fees, paid vs due status & collected amounts.</p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Month</label>
                            <input
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-amber-600"
                            />
                        </div>
                        <button
                            onClick={() => handleDownload('month', { month }, 'Month')}
                            disabled={loadingSection === 'Month'}
                            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition disabled:opacity-60"
                        >
                            {loadingSection === 'Month' ? 'Generating...' : 'Export Monthly (.xlsx)'}
                        </button>
                    </div>
                </div>

                {/* 3. SECTION: Custom Date Range (+ Grade Filter) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between space-y-5">
                    <div className="space-y-2">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">📆</div>
                        <h3 className="text-sm font-bold text-slate-800">3. Custom Date Range</h3>
                        <p className="text-[11px] text-slate-500">Fee report by payment date with optional Grade filter.</p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Grade Filter</label>
                            <select
                                value={dateGrade}
                                onChange={(e) => setDateGrade(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-emerald-600"
                            >
                                <option value="ALL">All Grades</option>
                                {gradesList.map((g) => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">From</label>
                                <input
                                    type="date"
                                    value={startDate3}
                                    onChange={(e) => setStartDate3(e.target.value)}
                                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:border-emerald-600"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">To</label>
                                <input
                                    type="date"
                                    value={endDate3}
                                    onChange={(e) => setEndDate3(e.target.value)}
                                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:border-emerald-600"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                if (!startDate3 || !endDate3) return alert('Select start & end dates');
                                handleDownload('date-range', { startDate: startDate3, endDate: endDate3, grade: dateGrade }, 'DateRange');
                            }}
                            disabled={loadingSection === 'DateRange'}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-60"
                        >
                            {loadingSection === 'DateRange' ? 'Generating...' : 'Export Date Range (.xlsx)'}
                        </button>
                    </div>
                </div>

                {/* 4. SECTION: Export by Grade & Joining Date */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between space-y-5">
                    <div className="space-y-2">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">📋</div>
                        <h3 className="text-sm font-bold text-slate-800">4. Grade & Joining Date</h3>
                        <p className="text-[11px] text-slate-500">Student roster filtered by Grade and joining date range.</p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Grade</label>
                            <select
                                value={grade4}
                                onChange={(e) => setGrade4(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-blue-600"
                            >
                                {gradesList.map((g) => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">From</label>
                                <input
                                    type="date"
                                    value={startDate4}
                                    onChange={(e) => setStartDate4(e.target.value)}
                                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:border-blue-600"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">To</label>
                                <input
                                    type="date"
                                    value={endDate4}
                                    onChange={(e) => setEndDate4(e.target.value)}
                                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:border-blue-600"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                if (!startDate4 || !endDate4) return alert('Select start & end dates');
                                handleDownload('grade-date', { grade: grade4, startDate: startDate4, endDate: endDate4 }, 'GradeDate');
                            }}
                            disabled={loadingSection === 'GradeDate'}
                            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition disabled:opacity-60"
                        >
                            {loadingSection === 'GradeDate' ? 'Generating...' : 'Export Grade & Date (.xlsx)'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}