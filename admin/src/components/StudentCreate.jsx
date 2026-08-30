import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const GRADES = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);

export default function CreateStudent() {
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    rollNumber: '',
    email: '',
    phone: '',
    grade: '',
    section: 'A',
    fees: '',
    startDate: '',
    preferredDays: []
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const isSelected = prev.preferredDays.includes(day);
      const updatedDays = isSelected
        ? prev.preferredDays.filter((d) => d !== day)
        : [...prev.preferredDays, day];
      return { ...prev, preferredDays: updatedDays };
    });
  };

  const handleReset = () => {
    setFormData({
      name: '',
      fatherName: '',
      rollNumber: '',
      email: '',
      phone: '',
      grade: '',
      section: 'A',
      fees: '',
      startDate: '',
      preferredDays: []
    });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/student/create`, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSubmitted(true);
        handleReset();
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to save student record. Please try again.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Create New Student</h2>
          <p className="text-sm text-slate-500 mt-1">
            Fill in the details below to register a student into the ledger.
          </p>
        </div>

        {/* Success Banner */}
        {submitted && (
          <div className="mx-8 mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
            <span>✓</span> Student record registered successfully!
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="mx-8 mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
            <span>⚠</span> {errorMessage}
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
                placeholder="e.g. John Doe"
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
                placeholder="e.g. 3S-2026-001"
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
                placeholder="student@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition disabled:opacity-50"
              />
            </div>

            {/* Phone Number */}
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
                placeholder="+1 234 567 890"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition disabled:opacity-50"
              />
            </div>

            {/* Student Grade */}
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
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 text-xs">
                  ▼
                </div>
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
                  placeholder="0.00"
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

          {/* Preferred Days Multi-Select */}
          <div className="pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
              Preferred Days (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = formData.preferredDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={loading}
                    onClick={() => handleDayToggle(day)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition duration-150 text-center disabled:opacity-50 ${
                      isSelected
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              disabled={loading}
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 shadow-md shadow-red-500/20 transition active:scale-[0.98] disabled:opacity-60 flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {loading ? 'Saving...' : 'Save Student Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}