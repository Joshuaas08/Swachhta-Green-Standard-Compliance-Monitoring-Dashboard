import React, { useState, useEffect } from 'react';
import { issueApi, buildingApi, authApi, uploadApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Filter,
  Check,
  ChevronRight,
  X,
  Camera,
  Layers,
  ArrowRight,
  Sparkles,
  Building2,
} from 'lucide-react';

const STATUS_COLUMNS = [
  { id: 'OPEN', label: 'Open Violations', color: 'bg-red-50 text-red-800 border-red-200', dot: 'bg-red-500' },
  { id: 'IN_PROGRESS', label: 'In Remediation', color: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  { id: 'RESOLVED', label: 'Resolved (Pending Close)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  { id: 'CLOSED', label: 'Verified & Closed', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
];

export default function Issues() {
  const { user, isMaintenance, isAdmin } = useAuth();
  const [issues, setIssues] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'

  // Modal State
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadAuxData();
  }, []);

  useEffect(() => {
    loadIssues();
  }, [selectedBuilding, selectedPriority]);

  const loadAuxData = async () => {
    try {
      const [bRes, uRes] = await Promise.all([
        buildingApi.getAll(),
        authApi.getUsers().catch(() => ({ data: { data: [] } })),
      ]);
      if (bRes.data.success) setBuildings(bRes.data.data);
      if (uRes.data?.success) setUsersList(uRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadIssues = async () => {
    try {
      setLoading(true);
      const res = await issueApi.getAll({
        building: selectedBuilding,
        priority: selectedPriority,
      });
      if (res.data.success) {
        setIssues(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpdate = (iss) => {
    setSelectedIssue(iss);
    setStatusUpdate(iss.status);
    setUpdateNote('');
    setAssigneeName(iss.assignedToName || 'Maintenance Team');
    setResolutionRemarks(iss.resolutionRemarks || '');
    setResolutionPhotoUrl(iss.resolutionPhotoUrl || '');
    setIsModalOpen(true);
  };

  const handleProofPhotoUpload = async (file) => {
    if (!file) return;
    try {
      setUploadingProof(true);
      const formData = new FormData();
      formData.append('photo', file);
      const res = await uploadApi.uploadPhoto(formData);
      if (res.data.success) {
        setResolutionPhotoUrl(res.data.photoUrl);
      }
    } catch (err) {
      const localUrl = URL.createObjectURL(file);
      setResolutionPhotoUrl(localUrl);
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSubmitStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;

    try {
      setUpdating(true);
      await issueApi.updateStatus(selectedIssue._id, {
        status: statusUpdate,
        note: updateNote,
        assignedToName: assigneeName,
        resolutionRemarks,
        resolutionPhotoUrl,
      });
      setIsModalOpen(false);
      loadIssues();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update issue status');
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'CRITICAL':
        return <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded border border-red-300">CRITICAL</span>;
      case 'HIGH':
        return <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-300">HIGH</span>;
      case 'MEDIUM':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">MEDIUM</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-medium px-2 py-0.5 rounded">LOW</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <span>Corrective Issue Workflow</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Auto-generated from failed inspection checklist checks. Complete lifecycle from OPEN to CLOSED.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            List View
          </button>
        </div>
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
            <option value="">All Buildings / Facilities</option>
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
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Workflow Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-slate-400 text-xs">Syncing workflow boards...</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {STATUS_COLUMNS.map((col) => {
            const colIssues = issues.filter((iss) => iss.status === col.id);

            return (
              <div key={col.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 min-h-[500px] flex flex-col">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`}></span>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">{col.label}</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {colIssues.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colIssues.map((iss) => (
                    <div
                      key={iss._id}
                      onClick={() => handleOpenUpdate(iss)}
                      className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer space-y-2.5"
                    >
                      <div className="flex justify-between items-start gap-1">
                        {getPriorityBadge(iss.priority)}
                        <span className="text-[10px] text-slate-400">
                          {new Date(iss.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs leading-snug">{iss.title}</h4>

                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {iss.inspectorRemarks || 'Failed checklist item.'}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-medium text-slate-700 truncate pr-1">
                          {iss.building?.name || 'Facility'}
                        </span>
                        <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 shrink-0 font-medium">
                          {iss.assignedToName || 'Maintenance'}
                        </span>
                      </div>
                    </div>
                  ))}

                  {colIssues.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
                      No issues in this stage.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Issue Description</th>
                  <th className="py-3.5 px-4">Facility</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Team</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues.map((iss) => (
                  <tr key={iss._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">{getPriorityBadge(iss.priority)}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{iss.title}</span>
                      <span className="text-[11px] text-slate-500">{iss.inspectorRemarks}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{iss.building?.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          iss.status === 'OPEN'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : iss.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : iss.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {iss.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{iss.assignedToName || 'Unassigned'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenUpdate(iss)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Transition & Remediation Modal */}
      {isModalOpen && selectedIssue && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(selectedIssue.priority)}
                  <span className="text-xs text-slate-400">
                    ID: {selectedIssue._id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">{selectedIssue.title}</h2>
                <p className="text-xs text-slate-500">{selectedIssue.building?.name}</p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitStatusUpdate} className="space-y-4 mt-4">
              {/* Auditor Observation */}
              <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-900">
                <span className="font-bold block mb-0.5">Inspector Violation Remarks:</span>
                <span>{selectedIssue.inspectorRemarks || 'Non-compliance flagged during audit.'}</span>
              </div>

              {/* Status Transition Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Workflow Lifecycle Stage *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {STATUS_COLUMNS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setStatusUpdate(col.id)}
                      className={`p-2 rounded-xl text-xs font-bold text-center border transition-all ${
                        statusUpdate === col.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {col.id.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Maintenance Personnel / Team
                </label>
                <input
                  type="text"
                  value={assigneeName}
                  onChange={(e) => setAssigneeName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  placeholder="e.g. Electrical Crew / Amit Patel"
                />
              </div>

              {/* Resolution Remarks (If resolving/closing) */}
              {(statusUpdate === 'RESOLVED' || statusUpdate === 'CLOSED') && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-emerald-900 mb-1">
                      Corrective Action & Resolution Notes *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={resolutionRemarks}
                      onChange={(e) => setResolutionRemarks(e.target.value)}
                      placeholder="Detail the repair completed, parts replaced, or corrective measures taken..."
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-900 mb-1">
                      Resolution Proof Photo
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-800 hover:bg-emerald-100/50 inline-flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" />
                        <span>{uploadingProof ? 'Uploading Proof...' : 'Upload Repair Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleProofPhotoUpload(e.target.files[0])}
                        />
                      </label>
                      {resolutionPhotoUrl && (
                        <a
                          href={resolutionPhotoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-700 underline font-semibold"
                        >
                          View Proof
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Update Timeline Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Log Entry / Progress Note
                </label>
                <input
                  type="text"
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  placeholder="e.g. Parts dispatched, awaiting plumbing contractor..."
                />
              </div>

              {/* Timeline History */}
              {selectedIssue.timeline && selectedIssue.timeline.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Audit Trail History
                  </span>
                  <div className="max-h-28 overflow-y-auto space-y-2 pr-1">
                    {selectedIssue.timeline.map((t, idx) => (
                      <div key={idx} className="text-[11px] p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>{t.updatedBy}</span>
                          <span>{new Date(t.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="font-semibold text-slate-800 mt-0.5">{t.status}</p>
                        {t.note && <p className="text-slate-600 mt-0.5">{t.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Save Workflow Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
