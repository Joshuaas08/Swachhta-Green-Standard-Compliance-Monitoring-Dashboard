import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, buildingApi } from '../services/api';
import ScoreBadge from '../components/ScoreBadge';
import { useAuth } from '../context/AuthContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Building2,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  PlusCircle,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function Dashboard() {
  const { user, isInspector } = useAuth();
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [buildingRankings, setBuildingRankings] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
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
      console.error('Error fetching dashboard data:', err);
      setError('Could not load complete dashboard statistics. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm font-medium">Aggregating compliance intelligence...</p>
        </div>
      </div>
    );
  }

  const avgScore = overview?.averageComplianceScore || 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Real-Time Audit Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Swachhta & Green Standard Compliance
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Welcome back, <strong className="text-white">{user?.name}</strong>. Monitor sustainability benchmarks, review dynamic compliance scoring, and resolve non-conformances across all facilities.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isInspector && (
              <Link
                to="/inspections/new"
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Inspection</span>
              </Link>
            )}
            <Link
              to="/issues"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors border border-white/10"
            >
              <span>View Issues ({overview?.openIssues || 0})</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Compliance Meter */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Campus Score</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-slate-900">{avgScore}%</span>
                <ScoreBadge score={avgScore} size="sm" showLabel={false} />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tier: <strong className="text-emerald-700 font-semibold">{overview?.overallRating?.label || 'Good'}</strong>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                avgScore >= 90 ? 'bg-emerald-500' : avgScore >= 75 ? 'bg-green-500' : avgScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${avgScore}%` }}
            ></div>
          </div>
        </div>

        {/* Total Inspections */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Audits</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2">{overview?.totalInspections || 0}</h3>
              <p className="text-xs text-slate-500 mt-1">Completed across all blocks</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-blue-600 font-medium mt-4 flex items-center gap-1">
            <span>Dynamic weighted algorithm verified</span>
          </p>
        </div>

        {/* Active Issues */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Violations</p>
              <h3 className="text-3xl font-black text-amber-600 mt-2">{overview?.openIssues || 0}</h3>
              <p className="text-xs text-slate-500 mt-1">{overview?.resolvedIssues || 0} resolved to date</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Auto-generated from failed items</span>
          </div>
        </div>

        {/* Facilities Monitored */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Facilities</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2">{overview?.totalBuildings || 0}</h3>
              <p className="text-xs text-slate-500 mt-1">Institutional blocks active</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <Link
            to="/buildings"
            className="text-[11px] text-purple-600 font-medium mt-4 flex items-center gap-1 hover:underline"
          >
            <span>Manage building profiles & zones</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Category Compliance Distribution</h3>
              <p className="text-xs text-slate-500">Average weighted performance across green categories</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Weights 1 - 5
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Compliance']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="score" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Quick Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
            {categories.map((c) => (
              <div key={c.category} className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 truncate pr-2">{c.category}</span>
                <span className="font-bold text-slate-900">{c.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Building Rankings Leaderboard (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Facility Leaderboard</h3>
                <p className="text-xs text-slate-500">Compliance ranking by latest audit</p>
              </div>
              <Link to="/buildings" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {buildingRankings.slice(0, 5).map((b, index) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? 'bg-amber-100 text-amber-800'
                          : index === 1
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">{b.name}</h4>
                      <p className="text-[10px] text-slate-400">
                        {b.block} • {b.squareFootage?.toLocaleString()} sq.ft
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <ScoreBadge score={b.latestScore} size="sm" showLabel={false} />
                    {b.openIssuesCount > 0 && (
                      <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                        {b.openIssuesCount} issue{b.openIssuesCount > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/inspections/new"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              <span>Conduct an on-site audit to update scores</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Compliance Trajectory Over Time (Line Chart) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Compliance Score Trajectory</h3>
            <p className="text-xs text-slate-500">Historical performance curve across consecutive audits</p>
          </div>
          <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Target Benchmark: &gt;85%</span>
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ top: 10, right: 20, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <Tooltip
                formatter={(val, name, item) => [`${val}% (${item.payload.rating})`, item.payload.building]}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#059669"
                strokeWidth={3}
                dot={{ fill: '#059669', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Inspections Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Audit Logs</h3>
            <p className="text-xs text-slate-500">Latest facility evaluations with computed ratings</p>
          </div>
          <Link to="/inspections" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            View All Audits
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-y border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Building</th>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4">Inspector</th>
                <th className="py-3 px-4">Audit Date</th>
                <th className="py-3 px-4 text-center">Score & Classification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overview?.recentInspections?.map((insp) => (
                <tr key={insp._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {insp.building?.name || 'Institutional Building'}
                    <span className="block text-[10px] font-normal text-slate-400">{insp.building?.code}</span>
                  </td>
                  <td className="py-3.5 px-4">{insp.zoneName || 'Full Facility'}</td>
                  <td className="py-3.5 px-4">{insp.inspector?.name}</td>
                  <td className="py-3.5 px-4">{new Date(insp.inspectionDate).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4 text-center">
                    <ScoreBadge score={insp.totalScore} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/inspections/${insp._id}`}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                    >
                      Audit Certificate
                    </Link>
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
