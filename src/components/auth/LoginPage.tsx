import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, GraduationCap, Lock, User as UserIcon, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) {
      setError('Please enter both User ID and Password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await login(userId.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (id: string, pass: string) => {
    setUserId(id);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner / Header */}
      <div className="w-full max-w-md text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/25 ring-4 ring-indigo-500/20 mb-4">
          <GraduationCap size={36} />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          COLLEGE ASSIGNMENT TRACKER
        </h1>
        <p className="mt-2 text-sm text-indigo-200">
          Official Academic Portal for Students & Faculty
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 sm:p-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Role-based access is automatically determined by your college ID.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              User ID
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserIcon size={18} />
              </div>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. STU001 or LEC001"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm font-medium transition"
              />
            </div>
          </div>

          {/* Password with Eye Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm font-medium transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Panel */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            <ShieldCheck size={14} className="text-indigo-600" />
            <span>One-Click Demo Credentials</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Student Demo Button */}
            <button
              type="button"
              onClick={() => handleFillDemo('STU001', 'student123')}
              className="p-3 text-left rounded-xl border border-indigo-100 bg-indigo-50/70 hover:bg-indigo-100/80 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-indigo-900 group-hover:text-indigo-700">
                  Student
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-200/70 text-indigo-800 font-mono">
                  STU001
                </span>
              </div>
              <div className="text-[11px] text-slate-600 font-medium">Anu Naik</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">student123</div>
            </button>

            {/* Lecturer Demo Button */}
            <button
              type="button"
              onClick={() => handleFillDemo('LEC001', 'lecturer123')}
              className="p-3 text-left rounded-xl border border-emerald-100 bg-emerald-50/70 hover:bg-emerald-100/80 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-900 group-hover:text-emerald-700">
                  Lecturer
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200/70 text-emerald-800 font-mono">
                  LEC001
                </span>
              </div>
              <div className="text-[11px] text-slate-600 font-medium">Dr. Priya Sharma</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">lecturer123</div>
            </button>
          </div>

          <div className="mt-3 text-center">
            <span className="text-[11px] text-slate-500">
              Other demo users: <span className="font-mono text-slate-700">STU002</span> (Rahul), <span className="font-mono text-slate-700">STU003</span> (Sneha)
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-slate-400">
        <span>College Assignment Tracker • Protected Institutional Academic System</span>
      </div>
    </div>
  );
};
