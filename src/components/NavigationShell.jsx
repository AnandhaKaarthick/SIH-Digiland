import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  CheckSquare, 
  Folder, 
  Map, 
  Shield,
  ShieldCheck,
  Search,
  Bell,
  X,
  Globe,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  LogOut,
  UserCheck
} from 'lucide-react';
import { MOCK_USERS } from '../data/mockData';
import { useTranslation } from '../context/LanguageContext';

export default function NavigationShell({ 
  currentTab, 
  setCurrentTab, 
  activeRole, 
  setActiveRole, 
  currentUser,
  onLogout,
  children,
  searchQuery,
  setSearchQuery
}) {
  const activeUser = currentUser || MOCK_USERS.find(u => u.role === activeRole) || MOCK_USERS[0];
  const { activeLang, setActiveLang, currentLangObj, languages, t } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allNavItems = [
    { id: 'dashboard', label: t('nav_dashboard', 'Dashboard'), icon: LayoutDashboard, badge: null, roles: ['clerk', 'patwari', 'tehsildar', 'citizen'] },
    { id: 'document-upload', label: t('nav_document_upload', 'Document Upload'), icon: Upload, badge: null, roles: ['clerk', 'patwari', 'tehsildar'] },
    { id: 'verification-queue', label: t('nav_verification_queue', 'Verification Queue'), icon: CheckSquare, badge: '14', roles: ['clerk', 'patwari', 'tehsildar'] },
    { id: 'records', label: t('nav_records_registry', 'Records Registry'), icon: Folder, badge: null, roles: ['clerk', 'patwari', 'tehsildar', 'citizen'] },
    { id: 'audit-logs', label: t('nav_audit_logs', 'Audit & Ingestion Logs'), icon: ShieldCheck, badge: null, roles: ['clerk', 'patwari', 'tehsildar', 'citizen'] },
    { id: 'gis-map', label: t('nav_gis_map', 'GIS Cadastral Map'), icon: Map, badge: null, roles: ['clerk', 'patwari', 'tehsildar', 'citizen'] },
    { id: 'admin-rbac', label: t('nav_admin_rbac', 'Admin & RBAC'), icon: Shield, badge: null, roles: ['tehsildar'] },
  ];

  const currentRole = activeUser?.role || activeRole || 'tehsildar';
  const navItems = allNavItems.filter(item => item.roles.includes(currentRole));

  return (
    <div className="min-h-screen bg-canvas-bg font-body text-text-primary flex">
      {/* Fixed Left Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-sidebar-width bg-surface-card shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between border-r border-border-structural">
        <div className="flex flex-col">
          {/* Logo & Brand Anchor */}
          <div className="p-space-base flex items-center gap-space-sm bg-surface-container-lowest border-b border-border-structural/50">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary font-heading font-bold text-lg shadow-sm">
              DL
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-headline-sm text-primary leading-tight">DigiLand</span>
              <span className="font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider leading-tight">GovTech Platform</span>
            </div>
          </div>

          <div className="px-space-base py-space-xs mt-3 flex items-center justify-between">
            <span className="font-heading text-[10px] uppercase tracking-wider text-text-secondary font-semibold opacity-70">Navigation</span>
            <span className="font-mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              {currentRole}
            </span>
          </div>

          {/* Navigation Links (Filtered strictly by RBAC matrix) */}
          <nav className="flex flex-col px-space-sm gap-space-2xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-all duration-150 text-left ${
                    isActive 
                      ? 'bg-primary-container text-on-primary font-heading font-semibold shadow-sm' 
                      : 'text-text-secondary hover:bg-surface-container hover:text-text-primary'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-on-primary' : 'text-text-secondary'}`} />
                  <span className="text-xs font-medium flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-surface-card/20 text-on-primary' : 'bg-surface-container-high text-text-primary'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer System Badge */}
        <div className="p-space-base bg-surface-container-low m-space-sm rounded-xl border border-border-structural/60">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-status-success"></span>
            <span className="font-heading text-[11px] text-primary font-semibold">{t('pipeline_verified', 'DILRMP Pipeline Verified')}</span>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="pl-sidebar-width flex flex-col flex-1 min-h-screen">
        {/* Fixed Top Bar */}
        <header className="fixed top-0 left-sidebar-width right-0 h-topbar-height bg-surface-card/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-xl gap-space-lg border-b border-border-structural/60">
          {/* Search Bar */}
          <div className="flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder', 'Search by Khasra, Khata, ULPIN, Owner, Village...')}
                className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-canvas-bg font-body text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-container border border-border-structural/60 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-0.5 rounded-full hover:bg-surface-container transition-colors"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Header Actions, Custom Language Selector & User Switcher */}
          <div className="flex items-center gap-space-md">
            
            {/* SLEEK CUSTOM UI LANGUAGE SELECTOR DROPDOWN */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shadow-sm ${
                  isLangOpen 
                    ? 'border-primary bg-primary-container/10 ring-2 ring-primary/20' 
                    : 'border-border-structural bg-surface-card hover:bg-surface-container text-text-primary'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-primary-container/20 flex items-center justify-center text-primary flex-shrink-0">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-xs font-bold text-text-primary">
                    {currentLangObj?.nativeName || 'English'}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-white bg-primary px-1.5 py-0.5 rounded shadow-xs tracking-wider">
                    {activeLang.toUpperCase()}
                  </span>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-200 ${isLangOpen ? 'rotate-180 text-primary' : ''}`} />
              </button>

              {/* Floating Custom Dropdown Popover */}
              {isLangOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-surface-card rounded-2xl border border-border-structural shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-border-structural/60 mb-1 flex items-center justify-between">
                    <span className="font-heading text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-primary" /> Select Language
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-text-secondary font-semibold">
                      10 Indic Scripts
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {languages.map((l) => {
                      const isSelected = activeLang === l.code;
                      return (
                        <button
                          key={l.code}
                          onClick={() => {
                            setActiveLang(l.code);
                            setIsLangOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between group ${
                            isSelected 
                              ? 'bg-primary text-on-primary font-semibold shadow-sm' 
                              : 'hover:bg-surface-container text-text-primary'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className={`font-heading text-xs font-bold ${isSelected ? 'text-on-primary' : 'text-text-primary'}`}>
                              {l.nativeName}
                            </span>
                            <span className={`text-[10px] ${isSelected ? 'opacity-90 text-on-primary' : 'text-text-secondary'}`}>
                              {l.name} • <span className="font-mono">{l.script}</span> {l.dir === 'rtl' ? '(RTL)' : ''}
                            </span>
                          </div>

                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-on-primary flex-shrink-0" />
                          ) : (
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-card text-text-secondary border border-border-structural/60 opacity-0 group-hover:opacity-100 transition-opacity">
                              {l.code.toUpperCase()}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low text-primary border border-border-structural/50">
              <span className="w-2 h-2 rounded-full bg-status-success"></span>
              <span className="font-mono text-xs font-semibold">{t('gov_gateway_active', 'Gov Gateway Active')}</span>
            </div>

            {/* Role Switcher & User Profile */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right">
                <span className="font-heading text-xs font-semibold text-text-primary leading-tight">{activeUser.name}</span>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <select
                    value={activeRole}
                    onChange={(e) => setActiveRole(e.target.value)}
                    className="font-heading text-[10px] font-semibold bg-primary-container text-on-primary rounded px-2 py-0.5 cursor-pointer focus:outline-none shadow-sm"
                  >
                    <option value="tehsildar">Tehsildar / Admin</option>
                    <option value="patwari">Patwari / Verification</option>
                    <option value="clerk">Data Entry Clerk</option>
                    <option value="citizen">Citizen (Read-Only)</option>
                  </select>
                </div>
              </div>
              <img 
                src={activeUser.avatar} 
                alt={activeUser.name} 
                style={{ width: '34px', height: '34px' }}
                className="w-8.5 h-8.5 rounded-full object-cover shadow-sm border border-border-structural flex-shrink-0" 
              />
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-text-secondary hover:bg-status-error/10 hover:text-status-error transition-colors border border-border-structural/60"
                  title="Sign out of DigiLand"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="w-full pt-topbar-height bg-canvas-bg flex-1 p-space-xl">
          {children}
        </main>
      </div>
    </div>
  );
}
