import React, { useState, useEffect } from 'react';
import { criteriaApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Plus,
  Star,
  Sparkles,
  Droplets,
  Recycle,
  Zap,
  Wind,
  Edit3,
  Trash2,
  X,
  Info,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'Cleanliness', label: 'Cleanliness & Hygiene', icon: Sparkles, color: 'emerald' },
  { id: 'Waste Segregation', label: 'Waste Segregation', icon: Recycle, color: 'blue' },
  { id: 'Water Conservation', label: 'Water Conservation', icon: Droplets, color: 'cyan' },
  { id: 'Energy Efficiency', label: 'Energy Efficiency', icon: Zap, color: 'amber' },
  { id: 'Air Quality', label: 'Air Quality & Environment', icon: Wind, color: 'teal' },
];

export default function Criteria() {
  const { isAdmin } = useAuth();
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Cleanliness');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Cleanliness',
    description: '',
    weight: 3,
    guidance: '',
    standardReference: 'Swachh Bharat Institutional Manual',
  });

  useEffect(() => {
    loadCriteria();
  }, [selectedCategory]);

  const loadCriteria = async () => {
    try {
      setLoading(true);
      const res = await criteriaApi.getAll({ category: selectedCategory });
      if (res.data.success) {
        setCriteria(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load criteria:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCriteria(null);
    setFormData({
      title: '',
      category: selectedCategory,
      description: '',
      weight: 3,
      guidance: '',
      standardReference: 'Swachh Bharat / Green Building Code',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCriteria(c);
    setFormData({
      title: c.title,
      category: c.category,
      description: c.description,
      weight: c.weight,
      guidance: c.guidance || '',
      standardReference: c.standardReference || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCriteria) {
        await criteriaApi.update(editingCriteria._id, formData);
      } else {
        await criteriaApi.create(formData);
      }
      setIsModalOpen(false);
      loadCriteria();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save criteria');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this compliance standard criteria?')) return;
    try {
      await criteriaApi.delete(id);
      loadCriteria();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete criteria');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <span>Standards & Criteria Library</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Institutional benchmarks across 5 sustainability domains with weighted impact coefficients (1 to 5).
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Standard Criteria</span>
          </button>
        )}
      </div>

      {/* Formula Explanation Callout */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm">Dynamic Weighted Scoring Formula</p>
          <p className="mt-0.5 leading-relaxed text-emerald-800">
            Compliance Score % = <code>(Sum of Item Weight * Status Multiplier / Total Weight) * 100</code>
            <br />
            Status Multipliers: <strong>PASS = 1.0</strong> | <strong>PARTIAL = 0.5</strong> | <strong>FAIL = 0.0</strong>. Criteria with weight 5 contribute 5x more impact to the final institutional grade.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Criteria Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-slate-400 text-xs">Loading criteria...</p>
        </div>
      ) : criteria.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No Criteria in this Category</h3>
          <p className="text-xs text-slate-500 mt-1">Add your first evaluation parameter using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criteria.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{c.title}</h3>
                  {/* Weight Stars Badge */}
                  <div
                    className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg shrink-0"
                    title={`Weighted factor: ${c.weight} (1-5)`}
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span className="text-xs font-bold text-amber-800">Weight {c.weight}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">{c.description}</p>

                {c.guidance && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-500 mb-2">
                    <strong className="text-slate-700 block mb-0.5">Inspector Guidance:</strong>
                    <span>{c.guidance}</span>
                  </div>
                )}

                {c.standardReference && (
                  <p className="text-[10px] text-slate-400">
                    Ref: <span className="font-medium text-slate-600">{c.standardReference}</span>
                  </p>
                )}
              </div>

              {isAdmin && (
                <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Criteria Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingCriteria ? 'Edit Inspection Standard' : 'Add New Inspection Standard'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  placeholder="e.g. Color-Coded Source Waste Segregation"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Weight Factor (1 to 5) *</label>
                  <select
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-amber-700"
                  >
                    <option value="1">Weight 1 (Low Impact)</option>
                    <option value="2">Weight 2 (Moderate)</option>
                    <option value="3">Weight 3 (Standard)</option>
                    <option value="4">Weight 4 (High Impact)</option>
                    <option value="5">Weight 5 (Critical Non-Conformance)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Evaluation Description *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  placeholder="Explain exactly what the inspector should examine..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Guidance / Protocol</label>
                <textarea
                  rows={2}
                  value={formData.guidance}
                  onChange={(e) => setFormData({ ...formData, guidance: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  placeholder="Testing steps, check frequency, sample sizes..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Standard / Regulatory Ref</label>
                <input
                  type="text"
                  value={formData.standardReference}
                  onChange={(e) => setFormData({ ...formData, standardReference: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  placeholder="e.g. Solid Waste Management Rules 2016 Rule 4"
                />
              </div>

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
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20"
                >
                  {editingCriteria ? 'Update Standard' : 'Save Standard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
