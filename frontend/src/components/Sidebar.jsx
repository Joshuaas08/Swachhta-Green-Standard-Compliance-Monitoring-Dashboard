import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  ClipboardList,
  AlertTriangle,
  BarChart3,
  BookOpen,
  ShieldCheck,
  FileText,
  BadgeCheck,
} from 'lucide-react';

export default function Sidebar() {
  const { user, isAdmin } = useAuth();

  const navItems = [
    {
      to: '/',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'INSPECTOR', 'MAINTENANCE'],
    },
    {
      to: '/buildings',
      label: 'Facility Management',
      icon: Building2,
      roles: ['ADMIN', 'INSPECTOR', 'MAINTENANCE'],
      badge: isAdmin ? 'Admin' : null,
    },
    {
      to: '/criteria',
      label: 'Compliance Library',
      icon: BookOpen,
      roles: ['ADMIN', 'INSPECTOR', 'MAINTENANCE'],
      badge: isAdmin ? 'Admin' : null,
    },
    {
      to: '/inspections/new',
      label: 'Conduct Facility Audit',
      icon: CheckSquare,
      roles: ['ADMIN', 'INSPECTOR'],
      highlight: true,
    },
    {
      to: '/inspections',
      label: 'Inspection Registry',
      icon: ClipboardList,
      roles: ['ADMIN', 'INSPECTOR', 'MAINTENANCE'],
    },
    {
      to: '/issues',
      label: 'Issue Remediation',
      icon: AlertTriangle,
      roles: ['ADMIN', 'INSPECTOR', 'MAINTENANCE'],
    },
    {
      to: '/analytics',
      label: 'Analytics & Reporting',
      icon: BarChart3,
      roles: ['ADMIN', 'MAINTENANCE'],
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6 px-4 no-print shrink-0 border-r border-slate-900 shadow-xl">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Audit Modules
          </p>
          <nav className="mt-3 space-y-1.5">
            {navItems
              .filter((item) => !item.roles || item.roles.includes(user?.role))
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 font-bold'
                          : item.highlight
                          ? 'bg-slate-900 text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 border border-emerald-500/20'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
          </nav>
        </div>

        {/* Regulatory Governance Standard Card */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
            <BadgeCheck className="w-4 h-4" />
            <span>Statutory Standard</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Aligned with National Building Code (NBC Part 9) & Swachh Survekshan Institutional Guidelines.
          </p>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Framework v2026.4</span>
            <span className="text-emerald-500 font-semibold">Verified</span>
          </div>
        </div>
      </div>

      {/* Official Institutional Footer */}
      <div className="pt-4 border-t border-slate-900 text-[11px] text-slate-500 space-y-1">
        <p className="font-semibold text-slate-400">Swachhta & Green Standards</p>
        <p className="text-[10px] text-slate-600">Institutional Compliance Authority © 2026</p>
      </div>
    </aside>
  );
}
