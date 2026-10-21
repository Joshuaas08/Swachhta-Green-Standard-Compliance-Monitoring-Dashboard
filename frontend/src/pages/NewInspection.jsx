import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildingApi, criteriaApi, inspectionApi, uploadApi } from '../services/api';
import ScoreBadge, { getScoreTier } from '../components/ScoreBadge';
import {
  CheckSquare,
  Building2,
  Calendar,
  Layers,
  Upload,
  Camera,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Send,
  Sparkles,
  Info,
} from 'lucide-react';

export default function NewInspection() {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [selectedZone, setSelectedZone] = useState('Full Facility');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFor, setUploadingFor] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [bRes, cRes] = await Promise.all([
        buildingApi.getAll(),
        criteriaApi.getAll(),
      ]);

      if (bRes.data.success) {
        setBuildings(bRes.data.data);
        if (bRes.data.data.length > 0) {
          setSelectedBuildingId(bRes.data.data[0]._id);
        }
      }

      if (cRes.data.success) {
        setCriteria(cRes.data.data);
        // Initialize default checklist state: default PASS for swift auditing
        const initialItems = {};
        cRes.data.data.forEach((c) => {
          initialItems[c._id] = {
            criteriaId: c._id,
            criteriaTitle: c.title,
            category: c.category,
            weight: c.weight,
            status: 'PASS',
            remarks: '',
            photoUrl: '',
          };
        });
        setItems(initialItems);
      }
    } catch (err) {
      console.error('Failed to load inspection data:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedBuilding = buildings.find((b) => b._id === selectedBuildingId);

  // Dynamic Score Calculation (Client-Side for Instant Real-Time Gauge)
  const calculateLiveScore = () => {
    const itemList = Object.values(items);
    if (itemList.length === 0) return { score: 0, points: 0, totalWeight: 0, failCount: 0, passCount: 0, partialCount: 0 };

    let totalWeight = 0;
    let earnedPoints = 0;
    let failCount = 0;
    let passCount = 0;
    let partialCount = 0;

    itemList.forEach((item) => {
      const w = Number(item.weight) || 1;
      totalWeight += w;

      if (item.status === 'PASS') {
        earnedPoints += w * 1.0;
        passCount++;
      } else if (item.status === 'PARTIAL') {
        earnedPoints += w * 0.5;
        partialCount++;
      } else {
        earnedPoints += 0.0;
        failCount++;
      }
    });

    const score = totalWeight > 0 ? Math.round((earnedPoints / totalWeight) * 100 * 10) / 10 : 0;
    return { score, points: earnedPoints, totalWeight, failCount, passCount, partialCount };
  };

  const liveStats = calculateLiveScore();
  const liveTier = getScoreTier(liveStats.score);

  const handleStatusChange = (criteriaId, status) => {
    setItems((prev) => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        status,
      },
    }));
  };

  const handleRemarksChange = (criteriaId, remarks) => {
    setItems((prev) => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        remarks,
      },
    }));
  };

  const handlePhotoUpload = async (criteriaId, file) => {
    if (!file) return;
    try {
      setUploadingFor(criteriaId);
      const formData = new FormData();
      formData.append('photo', file);
      const res = await uploadApi.uploadPhoto(formData);
      if (res.data.success) {
        setItems((prev) => ({
          ...prev,
          [criteriaId]: {
            ...prev[criteriaId],
            photoUrl: res.data.photoUrl,
          },
        }));
      }
    } catch (err) {
      console.warn('Upload error, falling back to local object URL:', err);
      const localUrl = URL.createObjectURL(file);
      setItems((prev) => ({
        ...prev,
        [criteriaId]: {
          ...prev[criteriaId],
          photoUrl: localUrl,
        },
      }));
    } finally {
      setUploadingFor(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBuildingId) {
      alert('Please select an institutional facility/building.');
      return;
    }

    const payload = {
      buildingId: selectedBuildingId,
      zoneName: selectedZone,
      inspectionDate,
      generalNotes,
      items: Object.values(items),
    };

    try {
      setSubmitting(true);
      const res = await inspectionApi.create(payload);
      if (res.data.success) {
        const auditId = res.data.data._id;
        const issuesMsg = res.data.autoIssuesCreated > 0
          ? `\n🚨 ${res.data.autoIssuesCreated} corrective issue(s) automatically flagged for Maintenance.`
          : '';
        alert(`Audit completed! Final Compliance Score: ${res.data.data.totalScore}% (${res.data.data.ratingLabel}).${issuesMsg}`);
        navigate(`/inspections/${auditId}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit inspection');
    } finally {
      setSubmitting(false);
    }
  };

  // Group criteria by category
  const categoriesList = ['Cleanliness', 'Waste Segregation', 'Water Conservation', 'Energy Efficiency', 'Air Quality'];

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Preparing facility inspection checklist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-600" />
            <span>Conduct Facility Inspection</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Evaluate on-site cleanliness and green standards. Scores and corrective issues calculate in real-time.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & Checklists (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Inspection Metadata Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Inspection Parameters</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Building / Block *</label>
                <select
                  required
                  value={selectedBuildingId}
                  onChange={(e) => {
                    setSelectedBuildingId(e.target.value);
                    setSelectedZone('Full Facility');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {buildings.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.code} - {b.block})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Zone / Floor</label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                >
                  <option value="Full Facility">Full Facility (Comprehensive)</option>
                  {selectedBuilding?.zones?.map((z, idx) => (
                    <option key={idx} value={z.name}>
                      {z.name} ({z.floor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inspection Date *</label>
                <input
                  type="date"
                  required
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">General Audit Observations / Context</label>
              <textarea
                rows={2}
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Weather conditions, maintenance ongoing, occupancy notes..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              />
            </div>
          </div>

          {/* Category-Organized Checklist Items */}
          {categoriesList.map((category) => {
            const categoryCriteria = criteria.filter((c) => c.category === category);
            if (categoryCriteria.length === 0) return null;

            return (
              <div key={category} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-base">{category}</h3>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {categoryCriteria.length} parameters
                  </span>
                </div>

                <div className="space-y-4">
                  {categoryCriteria.map((c) => {
                    const itemState = items[c._id] || { status: 'PASS', remarks: '', photoUrl: '' };

                    return (
                      <div
                        key={c._id}
                        className={`p-4 rounded-xl border transition-all ${
                          itemState.status === 'PASS'
                            ? 'border-emerald-100 bg-emerald-50/20'
                            : itemState.status === 'PARTIAL'
                            ? 'border-amber-200 bg-amber-50/30'
                            : 'border-red-200 bg-red-50/30'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">{c.title}</h4>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                W: {c.weight}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{c.description}</p>
                            {c.guidance && (
                              <p className="text-[11px] text-slate-400 mt-0.5 italic">Guidance: {c.guidance}</p>
                            )}
                          </div>

                          {/* PASS / PARTIAL / FAIL Tri-State Button Toggle */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(c._id, 'PASS')}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                itemState.status === 'PASS'
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>PASS (1.0)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(c._id, 'PARTIAL')}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                itemState.status === 'PARTIAL'
                                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                                  : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800'
                              }`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>PARTIAL (0.5)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(c._id, 'FAIL')}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                itemState.status === 'FAIL'
                                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                                  : 'bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-800'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>FAIL (0.0)</span>
                            </button>
                          </div>
                        </div>

                        {/* Fail Alert Notification */}
                        {itemState.status === 'FAIL' && (
                          <div className="mt-2 p-2 bg-red-100/70 border border-red-200 rounded-lg text-[11px] text-red-800 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                            <span>
                              <strong>Action Required:</strong> Submitting with FAIL will automatically create an issue for Maintenance dispatch.
                            </span>
                          </div>
                        )}

                        {/* Remarks and Photo Evidence Input */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-3 pt-2 border-t border-slate-100">
                          <div className="sm:col-span-8">
                            <input
                              type="text"
                              placeholder={
                                itemState.status === 'FAIL'
                                  ? 'Specify violation details, exact location, or repair needed...'
                                  : 'Optional inspector observation notes...'
                              }
                              value={itemState.remarks}
                              onChange={(e) => handleRemarksChange(c._id, e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>

                          <div className="sm:col-span-4 flex items-center gap-2">
                            <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 transition-colors">
                              <Camera className="w-3.5 h-3.5 text-slate-400" />
                              <span>{uploadingFor === c._id ? 'Attaching...' : 'Attach Photo'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handlePhotoUpload(c._id, e.target.files[0])}
                              />
                            </label>

                            {itemState.photoUrl && (
                              <a
                                href={itemState.photoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-1 rounded font-semibold border border-emerald-200 underline"
                              >
                                View
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Sticky Live Compliance Gauge & Submit (4 Cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live Scoring Meter
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dynamic Evaluation</span>
              </span>
            </div>

            {/* Score Ring Display */}
            <div className="text-center py-2">
              <div className="text-5xl font-black text-slate-900 tracking-tight">
                {liveStats.score}%
              </div>
              <div className="mt-2 flex justify-center">
                <ScoreBadge score={liveStats.score} size="lg" />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Points Earned: <strong>{liveStats.points}</strong> / {liveStats.totalWeight} Total Weight
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  liveStats.score >= 90
                    ? 'bg-emerald-500'
                    : liveStats.score >= 75
                    ? 'bg-green-500'
                    : liveStats.score >= 60
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${liveStats.score}%` }}
              ></div>
            </div>

            {/* Tally Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100">
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="block text-[10px] text-emerald-700 font-semibold">PASS</span>
                <span className="font-black text-emerald-900 text-base">{liveStats.passCount}</span>
              </div>
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                <span className="block text-[10px] text-amber-700 font-semibold">PARTIAL</span>
                <span className="font-black text-amber-900 text-base">{liveStats.partialCount}</span>
              </div>
              <div className="p-2 bg-red-50 rounded-xl border border-red-100">
                <span className="block text-[10px] text-red-700 font-semibold">FAIL</span>
                <span className="font-black text-red-900 text-base">{liveStats.failCount}</span>
              </div>
            </div>

            {/* Auto Issue Warning */}
            {liveStats.failCount > 0 && (
              <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>{liveStats.failCount} Issue(s) Will Be Spawned</span>
                </p>
                <p className="text-[11px] leading-relaxed text-red-700">
                  Failed items are automatically routed to the Maintenance workflow for rapid remediation.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              {submitting ? (
                <span>Generating Compliance Audit...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Facility Inspection</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Official audit record stamped with timestamp & inspector digital signature.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
