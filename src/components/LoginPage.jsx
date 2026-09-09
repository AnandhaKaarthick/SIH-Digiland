import React, { useState } from 'react';
import { Shield, Lock, User, Key, CheckCircle2, ChevronRight, Sparkles, Building2, Eye, EyeOff } from 'lucide-react';
import { MOCK_USERS } from '../data/mockData';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('rajesh.sharma@rev.gov.in');
  const [password, setPassword] = useState('tehsildar123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPresetRole, setSelectedPresetRole] = useState('tehsildar');
  const [errorMsg, setErrorMsg] = useState('');

  const rolePresets = [
    {
      id: 'tehsildar',
      title: 'Tehsildar / Admin',
      subtitle: 'Full Access + ECDSA Digital Sign-Off',
      user: MOCK_USERS.find(u => u.role === 'tehsildar') || MOCK_USERS[0],
      badgeClass: 'bg-primary/10 text-primary border-primary/20',
      icon: Shield
    },
    {
      id: 'patwari',
      title: 'Patwari (Field Revenue Officer)',
      subtitle: 'Document Intake + HITL Verification',
      user: MOCK_USERS.find(u => u.role === 'patwari') || MOCK_USERS[1],
      badgeClass: 'bg-status-warning/10 text-status-warning border-status-warning/20',
      icon: User
    },
    {
      id: 'clerk',
      title: 'Revenue Clerk',
      subtitle: 'Intake & Verification Review',
      user: MOCK_USERS.find(u => u.role === 'clerk') || MOCK_USERS[2],
      badgeClass: 'bg-status-success/10 text-status-success border-status-success/20',
      icon: Key
    },
    {
      id: 'citizen',
      title: 'Citizen Public Access',
      subtitle: 'Registry Lookup & Audit Ledger View',
      user: MOCK_USERS.find(u => u.role === 'citizen') || MOCK_USERS[3],
      badgeClass: 'bg-surface-container-high text-text-secondary border-border-structural',
      icon: User
    }
  ];

  const handleSelectPreset = (preset) => {
    setSelectedPresetRole(preset.id);
    setUsername(preset.user.email);
    setPassword(`${preset.id}123`);
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !username.trim()) {
      setErrorMsg('Please enter a valid government email / username');
      return;
    }

    const matchedUser = MOCK_USERS.find(u => 
      u.email.toLowerCase() === username.trim().toLowerCase() ||
      u.role === selectedPresetRole
    ) || rolePresets.find(p => p.id === selectedPresetRole)?.user || MOCK_USERS[0];

    onLogin && onLogin(matchedUser);
  };

  return (
    <div className="min-h-screen w-full bg-canvas-bg flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-body">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-surface-card rounded-2xl border border-border-structural shadow-2xl overflow-hidden z-10">
        
        {/* Left Side: Brand Anchor & Gov Gateway Information */}
        <div className="bg-primary p-8 text-on-primary flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-heading font-bold text-xl text-white border border-white/20 shadow-inner">
                DL
              </div>
              <div>
                <h1 className="font-heading font-bold text-xl text-white leading-tight">DigiLand</h1>
                <p className="font-heading text-[10px] font-semibold text-white/80 uppercase tracking-widest">GovTech Land Platform</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-white/10 border border-white/20 text-white/90">
                🔐 Role-Based Access Control (RBAC)
              </span>
              <h2 className="font-heading font-bold text-2xl text-white leading-snug">
                Unified Indian Land Revenue Portal
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                Secure access gateway supporting DILRMP land registry records, PaddleOCR FMB map extraction, SHA-256 immutable audit chains, and Ed25519 officer digital sign-off.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3 pt-6 border-t border-white/10 text-xs text-white/90 font-sans">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <span>Multi-Role Access Control (Tehsildar, Patwari, Clerk, Citizen)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <span>Ed25519 Cryptographic Signatures</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <span>Bhu-Aadhaar ULPIN Cadastral Integration</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form & Preset Role Switcher */}
        <div className="p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg text-text-primary">Sign In to Platform</h3>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-status-success/10 text-status-success border border-status-success/20">
                Gov Gateway Active
              </span>
            </div>

            {/* Quick Demo Preset Selection Pills */}
            <div className="mb-6">
              <label className="font-heading text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-2">
                Select Login Role Preset:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {rolePresets.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedPresetRole === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        isSelected 
                          ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                          : 'bg-canvas-bg border-border-structural/80 text-text-secondary hover:border-text-secondary'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-xs font-bold truncate text-text-primary">{preset.title}</span>
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-text-secondary'}`} />
                      </div>
                      <span className="text-[10px] text-text-secondary truncate">{preset.subtitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-xs font-heading font-semibold">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="font-heading text-xs font-semibold text-text-primary block mb-1">
                  Government Email / User ID
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-canvas-bg font-body text-xs text-text-primary border border-border-structural focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                    placeholder="officer@rev.gov.in"
                  />
                </div>
              </div>

              <div>
                <label className="font-heading text-xs font-semibold text-text-primary block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-canvas-bg font-body text-xs text-text-primary border border-border-structural focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-heading text-xs font-bold hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                Authenticate & Access Dashboard <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-border-structural/60 text-center">
            <span className="text-[10px] text-text-secondary font-mono">
              DigiLand Security Framework v2026.1 • SHA-256 Audit Sealed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
