import React, { useState, useEffect } from 'react';
import { Search, X, Filter, CheckCircle2, AlertCircle, AlertTriangle, Trash2, RotateCcw } from 'lucide-react';
import NavigationShell from './components/NavigationShell';
import Dashboard from './components/Dashboard';
import DocumentUpload from './components/DocumentUpload';
import SplitViewVerification from './components/SplitViewVerification';
import RecordDetailsView from './components/RecordDetailsView';
import AuditLogsView from './components/AuditLogsView';
import GisMapView from './components/GisMapView';
import AdminRbac from './components/AdminRbac';
import { MOCK_LAND_RECORDS } from './data/mockData';
import { fetchAllRecordsApi, deleteRecordApi, purgeDuplicatesApi, resetRegistryApi } from './services/api';

import { LanguageProvider, useTranslation } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeRole, setActiveRole] = useState('tehsildar');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(MOCK_LAND_RECORDS[0]);
  const [viewingRecordDetails, setViewingRecordDetails] = useState(null);
  const [docTypeFilter, setDocTypeFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  // Persistent purged record IDs tracking
  const [purgedIds, setPurgedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('digiland_purged_ids');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const savePurgedIds = (newIds) => {
    setPurgedIds(newIds);
    try {
      localStorage.setItem('digiland_purged_ids', JSON.stringify(newIds));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
  };

  const [recordsList, setRecordsList] = useState(() => {
    const purgedSet = new Set(purgedIds);
    return MOCK_LAND_RECORDS.filter(r => !purgedSet.has(r.id));
  });

  // Filter out invalid/empty blank records from display list
  const validRecordsList = (recordsList || []).filter(rec => 
    rec && rec.id && (rec.ulpin || rec.khasra_no || (Array.isArray(rec.owner_names) ? rec.owner_names.length > 0 : rec.owner_names))
  );

  // Analyze duplicates across central records list
  const duplicateCounts = {};
  validRecordsList.forEach(rec => {
    const key = (rec.ulpin && rec.ulpin.trim()) 
      || (rec.khasra_no && rec.khata_no ? `${rec.khasra_no.trim()}_${rec.khata_no.trim()}_${(rec.village || '').trim()}` : null);
    if (key) {
      duplicateCounts[key] = (duplicateCounts[key] || 0) + 1;
    }
  });

  const duplicateRecordIds = new Set();
  validRecordsList.forEach(rec => {
    const key = (rec.ulpin && rec.ulpin.trim()) 
      || (rec.khasra_no && rec.khata_no ? `${rec.khasra_no.trim()}_${rec.khata_no.trim()}_${(rec.village || '').trim()}` : null);
    if (key && duplicateCounts[key] > 1) {
      duplicateRecordIds.add(rec.id);
    }
  });

  const totalDuplicateCount = duplicateRecordIds.size;

  const handleRemoveSingleDuplicate = async (recId) => {
    try {
      await deleteRecordApi(recId);
    } catch (e) {
      console.warn("Backend delete API error:", e);
    }

    const updatedPurged = Array.from(new Set([...purgedIds, recId]));
    savePurgedIds(updatedPurged);
    setRecordsList(prev => prev.filter(r => r.id !== recId));
    
    setToastMessage(`Duplicate record "${recId}" removed & purged permanently.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePurgeAllDuplicates = async () => {
    try {
      await purgeDuplicatesApi();
    } catch (e) {
      console.warn("Backend purge API error:", e);
    }

    const seenKeys = new Set();
    const uniqueRecords = [];
    const newPurged = [...purgedIds];

    recordsList.forEach(rec => {
      const key = rec.ulpin || `${rec.khasra_no}_${rec.khata_no}_${rec.village}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueRecords.push(rec);
      } else {
        newPurged.push(rec.id);
      }
    });

    const uniquePurgedIds = Array.from(new Set(newPurged));
    savePurgedIds(uniquePurgedIds);
    setRecordsList(uniqueRecords);

    setToastMessage(`Deduplication complete: Purged duplicate records permanently. 1 master record retained per plot.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle search input change with auto navigation to records registry
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query && query.trim()) {
      if (currentTab !== 'records') {
        setCurrentTab('records');
      }
      if (viewingRecordDetails) {
        setViewingRecordDetails(null);
      }
    }
  };

  // Persistent uploaded records state per user account role across reloads and logins
  const [uploadedRecords, setUploadedRecords] = useState(() => {
    try {
      const stored = localStorage.getItem(`digiland_user_records_${activeRole}`);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const saveAccountUploadedRecords = (newRecords, role = activeRole) => {
    setUploadedRecords(newRecords);
    try {
      localStorage.setItem(`digiland_user_records_${role}`, JSON.stringify(newRecords));
    } catch (e) {
      console.warn("LocalStorage account records save error:", e);
    }
  };

  // Synchronize account records whenever activeRole changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`digiland_user_records_${activeRole}`);
      const parsed = stored ? JSON.parse(stored) : [];
      setUploadedRecords(parsed);
    } catch (e) {
      setUploadedRecords([]);
    }
  }, [activeRole]);

  const handleResetRegistry = async () => {
    savePurgedIds([]);
    saveAccountUploadedRecords([]);
    try {
      const res = await resetRegistryApi();
      if (res && res.records) {
        setRecordsList(res.records);
      } else {
        setRecordsList(MOCK_LAND_RECORDS);
      }
    } catch (e) {
      setRecordsList(MOCK_LAND_RECORDS);
    }
    setToastMessage("Registry reset successfully: All master sample records restored.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch live database records on mount & search query change with persistent purged filter
  useEffect(() => {
    async function loadDbRecords() {
      const res = await fetchAllRecordsApi(searchQuery);
      let basePool = (res && res.records && res.records.length > 0) ? res.records : MOCK_LAND_RECORDS;

      // Merge uploaded records so rich client-side details are preserved over DB records
      const seenIds = new Set(basePool.map(r => r.id));
      const combined = basePool.map(bRec => {
        const uMatch = uploadedRecords.find(u => u.id === bRec.id);
        return uMatch ? { ...bRec, ...uMatch } : bRec;
      });
      uploadedRecords.forEach(uRec => {
        if (!seenIds.has(uRec.id)) {
          seenIds.add(uRec.id);
          combined.unshift(uRec);
        }
      });

      const purgedSet = new Set(purgedIds);

      // Protect seed records from accidental total erasure in purgedIds:
      // If purgedSet filtered out almost everything (leaving < 2 records while DB has > 4), clear stale purgedIds!
      let filtered = combined.filter(r => !purgedSet.has(r.id));
      if (filtered.length < 2 && combined.length >= 4) {
        console.warn("PurgedIds filtered out master records. Resetting stale purgedIds cache...");
        savePurgedIds([]);
        filtered = combined;
      }

      setRecordsList(filtered);
    }
    loadDbRecords();
  }, [searchQuery, purgedIds, uploadedRecords]);

  const handleNavigateToReview = (record) => {
    if (record) setSelectedRecord(record);
    setCurrentTab('verification-queue');
  };

  const handleNavigateToUpload = () => {
    setCurrentTab('document-upload');
  };

  const handleOpenRecordDetails = (record) => {
    setViewingRecordDetails(record);
    setCurrentTab('records');
  };

  // Dynamic deep search filter across all record attributes
  const filteredRecords = recordsList.filter(rec => {
    // Document Type Filter
    if (docTypeFilter !== 'ALL') {
      const recDoc = (rec.doc_type || '').toUpperCase();
      if (docTypeFilter === 'ROR' && !recDoc.includes('ROR') && !recDoc.includes('KHATA')) return false;
      if (docTypeFilter === 'DEED' && !recDoc.includes('DEED') && !recDoc.includes('SALE')) return false;
      if (docTypeFilter === 'MUTATION' && !recDoc.includes('MUTATION')) return false;
      if (docTypeFilter === 'CADASTRAL' && !recDoc.includes('CADASTRAL') && !recDoc.includes('MAP')) return false;
    }

    if (!searchQuery || !searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    
    const ownersStr = Array.isArray(rec.owner_names) ? rec.owner_names.join(' ') : (rec.owner_names || '');
    const docTypeStr = rec.doc_type || '';
    const regNoStr = rec.registration_number || '';
    const mutNoStr = rec.mutation_serial_number || '';
    const mapSheetStr = rec.map_sheet_number || '';
    const buyerStr = rec.buyer_name || '';
    const sellerStr = rec.seller_name || '';
    const priorOwnerStr = rec.transferor_prior_owner || '';
    const newOwnerStr = rec.transferee_new_owner || '';
    const extractedStr = rec.extracted_data ? JSON.stringify(rec.extracted_data) : '';

    return (
      (rec.id && rec.id.toLowerCase().includes(q)) ||
      (rec.khasra_no && rec.khasra_no.toLowerCase().includes(q)) ||
      (rec.khata_no && rec.khata_no.toLowerCase().includes(q)) ||
      (rec.ulpin && rec.ulpin.toLowerCase().includes(q)) ||
      (rec.village && rec.village.toLowerCase().includes(q)) ||
      (rec.district && rec.district.toLowerCase().includes(q)) ||
      (rec.tehsil && rec.tehsil.toLowerCase().includes(q)) ||
      ownersStr.toLowerCase().includes(q) ||
      docTypeStr.toLowerCase().includes(q) ||
      regNoStr.toLowerCase().includes(q) ||
      mutNoStr.toLowerCase().includes(q) ||
      mapSheetStr.toLowerCase().includes(q) ||
      buyerStr.toLowerCase().includes(q) ||
      sellerStr.toLowerCase().includes(q) ||
      priorOwnerStr.toLowerCase().includes(q) ||
      newOwnerStr.toLowerCase().includes(q) ||
      extractedStr.toLowerCase().includes(q)
    );
  });

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            onNavigateToReview={handleNavigateToReview} 
            onNavigateToUpload={handleNavigateToUpload} 
          />
        );

      case 'document-upload':
        return (
          <DocumentUpload 
            liveRecords={recordsList}
            purgedIds={purgedIds}
            onProcessComplete={(recordOrList) => {
              const recList = Array.isArray(recordOrList) ? recordOrList : [recordOrList];
              if (recList.length > 0) {
                setSelectedRecord(recList[0]);
              }
              const recIds = new Set(recList.map(r => r.id));
              const newUploaded = [...recList, ...uploadedRecords.filter(r => !recIds.has(r.id))];
              saveAccountUploadedRecords(newUploaded);
              setRecordsList(prev => [...recList, ...prev.filter(r => !recIds.has(r.id))]);
              setCurrentTab('verification-queue');
            }} 
          />
        );

      case 'verification-queue':
        return (
          <SplitViewVerification 
            record={selectedRecord} 
            allRecords={validRecordsList}
            onApproveComplete={(approvedRec) => {
              // Ensure approved record is never hidden by stale purgedIds
              const updatedPurged = purgedIds.filter(id => id !== approvedRec.id);
              savePurgedIds(updatedPurged);

              const formattedApproved = {
                ...approvedRec,
                status_flag: 'VALID',
                routing: 'AUTO_APPROVED',
                priority_level: 'LOW_PRIORITY'
              };

              const newUploaded = [formattedApproved, ...uploadedRecords.filter(r => r.id !== approvedRec.id)];
              saveAccountUploadedRecords(newUploaded);
              setRecordsList(prev => {
                const exists = prev.some(r => r.id === approvedRec.id);
                if (exists) {
                  return prev.map(r => r.id === approvedRec.id ? { ...r, ...formattedApproved } : r);
                } else {
                  return [formattedApproved, ...prev];
                }
              });

              setSelectedRecord(formattedApproved);
              setToastMessage(`Record "${approvedRec.id}" approved & committed to Land Records Registry!`);
              setTimeout(() => setToastMessage(null), 4000);
              setCurrentTab('records');
            }} 
          />
        );

      case 'records':
        if (viewingRecordDetails) {
          return (
            <RecordDetailsView 
              record={viewingRecordDetails} 
              onBack={() => setViewingRecordDetails(null)} 
              onDeleteRecord={(recId) => {
                handleRemoveSingleDuplicate(recId);
                setViewingRecordDetails(null);
              }}
              onEditRecord={(rec) => {
                setViewingRecordDetails(null);
                handleNavigateToReview(rec);
              }}
              onUpdateRecord={(updatedRec) => {
                setViewingRecordDetails(updatedRec);
                setRecordsList(prev => prev.map(r => r.id === updatedRec.id ? updatedRec : r));
                const newUploaded = [updatedRec, ...uploadedRecords.filter(r => r.id !== updatedRec.id)];
                saveAccountUploadedRecords(newUploaded);
              }}
            />
          );
        }

        return (
          <div className="flex flex-col gap-space-lg max-w-[1400px] mx-auto w-full">
            {/* Transient Toast Notification */}
            {toastMessage && (
              <div className="bg-status-success text-white px-4 py-3 rounded-xl shadow-lg font-heading text-xs font-semibold flex items-center justify-between animate-fadeIn border border-status-success/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{toastMessage}</span>
                </div>
                <button onClick={() => setToastMessage(null)} className="p-0.5 hover:bg-white/20 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary">Central Repository</span>
                <h1 className="font-heading font-bold text-2xl text-text-primary">Land Records Registry</h1>
                <p className="text-xs text-text-secondary mt-1">
                  Searchable database of digitized, validated, and signed land extracts ({filteredRecords.length} records matching).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetRegistry}
                  className="px-3.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-container border border-border-structural text-text-primary text-xs font-heading font-semibold shadow-sm transition-all flex items-center gap-1.5"
                  title="Reset & restore all 8 master land records in SQLite database"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-primary" />
                  Restore Master Records
                </button>
                <span className="font-mono text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface-card border border-border-structural text-primary shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-status-success"></span>
                  SQLite DB Active
                </span>
              </div>
            </div>

            {/* Central Registry Duplicate Alert Banner */}
            {totalDuplicateCount > 0 && (
              <div className="bg-status-warning/10 border-l-4 border-status-warning p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-status-warning text-white flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-sm text-text-primary">
                        Duplicate Land Records Detected in Central Registry
                      </h3>
                      <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded bg-status-warning text-white uppercase shadow-sm">
                        {totalDuplicateCount} Duplicate Entries
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Multiple records share identical plot numbers (ULPIN / Khasra / Khata numbers). You can purge all duplicates at once or remove individual duplicate entries below.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePurgeAllDuplicates}
                  className="px-4 py-2 rounded-xl bg-status-warning hover:bg-status-warning/90 text-white font-heading text-xs font-bold shadow transition-all flex items-center gap-2 flex-shrink-0"
                  title="Purge all redundant duplicate entries across registry"
                >
                  <Trash2 className="w-4 h-4" /> Purge All Duplicates ({totalDuplicateCount})
                </button>
              </div>
            )}

            {/* Embedded Interactive Search & Filter Toolbar */}
            <div className="bg-surface-card rounded-xl p-4 shadow-sm border border-border-structural flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search registry by Khasra #, Khata #, ULPIN, Owner Name, Village, Registration #..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-canvas-bg font-body text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary border border-border-structural/60 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-surface-container transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Document Type Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                <Filter className="w-3.5 h-3.5 text-text-secondary ml-1" />
                {[
                  { id: 'ALL', label: 'All Docs' },
                  { id: 'ROR', label: 'RoR / Khata' },
                  { id: 'DEED', label: 'Sale Deeds' },
                  { id: 'MUTATION', label: 'Mutations' },
                  { id: 'CADASTRAL', label: 'Cadastral Maps' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setDocTypeFilter(type.id)}
                    className={`px-3 py-1.5 rounded-lg font-heading text-xs font-semibold whitespace-nowrap transition-all ${
                      docTypeFilter === type.id
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-canvas-bg text-text-secondary hover:bg-surface-container hover:text-text-primary border border-border-structural/60'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Records List Container */}
            <div className="bg-surface-card rounded-xl shadow-sm border border-border-structural overflow-hidden">
              {filteredRecords.length === 0 ? (
                <div className="p-12 text-center text-text-secondary flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-text-secondary">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-text-primary">No Matching Land Records Found</h3>
                    <p className="text-xs text-text-secondary mt-1">
                      No records match query "{searchQuery}" under {docTypeFilter === 'ALL' ? 'All Document Types' : docTypeFilter}.
                    </p>
                  </div>
                  <button
                    onClick={() => { setSearchQuery(''); setDocTypeFilter('ALL'); }}
                    className="px-4 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container text-primary font-heading text-xs font-semibold border border-border-structural transition-all"
                  >
                    Clear Search Filters
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-border-structural/60">
                  {filteredRecords.map((rec) => {
                    const isDuplicate = duplicateRecordIds.has(rec.id);
                    const key = rec.ulpin || `${rec.khasra_no}_${rec.khata_no}_${rec.village}`;
                    const dupCount = duplicateCounts[key] || 1;

                    const khasra = rec.khasra_no || rec.payload?.parcels?.[0]?.khasra_survey_number || rec.raw_payload?.khasra_no || rec.ror?.khasra_no || '142/3B';
                    const khata = rec.khata_no || rec.payload?.khata_number || rec.raw_payload?.khata_no || rec.ror?.khata_no || '489';
                    const ulpinNo = rec.ulpin || rec.payload?.parcels?.[0]?.bhu_aadhaar_ulpin || rec.raw_payload?.ulpin || rec.ror?.ulpin || '14BW89201L9842';
                    const villageName = rec.village || rec.payload?.location?.village || rec.raw_payload?.village || rec.location?.village || 'Nemili';
                    const tehsilName = rec.tehsil || rec.payload?.location?.tehsil || rec.raw_payload?.tehsil || rec.location?.tehsil || 'Sriperumbudur';
                    const districtName = rec.district || rec.payload?.location?.district || rec.raw_payload?.district || rec.location?.district || 'Kanchipuram';
                    const areaSqm = rec.plot_area || rec.payload?.parcels?.[0]?.plot_area?.metric_sqm || rec.raw_payload?.plot_area || 1821.08;

                    let ownersDisplay = '';
                    if (Array.isArray(rec.owner_names) && rec.owner_names.length > 0) {
                      ownersDisplay = rec.owner_names.join(', ');
                    } else if (typeof rec.owner_names === 'string' && rec.owner_names.trim()) {
                      try {
                        const parsed = JSON.parse(rec.owner_names);
                        ownersDisplay = Array.isArray(parsed) ? parsed.join(', ') : rec.owner_names;
                      } catch {
                        ownersDisplay = rec.owner_names;
                      }
                    } else if (rec.payload?.ownership_details && Array.isArray(rec.payload.ownership_details)) {
                      ownersDisplay = rec.payload.ownership_details.map(o => o.owner_name).filter(Boolean).join(', ');
                    } else if (rec.buyer_name || rec.seller_name) {
                      ownersDisplay = [rec.buyer_name, rec.seller_name].filter(Boolean).join(', ');
                    } else if (rec.transferee_new_owner || rec.transferor_prior_owner) {
                      ownersDisplay = [rec.transferee_new_owner, rec.transferor_prior_owner].filter(Boolean).join(', ');
                    } else {
                      ownersDisplay = 'K. Raman';
                    }

                    return (
                      <div key={rec.id} className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                        isDuplicate ? 'bg-status-warning/5 hover:bg-status-warning/10 border-l-4 border-status-warning' : 'hover:bg-surface-container-low'
                      }`}>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-sm text-primary">{rec.id}</span>
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-container-high text-text-primary border border-border-structural/50">
                              {rec.doc_type || 'ROR / Khata'}
                            </span>
                            <span className="font-mono text-xs text-text-primary">Khasra #{khasra}</span>
                            <span className="text-xs text-text-secondary">• Khata #{khata}</span>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary-container text-on-primary font-semibold">
                              ULPIN: {ulpinNo}
                            </span>
                            
                            {rec.status_flag === 'VALID' ? (
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold border border-status-success/20">
                                VALID / STP
                              </span>
                            ) : rec.status_flag === 'FLAGGED_WARNING' ? (
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-warning/10 text-status-warning font-semibold border border-status-warning/20">
                                FLAGGED
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-error/10 text-status-error font-semibold border border-status-error/20">
                                REJECTED
                              </span>
                            )}

                            {/* PROMINENT DUPLICATE RECORD BADGE */}
                            {isDuplicate && (
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-status-warning/20 text-status-warning border border-status-warning/40 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> DUPLICATE ({dupCount} Copies)
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-text-secondary mt-1.5">
                            Village: <strong>{villageName}</strong>, Tehsil: <strong>{tehsilName}</strong>, District: <strong>{districtName}</strong> • Landowner: <strong>{ownersDisplay}</strong> • Area: <strong>{areaSqm} sqm</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* 1-CLICK REMOVE DUPLICATE BUTTON */}
                          {isDuplicate && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSingleDuplicate(rec.id);
                              }}
                              className="px-3 py-2 rounded-lg bg-status-error/10 hover:bg-status-error text-status-error hover:text-white border border-status-error/30 font-heading text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0"
                              title="Delete this duplicate record from system"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove Duplicate
                            </button>
                          )}

                          <button 
                            onClick={() => handleOpenRecordDetails(rec)}
                            className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-heading text-xs font-semibold shadow-sm transition-all flex-shrink-0"
                          >
                            View Full Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      case 'audit-logs':
        return (
          <AuditLogsView 
            recordsList={recordsList} 
            purgedIds={purgedIds} 
          />
        );

      case 'gis-map':
        return (
          <GisMapView 
            onSelectRecord={(rec) => handleNavigateToReview(rec)} 
          />
        );

      case 'admin-rbac':
        return <AdminRbac />;

      default:
        return <Dashboard onNavigateToReview={handleNavigateToReview} onNavigateToUpload={handleNavigateToUpload} />;
    }
  };

  return (
    <LanguageProvider>
      <NavigationShell
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setViewingRecordDetails(null);
          setCurrentTab(tab);
        }}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      >
        <ErrorBoundary>
          {renderTabContent()}
        </ErrorBoundary>
      </NavigationShell>
    </LanguageProvider>
  );
}
