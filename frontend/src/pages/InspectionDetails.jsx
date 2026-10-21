import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { inspectionApi } from '../services/api';
import ScoreBadge from '../components/ScoreBadge';
import {
  Printer,
  ArrowLeft,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';

export default function InspectionDetails() {
  const { id } = useParams();
  const [inspection, setInspection] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInspection();
  }, [id]);

  const loadInspection = async () => {
    try {
      setLoading(true);
      const res = await inspectionApi.getById(id);
      if (res.data.success) {
        setInspection(res.data.data);
        setIssues(res.data.issues || []);
      }
    } catch (err) {
      console.error('Failed to load inspection:', err);
      setError('Inspection audit record could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Generating audit certificate report...</p>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">{error || 'Inspection Not Found'}</h2>
        <Link to="/inspections" className="text-emerald-600 text-xs font-semibold mt-4 inline-block">
          ← Back to Inspection Audits
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Action Bar (Hidden when printing) */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/inspections"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Audits</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Certificate</span>
        </button>
      </div>

      {/* Official Audit Certificate Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Certificate Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Official Compliance Audit Record</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Swachhta & Green Standard Certificate
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Audit Reference ID: <span className="font-mono font-bold text-slate-800">{inspection._id}</span>
            </p>
          </div>

          {/* Certificate Badge */}
          <div className="flex flex-col items-center sm:items-end justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Final Compliance Score</span>
            <div className="text-4xl font-black text-slate-900 mt-1">
              {inspection.totalScore}%
            </div>
            <div className="mt-1">
              <ScoreBadge score={inspection.totalScore} size="md" />
            </div>
          </div>
        </div>

        {/* Audit Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Facility</span>
            <span className="font-bold text-slate-900 block mt-0.5">{inspection.building?.name}</span>
            <span className="text-slate-500 text-[11px]">{inspection.building?.code} ({inspection.building?.block})</span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Audit Zone</span>
            <span className="font-bold text-slate-900 block mt-0.5">{inspection.zoneName || 'Full Facility'}</span>
            <span className="text-slate-500 text-[11px]">{inspection.building?.totalFloors} Floors</span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Lead Auditor</span>
            <span className="font-bold text-slate-900 block mt-0.5">{inspection.inspector?.name}</span>
            <span className="text-slate-500 text-[11px]">{inspection.inspector?.department}</span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Date of Audit</span>
            <span className="font-bold text-slate-900 block mt-0.5">
              {new Date(inspection.inspectionDate).toLocaleDateString()}
            </span>
            <span className="text-emerald-700 font-semibold text-[11px]">Official Verification</span>
          </div>
        </div>

        {inspection.generalNotes && (
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs text-slate-700">
            <span className="font-bold text-emerald-900 block mb-1">Auditor Field Notes:</span>
            <span>{inspection.generalNotes}</span>
          </div>
        )}

        {/* Category Breakdown Score Cards */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
            Category-wise Compliance Scores
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {inspection.categoryBreakdown?.map((cat) => (
              <div
                key={cat.category}
                className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-center"
              >
                <p className="text-[11px] font-semibold text-slate-600 truncate">{cat.category}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{cat.score}%</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 inline-block mt-1">
                  {cat.ratingLabel}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Itemized Audit Checklist */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
            Evaluated Criteria Checklist & Evidence
          </h2>
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Standard Parameter</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Weight</th>
                  <th className="py-3 px-4 text-center">Evaluation</th>
                  <th className="py-3 px-4">Remarks & Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspection.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                      {item.criteriaTitle}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{item.category}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {item.weight}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.status === 'PASS' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> PASS (1.0)
                        </span>
                      ) : item.status === 'PARTIAL' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[11px]">
                          <AlertTriangle className="w-3 h-3" /> PARTIAL (0.5)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full text-[11px]">
                          <AlertCircle className="w-3 h-3" /> FAIL (0.0)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      <span>{item.remarks || '—'}</span>
                      {item.photoUrl && (
                        <a
                          href={item.photoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 text-emerald-600 hover:underline font-semibold inline-flex items-center gap-0.5 text-[10px]"
                        >
                          [Photo Evidence]
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Corrective Issues Section */}
        {issues.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-red-700 mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Corrective Action Items Spawned ({issues.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {issues.map((iss) => (
                <div
                  key={iss._id}
                  className="p-3.5 bg-red-50/50 rounded-xl border border-red-200 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                      {iss.priority} PRIORITY
                    </span>
                    <h4 className="font-bold text-slate-900 mt-1">{iss.title}</h4>
                    <p className="text-slate-600 text-[11px] mt-0.5">{iss.inspectorRemarks}</p>
                  </div>
                  <Link
                    to="/issues"
                    className="text-xs font-semibold text-emerald-700 hover:underline shrink-0 flex items-center gap-0.5"
                  >
                    <span>Track</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signatures for Print */}
        <div className="pt-12 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-b border-slate-300 w-48 mx-auto mb-2"></div>
            <p className="font-bold text-slate-800">{inspection.inspector?.name}</p>
            <p className="text-slate-500 text-[10px]">Certified Green Facility Inspector</p>
          </div>
          <div>
            <div className="border-b border-slate-300 w-48 mx-auto mb-2"></div>
            <p className="font-bold text-slate-800">Director / Estate Officer</p>
            <p className="text-slate-500 text-[10px]">Institutional Compliance Authority</p>
          </div>
        </div>
      </div>
    </div>
  );
}
