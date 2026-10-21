import React from 'react';

export const getScoreTier = (score) => {
  const s = Number(score) || 0;
  if (s >= 90) {
    return {
      key: 'EXCELLENT',
      label: 'Excellent',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      badgeBg: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
      icon: '🟢',
    };
  }
  if (s >= 75) {
    return {
      key: 'GOOD',
      label: 'Good',
      color: 'bg-teal-50 text-teal-800 border-teal-200/80',
      badgeBg: 'bg-teal-500',
      textColor: 'text-teal-700',
      dotColor: 'bg-teal-500',
      icon: '🟢',
    };
  }
  if (s >= 60) {
    return {
      key: 'NEEDS_IMPROVEMENT',
      label: 'Needs Improvement',
      color: 'bg-amber-50 text-amber-800 border-amber-200/80',
      badgeBg: 'bg-amber-500',
      textColor: 'text-amber-700',
      dotColor: 'bg-amber-500',
      icon: '🟡',
    };
  }
  return {
    key: 'POOR',
    label: 'Poor',
    color: 'bg-rose-50 text-rose-800 border-rose-200/80',
    badgeBg: 'bg-rose-500',
    textColor: 'text-rose-700',
    dotColor: 'bg-rose-500',
    icon: '🔴',
  };
};

export default function ScoreBadge({ score, showLabel = true, size = 'md' }) {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
        <span>Pending Audit</span>
      </span>
    );
  }

  const tier = getScoreTier(score);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${tier.color} ${
        sizeClasses[size] || sizeClasses.md
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${tier.dotColor} shrink-0`}></span>
      <span>{score}%</span>
      {showLabel && (
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 border-l border-current/20 pl-1.5">
          {tier.label}
        </span>
      )}
    </span>
  );
}
