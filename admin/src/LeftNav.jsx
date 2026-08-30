import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.jpeg";

function LeftNav() {
    const [activeItem, setActiveItem] = useState("Report");
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navigate = useNavigate();

    const navItems = [
        {
            id: "Report",
            label: "Student Create",
            icon: "📅",
            endpoint: "/studentCreate",
        },
        {
            id: "student fees report",
            label: "Student Upadte",
            icon: "🧑‍🎓",
            endpoint: "/updateStudent",
        },
        {
            id: "Register student",
            label: "Student Record",
            icon: "🧾",
            endpoint: "/studentProfile",
        },
        {
            id: "Update student Detail",
            label: "Payment",
            icon: "🧾",
            endpoint: "/StudentPaymentPanel",
        },
        {
            id: "Fine",
            label: "Excel Export",
            icon: "📁",
            endpoint: "/ExcelExportPanel",
        },
        {
            id: "Fine Payment",
            label: "Amin",
            icon: "📁",
            endpoint: "/",
        },
       
    ];

    const handleNavigation = (item) => {
        setActiveItem(item.id);
        navigate(item.endpoint);

        // Close sidebar on mobile
        setIsMobileOpen(false);
    };

    return (
        <>
            {/* ================= MOBILE HEADER ================= */}
            <div className="fixed top-0 left-0 right-0 z-40 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:hidden">
                
                {/* Hamburger */}
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    aria-label="Open menu"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>

                {/* Mobile Brand */}
                <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-black ">
                        
                                <img className="w-fit h-full rounded-lg lg:rounded-2xl shadow-lg shadow-black " src={logo}/>
                    </div>

                    <div>
                        <p className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                            3SLearn
                        </p>
                    </div>
                </div>

                {/* Empty space for alignment */}
                <div className="w-10" />
            </div>

            {/* ================= MOBILE OVERLAY ================= */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* ================= SIDEBAR ================= */}
            <aside
                className={`
                    fixed top-0 left-0 z-50
                    w-[280px] sm:w-[300px] md:w-[20%]
                    h-screen
                    bg-white dark:bg-slate-900
                    border-r border-slate-200/60 dark:border-slate-800/80
                    flex flex-col justify-between
                    p-5 sm:p-6
                    transition-transform duration-300 ease-in-out
                    text-xl

                    /* Mobile */
                    ${isMobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }

                    /* Desktop */
                    md:translate-x-0
                `}
            >
                <div className="space-y-6 sm:space-y-8 overflow-y-auto">

                    {/* ================= BRAND HEADER ================= */}
                    <div className="flex items-center justify-between px-2 sm:px-5 pt-2 sm:pt-6">

                        <div className="flex items-center space-x-3">
                            <div className="h-15 w-15 rounded-xl flex items-center justify-center text-white font-black shrink-0">
                                
                                <img className="w-fit h-full rounded-2xl shadow-lg shadow-black " src={logo}/>
                            </div>

                            <div>
                                <p className="text-xl sm:text-2xl font-extrabold text-red-600 font-plex  dark:text-white uppercase tracking-wider">
                                    3SLearn
                                </p>

                                <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                    Student Record
                                </p>
                            </div>
                        </div>

                        {/* Close button - Mobile only */}
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            aria-label="Close menu"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* ================= NAVIGATION ================= */}
                    <nav className="space-y-1.5 pt-4 sm:pt-6">

                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-3">
                            Financial Ledgers
                        </p>

                        {navItems.map((item) => {
                            const isActive = activeItem === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigation(item)}
                                    className={`
                                        w-full
                                        flex items-center justify-between
                                        px-3 sm:px-4
                                        py-3 sm:py-3.5
                                        rounded-2xl
                                        text-xs sm:text-sm
                                        font-semibold
                                        tracking-wide
                                        transition-all duration-200
                                        group
                                        text-left

                                        ${
                                            isActive
                                                ? "bg-red-600 text-white shadow-lg shadow-indigo-600/15"
                                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-900 dark:hover:text-white"
                                        }
                                    `}
                                >
                                    <div className="flex items-center space-x-3">

                                        <span
                                            className={`
                                                text-sm
                                                transition-transform
                                                duration-200
                                                ${
                                                    !isActive
                                                        ? "group-hover:scale-110"
                                                        : ""
                                                }
                                            `}
                                        >
                                            {item.icon}
                                        </span>

                                        <span className="truncate">
                                            {item.label}
                                        </span>
                                    </div>

                                    {/* Active Indicator */}
                                    {isActive && (
                                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* ================= FOOTER ================= */}
                <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 px-2 flex items-center justify-between">

                    <div className="flex items-center space-x-3">

                        <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-xs font-bold border border-slate-200/40 dark:border-slate-800/60 text-slate-700 dark:text-slate-300">
                            AD
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                                Admin Terminal
                            </h4>

                            <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                                <span className="h-1 w-1 rounded-full bg-emerald-500 inline-block animate-ping" />
                                Synchronized
                            </p>
                        </div>

                    </div>
                </div>
            </aside>

            {/* ================= MOBILE CONTENT SPACING ================= */}
            <div className="md:hidden h-16" />
        </>
    );
}

export default LeftNav;