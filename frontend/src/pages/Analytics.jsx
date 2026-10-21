import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import ScoreBadge from '../components/ScoreBadge';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Layers,
  Award,
  AlertOctagon,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [buildingRankings, setBuildingRankings] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);
      const [ovRes, catRes, buildRes, trendRes] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getCategoryComparison(),
        analyticsApi.getBuildingComparison(),
        analyticsApi.getTrends(),
      ]);

      if (ovRes.data.success) setOverview(ovRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (buildRes.data.success) setBuildingRankings(buildRes.data.data);
      if (trendRes.data.success) setTrends(trendRes.data.data);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!buildingRankings || buildingRankings.length === 0) return;

    const headers = ['Facility Name', 'Code', 'Block', 'Square Footage', 'Total Audits', 'Latest Score %', 'Historical Avg %', 'Open Issues', 'Rating Tier'];
    const rows = buildingRankings.map((b) => [
      `"${b.name}"`,
      b.code,
      b.block,
      b.squareFootage,
      b.inspectionsCount,
      b.latestScore,
      b.averageScore,
      b.openIssuesCount,
      b.rating?.label || 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `swachhta_green_compliance_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Synthesizing institutional analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>Compliance Analytics & Executive Reports</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Cross-facility benchmark evaluations, radar distribution, and compliance dataset exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV Report</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Executive Brief</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border-r border-slate-100 last:border-none pr-4">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">Average Campus Score</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-slate-900">{overview?.averageComplianceScore}%</span>
            <ScoreBadge score={overview?.averageComplianceScore} size="sm" showLabel={false} />
          </div>
          <p className="text-xs text-slate-500 mt-1">Across all completed facility audits</p>
        </div>

        <div className="border-r border-slate-100 last:border-none pr-4">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">Facilities Monitored</span>
          <span className="text-3xl font-black text-slate-900 block mt-1">{overview?.totalBuildings}</span>
          <p className="text-xs text-slate-500 mt-1">100% active institutional coverage</p>
        </div>

        <div className="border-r border-slate-100 last:border-none pr-4">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">Open Violations</span>
          <span className="text-3xl font-black text-amber-600 block mt-1">{overview?.openIssues}</span>
          <p className="text-xs text-slate-500 mt-1">{overview?.resolvedIssues} resolved to date</p>
        </div>

        <div>
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">Top Performing Block</span>
          <span className="text-lg font-bold text-slate-900 block mt-1 truncate">
            {buildingRankings[0]?.name || 'N/A'}
          </span>
          <p className="text-xs text-emerald-600 font-semibold mt-0.5">
            Leader: {buildingRankings[0]?.latestScore}% Compliance
          </p>
        </div>
      </div>

      {/* Visual Analytics Row 1: Radar Chart & Category Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-base">Sustainability Radar Matrix</h3>
            <p className="text-xs text-slate-500">Multi-axis compliance balance across 5 green pillars</p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={categories}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: '#475569' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Compliance %" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Tooltip formatter={(val) => [`${val}%`, 'Compliance']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Detailed Bars */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="font-bold text-slate-900 text-base">Standard Category Performance</h3>
              <p className="text-xs text-slate-500">Breakdown of weighted scores by institutional domain</p>
            </div>

            <div className="space-y-4">
              {categories.map((c) => (
                <div key={c.category} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{c.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">{c.score}%</span>
                      <ScoreBadge score={c.score} size="sm" showLabel={false} />
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        c.score >= 90 ? 'bg-emerald-500' : c.score >= 75 ? 'bg-green-500' : c.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${c.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Formula standard: NBC & Swachh Campus 2026</span>
            <span className="font-semibold text-slate-700">Weights 1-5 Factor Applied</span>
          </div>
        </div>
      </div>

      {/* Building Compliance Comparison Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Institutional Facility Ranking Table</h3>
            <p className="text-xs text-slate-500">Comprehensive compliance scorecard across all campus facilities</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-y border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Facility Name & Code</th>
                <th className="py-3 px-4">Block</th>
                <th className="py-3 px-4">Area (sq.ft)</th>
                <th className="py-3 px-4 text-center">Total Audits</th>
                <th className="py-3 px-4 text-center">Latest Score</th>
                <th className="py-3 px-4 text-center">Historical Avg</th>
                <th className="py-3 px-4 text-center">Open Issues</th>
                <th className="py-3 px-4 text-right">Rating Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {buildingRankings.map((b, idx) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {b.name}
                    <span className="block text-[10px] font-normal text-slate-400">{b.code}</span>
                  </td>
                  <td className="py-3 px-4">{b.block}</td>
                  <td className="py-3 px-4">{b.squareFootage?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center font-semibold">{b.inspectionsCount}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">{b.latestScore}%</td>
                  <td className="py-3 px-4 text-center font-medium text-slate-700">{b.averageScore}%</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        b.openIssuesCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.openIssuesCount}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <ScoreBadge score={b.latestScore} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
