import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const GRADES = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);

export default function SearchAndUpdateStudent() {
    // Search state
    const [searchRollNumber, setSearchRollNumber] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [studentFound, setStudentFound] = useState(false);

    // Form & Audit state
    const [initialData, setInitialData] = useState(null); // Stores "before update" snapshot
    const [formData, setFormData] = useState(null);       // Stores active input changes

    // UI state
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // 1. Handle Searching for Student by Roll Number
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchRollNumber.trim()) return;

        setIsSearching(true);
        setErrorMessage('');
        setSubmitted(false);

        try {
            const response = await axios.get(`${API_BASE_URL}/student/search`, {
                params: {
                    rollNumber: searchRollNumber.trim()
                }
            });
            if (response.data.success && response.data.student) {
                const student = response.data.student;

                // Format date string for standard <input type="date" />
                const formattedDate = student.startDate
                    ? new Date(student.startDate).toISOString().split('T')[0]
                    : '';

                const populatedData = { 
                    ...student, 
                    fatherName: student.fatherName || '',
                    section: student.section || 'A',
                    startDate: formattedDate 
                };

                setFormData(populatedData);
                setInitialData(populatedData); // Save copy for history audit
                setStudentFound(true);
            } else {
                setErrorMessage('No student found with this roll number.');
                setStudentFound(false);
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Error fetching student record.');
            setStudentFound(false);
        } finally {
            setIsSearching(false);
        }
    };

    // Form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Preferred days toggle
    const handleDayToggle = (day) => {
        setFormData((prev) => {
            const isSelected = prev.preferredDays.includes(day);
            const updatedDays = isSelected
                ? prev.preferredDays.filter((d) => d !== day)
                : [...prev.preferredDays, day];
            return { ...prev, preferredDays: updatedDays };
        });
    };

    // Reset form to fetched initial data
    const handleReset = () => {
        if (initialData) {
            setFormData(initialData);
        }
        setErrorMessage('');
    };

    // Clear search and reset UI to search view
    const handleClearSearch = () => {
        setSearchRollNumber('');
        setStudentFound(false);
        setFormData(null);
        setInitialData(null);
        setErrorMessage('');
    };

    // 2. Submit Update with Previous & Updated data payload
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            // Send both current changes and initial snapshot to backend
            const payload = {
                previousData: initialData,
                updatedData: formData
            };

            const response = await axios.put(
                `${API_BASE_URL}/student/update/${formData._id || formData.id}`,
                payload,
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.data.success) {
                setSubmitted(true);
                setInitialData(formData); // Set current updated data as baseline
                setTimeout(() => setSubmitted(false), 4000);
            }
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                'Failed to update student record. Please try again.';
            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* SECTION 1: Search Form */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Search Student</h2>
                    <p className="text-sm text-slate-500 mt-1 mb-6">
                        Enter a student's roll number to load and update their details.
                    </p>

                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                required
                                value={searchRollNumber}
                                onChange={(e) => setSearchRollNumber(e.target.value)}
                                placeholder="Enter Roll Number (e.g. 3S-2026-001)"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="px-6 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>

                        {studentFound && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
                            >
                                Clear Search
                            </button>
                        )}
                    </form>
                </div>

                {/* Global Error Banner */}
                {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
                        <span>⚠</span> {errorMessage}
                    </div>
                )}

                {/* SECTION 2: Update Form (Displays after search success) */}
                {studentFound && formData && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                                    Update Details: {initialData?.name}
                                </h3>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    Roll Number: <span className="font-semibold text-slate-700">{initialData?.rollNumber}</span>
                                </p>
                            </div>
                        </div>

                        {/* Success Banner */}
                        {submitted && (
                            <div className="mx-8 mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
                                <span>✓</span> Student details updated and history logged successfully!
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Full Name */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        disabled={loading}
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition disabled:opacity-50"
                                    />
                                </div>

                                {/* Father's Name */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                                        Father's Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="fatherName"
                                        required
                                        disabled={loading}
                                        value={formData.fatherName}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Robert Doe"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition disabled:opacity-50"
                                    />
                                </div>

                                {/* Roll Number */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                                        Roll Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="rollNumber"
                                        required
                                        disabled={loading}
                                        value={formData.rollNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition disabled:opacity-50"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        disabled={loading}
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition disabled:opacity-50"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        disabled={loading}
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition disabled:opacity-50"
                                    />
                                </div>

                                {/* Grade */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                                        Student Grade *
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="grade"
                                            required
                                            disabled={loading}
                                            value={formData.grade}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition cursor-pointer disabled:opacity-50"
                                        >
                                            <option value="" disabled>Select Grade (1 - 12)</option>
                                            {GRADES.map((grade) => (
                                                <option key={grade} value={grade}>{grade}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 text-xs">▼</div>
                                    </div>
                                </div>

                                {/* Section */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                                        Section *
                                    </label>
                                    <input
                                        type="text"
                                        name="section"
                                        required
                                        disabled={loading}
                                        value={formData.section}
                                        onChange={handleInputChange}
                                        placeholder="e.g. A"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition disabled:opacity-50"
                                    />
                                </div>

                                {/* Fees */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                                        Fees Amount *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-2.5 text-slate-400 font-medium text-sm">$</span>
                                        <input
                                            type="number"
                                            name="fees"
                                            required
                                            disabled={loading}
                                            value={formData.fees}
                                            onChange={handleInputChange}
                                            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                {/* Starting Date */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                                        Starting Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        required
                                        disabled={loading}
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className="w-full md:w-1/2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            {/* Preferred Days */}
                            <div className="pt-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
                                    Preferred Days
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                                    {DAYS_OF_WEEK.map((day) => {
                                        const isSelected = formData.preferredDays?.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                disabled={loading}
                                                onClick={() => handleDayToggle(day)}
                                                className={`py-2 px-3 text-xs font-medium rounded-xl border transition duration-150 text-center disabled:opacity-50 ${isSelected
                                                        ? 'bg-red-600 text-white border-red-600 shadow-sm shadow-red-200'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-red-300 hover:text-red-600'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Form Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={handleReset}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50"
                                >
                                    Reset Form
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 shadow-md shadow-red-500/20 transition active:scale-[0.98] disabled:opacity-60 flex items-center gap-2"
                                >
                                    {loading ? 'Saving Changes...' : 'Update Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}