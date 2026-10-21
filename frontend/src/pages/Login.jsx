import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  Leaf,
  Award,
  Globe2,
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError('Please provide both official email and security password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please verify your official credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Left Column: Institutional Hero Section (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 lg:p-16 bg-gradient-to-br from-slate-950 via-emerald-950/60 to-slate-900 border-r border-slate-800/80 overflow-hidden">
        {/* Subtle Ambient Backdrops */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 p-0.5 shadow-xl shadow-emerald-950">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Leaf className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">SWACHHTA & GREEN</span>
                <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">National Institutional Compliance & Audit Framework</p>
            </div>
          </div>
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ISO 14001 & NBC Green Building Aligned</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Institutional Environmental Compliance & Facility Auditing.
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Standardized multi-criteria evaluation platform governing institutional cleanliness, source waste segregation, water stewardship, energy optimization, and ambient air safety.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Weighted Scoring</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Dynamic mathematical formula with 1-5 parameter weighting and real-time tier classification.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>Facility Hierarchy</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Multi-wing building mapping, dedicated floor plans, and comprehensive zone-level auditing.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Compliance Trust Seal */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-emerald-500" />
            <span>Official Institutional Network</span>
          </div>
          <span>Secure Audit Log v2.4</span>
        </div>
      </div>

      {/* Right Column: Clean Enterprise Sign In Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-900/40">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Brand Icon (only visible on small screens) */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-lg">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white">Swachhta & Green Standards</span>
              <p className="text-xs text-slate-400">Institutional Compliance Portal</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Enter your authorized institutional credentials to access the audit dashboard.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3">
              <span className="font-bold text-red-500 shrink-0">Security Notice:</span>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Official Email Address
              </label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="name@swachhta.gov.in"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Security Password
                </label>
                <a
                  href="#assistance"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('For credential recovery or institutional access, please contact your System Administrator or Estate Officer.');
                  }}
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-11 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500 focus:ring-offset-slate-950"
                />
                <span className="text-xs text-slate-400">Remember this workstation</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-emerald-500 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Authorization...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Compliance Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Institutional Compliance Notice */}
          <div className="pt-6 border-t border-slate-800 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Protected by 256-bit TLS Encryption & RBAC Middleware</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Unauthorized access or inspection tampering is strictly audited and subject to statutory penalties under institutional regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
