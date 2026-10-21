import React, { useState, useEffect } from 'react';
import { buildingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScoreBadge from '../components/ScoreBadge';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Layers,
  MapPin,
  User,
  X,
  PlusCircle,
  Tag,
} from 'lucide-react';

export default function Buildings() {
  const { isAdmin } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    block: '',
    campus: 'North Campus',
    totalFloors: 3,
    squareFootage: 25000,
    contactPerson: { name: '', email: '', phone: '' },
    zones: [
      { name: 'Ground Floor Restrooms', type: 'RESTROOM', floor: 'Ground' },
      { name: 'Main Lobby & Corridors', type: 'CORRIDOR', floor: 'Ground' },
    ],
  });
  const [zoneInput, setZoneInput] = useState({ name: '', type: 'COMMON_AREA', floor: 'Ground' });

  useEffect(() => {
    loadBuildings();
  }, [search, selectedBlock]);

  const loadBuildings = async () => {
    try {
      setLoading(true);
      const res = await buildingApi.getAll({ search, block: selectedBlock });
      if (res.data.success) {
        setBuildings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load buildings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingBuilding(null);
    setFormData({
      name: '',
      code: '',
      block: 'Block A',
      campus: 'North Campus',
      totalFloors: 3,
      squareFootage: 25000,
      contactPerson: { name: '', email: '', phone: '' },
      zones: [
        { name: 'Ground Floor Restrooms', type: 'RESTROOM', floor: 'Ground' },
        { name: 'Main Corridors', type: 'CORRIDOR', floor: 'All Floors' },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBuilding(b);
    setFormData({
      name: b.name,
      code: b.code,
      block: b.block,
      campus: b.campus || 'North Campus',
      totalFloors: b.totalFloors || 1,
      squareFootage: b.squareFootage || 10000,
      contactPerson: b.contactPerson || { name: '', email: '', phone: '' },
      zones: b.zones || [],
    });
    setIsModalOpen(true);
  };

  const handleAddZone = () => {
    if (!zoneInput.name.trim()) return;
    setFormData({
      ...formData,
      zones: [...formData.zones, { ...zoneInput }],
    });
    setZoneInput({ name: '', type: 'COMMON_AREA', floor: 'Ground' });
  };

  const handleRemoveZone = (index) => {
    setFormData({
      ...formData,
      zones: formData.zones.filter((_, idx) => idx !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBuilding) {
        await buildingApi.update(editingBuilding._id, formData);
      } else {
        await buildingApi.create(formData);
      }
      setIsModalOpen(false);
      loadBuildings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save building');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this building record?')) return;
    try {
      await buildingApi.delete(id);
      loadBuildings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete building');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600" />
            <span>Building & Facility Management</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Configure institutional blocks, floors, square footage, and inspection zones.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Building</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by building name, code (e.g., AAB-01), or block..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Blocks</option>
            <option value="Block A">Block A</option>
            <option value="Block B">Block B</option>
            <option value="Block C">Block C</option>
            <option value="Block D">Block D</option>
            <option value="Block E">Block E</option>
          </select>
        </div>
      </div>

      {/* Building Cards Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-slate-400 text-xs">Loading facilities...</p>
        </div>
      ) : buildings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No Buildings Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or add a new building.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {buildings.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {b.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1.5 leading-snug">{b.name}</h3>
                    <p className="text-xs text-slate-500">{b.campus} • {b.block}</p>
                  </div>
                  <ScoreBadge score={b.lastComplianceScore} size="sm" />
                </div>

                {/* Specs Box */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Floors</span>
                    <span className="font-bold text-slate-800">{b.totalFloors} Floors (G+{b.totalFloors - 1})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Total Footprint</span>
                    <span className="font-bold text-slate-800">{b.squareFootage?.toLocaleString()} sq.ft</span>
                  </div>
                </div>

                {/* Zones List */}
                <div className="mb-4">
                  <p className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Configured Zones ({b.zones?.length || 0})</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                    {b.zones?.map((zone, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        {zone.name} ({zone.floor})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                {b.contactPerson?.name && (
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>In-charge: <strong className="text-slate-700">{b.contactPerson.name}</strong></span>
                  </div>
                )}
              </div>

              {/* Action Buttons for Admin */}
              {isAdmin && (
                <div className="flex justify-end gap-2 pt-4 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs flex items-center gap-1 transition-colors"
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

      {/* Add / Edit Building Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingBuilding ? 'Edit Building Profile' : 'Add New Building Facility'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Building Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="e.g. Science & Biotech Block"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase"
                    placeholder="e.g. SBB-01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Block/Wing *</label>
                  <input
                    type="text"
                    required
                    value={formData.block}
                    onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="Block A"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Floors *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalFloors}
                    onChange={(e) => setFormData({ ...formData, totalFloors: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Area (sq.ft) *</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={formData.squareFootage}
                    onChange={(e) => setFormData({ ...formData, squareFootage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Zones Section */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-2">Audit Zones</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Zone name (e.g., Chemistry Lab)"
                    value={zoneInput.name}
                    onChange={(e) => setZoneInput({ ...zoneInput, name: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <select
                    value={zoneInput.type}
                    onChange={(e) => setZoneInput({ ...zoneInput, type: e.target.value })}
                    className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="RESTROOM">Restroom</option>
                    <option value="CAFETERIA">Cafeteria</option>
                    <option value="CORRIDOR">Corridor</option>
                    <option value="LABORATORY">Laboratory</option>
                    <option value="SOLAR_ROOFTOP">Solar Rooftop</option>
                    <option value="WASTE_YARD">Waste Yard</option>
                    <option value="COMMON_AREA">Common Area</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddZone}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
                  {formData.zones.map((z, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700"
                    >
                      <span>{z.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveZone(idx)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Person */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Facility In-charge Name</label>
                  <input
                    type="text"
                    value={formData.contactPerson.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactPerson: { ...formData.contactPerson, name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="e.g. Officer Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contactPerson.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactPerson: { ...formData.contactPerson, phone: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="+91 99999 00000"
                  />
                </div>
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
                  {editingBuilding ? 'Update Facility' : 'Save Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
