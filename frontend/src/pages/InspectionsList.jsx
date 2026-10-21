import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inspectionApi, buildingApi } from '../services/api';
import ScoreBadge from '../components/ScoreBadge';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardList,
  PlusCircle,
  Search,
  Filter,
  Building2,
  Calendar,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function InspectionsList() {
  const { isInspector } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBuildings();
  }, []);

  useEffect(() => {
    loadInspections();
  }, [selectedBuilding, selectedRating]);

  const loadBuildings = async () => {
    try {
      const res = await buildingApi.getAll();
      if (res.data.success) setBuildings(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadInspections = async () => {
    try {
      setLoading(true);
      const res = await inspectionApi.getAll({
        building: selectedBuilding,
        rating: selectedRating,
      });
      if (res.data.success) setInspections(res.data.data);
    } catch (err) {
      console.error('Failed to load inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-600" />
            <span>Inspection Audit Registry</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Historical facility compliance audits, weighted score breakdowns, and certificates.
          </p>
        </div>

        {isInspector && (
          <Link
            to="/inspections/new"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Conduct New Audit</span>
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="">All Institutional Facilities</option>
            {buildings.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:w-64 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="">All Classification Tiers</option>
            <option value="EXCELLENT">🟢 Excellent (90-100%)</option>
            <option value="GOOD">🟢 Good (75-89%)</option>
            <option value="NEEDS_IMPROVEMENT">🟡 Needs Improvement (60-74%)</option>
            <option value="POOR">🔴 Poor (0-59%)</option>
          </select>
        </div>
      </div>

      {/* Inspections Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-slate-400 text-xs">Loading audit registry...</p>
        </div>
      ) : inspections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No Inspection Records Found</h3>
          <p className="text-xs text-slate-500 mt-1">Conduct an inspection to create your first compliance audit.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Facility & Code</th>
                  <th className="py-3.5 px-4">Audit Zone</th>
                  <th className="py-3.5 px-4">Auditor</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-center">Item Tally</th>
                  <th className="py-3.5 px-4 text-center">Score & Tier</th>
                  <th className="py-3.5 px-4 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspections.map((insp) => (
                  <tr key={insp._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {insp.building?.name}
                      <span className="block text-[10px] font-normal text-slate-400">
                        {insp.building?.code} • {insp.building?.block}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{insp.zoneName || 'Full Facility'}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{insp.inspector?.name}</span>
                      <span className="block text-[10px] text-slate-400">{insp.inspector?.department}</span>
                    </td>
                    <td className="py-3.5 px-4">{new Date(insp.inspectionDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold">
                        <span className="text-emerald-700" title="Passed">{insp.itemCounts?.pass || 0} P</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-amber-700" title="Partial">{insp.itemCounts?.partial || 0} Pt</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-red-700" title="Failed">{insp.itemCounts?.fail || 0} F</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <ScoreBadge score={insp.totalScore} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/inspections/${insp._id}`}
                        className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs"
                      >
                        <span>View Audit</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
