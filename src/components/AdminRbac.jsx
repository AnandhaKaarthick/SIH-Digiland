import React, { useState } from 'react';
import { 
  Users, 
  ShieldAlert, 
  ToggleLeft, 
  ToggleRight, 
  Check, 
  X, 
  UserPlus, 
  Globe, 
  Server,
  KeyRound
} from 'lucide-react';
import { MOCK_USERS } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

export default function AdminRbac() {
  const { t } = useLanguage();
  const [users, setUsers] = useState(MOCK_USERS);
  const [useMockGovApi, setUseMockGovApi] = useState(true);

  const permissionsMatrix = [
    { permission: "Ingest & Upload Documents", clerk: true, patwari: true, tehsildar: true, citizen: false },
    { permission: "Split-View HITL Verification", clerk: true, patwari: true, tehsildar: true, citizen: false },
    { permission: "ECDSA Digital Sign-Off & Approval", clerk: false, patwari: false, tehsildar: true, citizen: false },
    { permission: "Access Cryptographic Audit Trail", clerk: true, patwari: true, tehsildar: true, citizen: true },
    { permission: "Cadastral GIS Map Lookup", clerk: true, patwari: true, tehsildar: true, citizen: true },
    { permission: "RBAC User & System Configuration", clerk: false, patwari: false, tehsildar: true, citizen: false }
  ];

  return (
    <div className="flex flex-col gap-space-xl max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary">Administrative Controls</span>
          <h1 className="font-heading font-bold text-2xl text-text-primary tracking-tight">{t('nav_admin_rbac')}</h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage user roles, government gateway integration adapters, and administrative permissions.
          </p>
        </div>

        {/* Gov Gateway Toggle */}
        <div className="bg-surface-card p-3 rounded-xl border border-border-structural flex items-center gap-3 shadow-sm">
          <div className="flex flex-col text-right">
            <span className="font-heading text-xs font-semibold text-text-primary">Government API Mode</span>
            <span className="font-mono text-[10px] text-text-secondary">
              {useMockGovApi ? 'Local Mock Adapter (Offline Demo)' : 'API Setu Live Gateway (mTLS)'}
            </span>
          </div>

          <button 
            onClick={() => setUseMockGovApi(!useMockGovApi)}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all flex items-center gap-2 ${
              useMockGovApi ? 'bg-primary-container text-on-primary' : 'bg-status-info text-on-primary'
            }`}
          >
            {useMockGovApi ? <Server className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
            {useMockGovApi ? 'Mock Adapter Active' : 'Live Gateway Active'}
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-structural">
        <div className="flex items-center justify-between pb-space-md border-b border-border-structural mb-4">
          <h3 className="font-heading font-bold text-sm text-text-primary flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Active Revenue Department Users
          </h3>
          <button className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-heading text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1">
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-structural bg-surface-container-low text-text-secondary font-heading uppercase text-[10px] tracking-wider">
                <th className="p-3">User Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3">District Scope</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-structural/60 font-body">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container-low/50">
                  <td className="p-3 flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                    <span className="font-heading font-semibold text-text-primary">{u.name}</span>
                  </td>
                  <td className="p-3 font-mono text-text-secondary">{u.email}</td>
                  <td className="p-3">
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-primary-container text-on-primary uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-text-secondary">{u.district}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-status-success/10 text-status-success">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Matrix Grid */}
      <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-structural">
        <h3 className="font-heading font-bold text-sm text-text-primary pb-space-md border-b border-border-structural mb-4 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-secondary" /> Role-Based Access Control (RBAC) Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-structural bg-surface-container-low text-text-secondary font-heading uppercase text-[10px] tracking-wider">
                <th className="p-3">Permission Scope</th>
                <th className="p-3 text-center">Clerk</th>
                <th className="p-3 text-center">Patwari</th>
                <th className="p-3 text-center">Tehsildar / Admin</th>
                <th className="p-3 text-center">Citizen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-structural/60 font-body">
              {permissionsMatrix.map((p, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/50">
                  <td className="p-3 font-heading font-semibold text-text-primary">{p.permission}</td>
                  <td className="p-3 text-center">
                    {p.clerk ? <Check className="w-4 h-4 text-status-success inline" /> : <X className="w-4 h-4 text-status-error opacity-40 inline" />}
                  </td>
                  <td className="p-3 text-center">
                    {p.patwari ? <Check className="w-4 h-4 text-status-success inline" /> : <X className="w-4 h-4 text-status-error opacity-40 inline" />}
                  </td>
                  <td className="p-3 text-center">
                    {p.tehsildar ? <Check className="w-4 h-4 text-status-success inline" /> : <X className="w-4 h-4 text-status-error opacity-40 inline" />}
                  </td>
                  <td className="p-3 text-center">
                    {p.citizen ? <Check className="w-4 h-4 text-status-success inline" /> : <X className="w-4 h-4 text-status-error opacity-40 inline" />}
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
