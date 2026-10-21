import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogOut, ShieldCheck, Activity } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="bg-purple-50 text-purple-700 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border border-purple-200">
            System Administrator
          </span>
        );
      case 'INSPECTOR':
        return (
          <span className="bg-blue-50 text-blue-700 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">
            Lead Facility Inspector
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="bg-amber-50 text-amber-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border border-amber-200">
            Maintenance & Engineering
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
            {role}
          </span>
        );
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand & Institutional Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-200/50 shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                  Swachhta & Green Standards
                </span>
                <span className="hidden sm:inline-block bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-emerald-200">
                  Compliance Console
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Institutional Environmental Audit & Governance Framework
              </p>
            </div>
          </div>

          {/* User Profile & Session Controls */}
          {user && (
            <div className="flex items-center gap-4">
              {/* System Health / Status Indicator */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Audit Network Active</span>
              </div>

              {/* User Identity Card */}
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xs shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{user.name}</span>
                    {getRoleBadge(user.role)}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">{user.department}</p>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors"
                title="End session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
