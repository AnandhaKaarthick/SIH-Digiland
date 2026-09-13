import React, { useState, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Eye,
  EyeOff,
  FileCheck,
  FileSpreadsheet,
  MapPin,
  FileText,
  Filter,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Layers,
  Download,
  XCircle,
  AlertOctagon
} from 'lucide-react';
import { MOCK_LAND_RECORDS } from '../data/mockData';
import { getDocumentSvgForRecord } from '../utils/documentSvgGenerator';
import { commitReviewApi } from '../services/api';
import { useTranslation } from '../context/LanguageContext';

export default function SplitViewVerification({ record: initialRecord, allRecords = [], activeRole = 'tehsildar', onApproveComplete }) {
  const { t } = useTranslation();
  const [record, setRecord] = useState(initialRecord || MOCK_LAND_RECORDS[0]);
  const [activeField, setActiveField] = useState('owner_shares');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSigned, setIsSigned] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // ALL, HIGH_PRIORITY, MEDIUM_PRIORITY, LOW_PRIORITY

  // Document Modal & Multi-page Preview State
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalZoom, setModalZoom] = useState(1);
  const [showModalBbox, setShowModalBbox] = useState(true);

  // Rejection Workflow State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Fraudulent / Unverified Landowner Claim');
  const [customRejectNote, setCustomRejectNote] = useState('');
  const [isRejected, setIsRejected] = useState(false);

  const REJECTION_REASONS = [
    "Fraudulent / Unverified Landowner Claim",
    "Duplicate Record / Overlapping ULPIN Plot Claim",
    "Invalid Stamp Duty / Counterfeit Sub-Registrar Seal",
    "Mismatched Cadastral Survey Boundaries / Area Discrepancy",
    "Illegible Scan / Corrupted Document Pages",
    "Other Reason (Specify below)"
  ];

  const docType = record.doc_type || 'RECORD_OF_RIGHTS';

  const getField = (path, fallback) => {
    const keys = path.split('.');
    let curr = record;
    for (let k of keys) {
      if (!curr) return fallback;
      curr = curr[k];
    }
    return curr !== undefined && curr !== null ? curr : fallback;
  };

  // RoR Fields
  const [khasraNo, setKhasraNo] = useState(() => initialRecord?.khasra_no || getField('ror.khasra_no', record?.khasra_no || '117/2'));
  const [khataNo, setKhataNo] = useState(() => initialRecord?.khata_no || getField('ror.khata_no', record?.khata_no || '00229'));
  const [ownerNames, setOwnerNames] = useState(() => {
    if (Array.isArray(initialRecord?.owner_names)) return initialRecord.owner_names.join(', ');
    if (initialRecord?.ror?.owners) return initialRecord.ror.owners.map(o => typeof o === 'string' ? o : o.name).join(', ');
    return record?.owner_names || 'Kavita Naidu, Arumugam Kumar';
  });
  const [ownerShares, setOwnerShares] = useState(() => {
    if (Array.isArray(initialRecord?.owner_shares)) return initialRecord.owner_shares.join(', ');
    if (initialRecord?.ror?.owners) return initialRecord.ror.owners.map(o => typeof o === 'string' ? '1/2' : (o.share || '1/2')).join(', ');
    return record?.owner_shares !== undefined ? String(record.owner_shares) : '0.5, 0.5';
  });
  const [plotArea, setPlotArea] = useState(() => initialRecord?.plot_area || (initialRecord?.ror?.area_hectare ? (initialRecord.ror.area_hectare * 10000).toFixed(2) : (record?.plot_area || 19091)));
  const [ulpin, setUlpin] = useState(() => initialRecord?.ulpin || getField('ror.ulpin', record?.ulpin || '75QA02657Q4428'));

  // Sale Deed Fields
  const [regNo, setRegNo] = useState(() => initialRecord?.registration_number || getField('deed.document_no', record.registration_number || '204 of 2018'));
  const [sellerName, setSellerName] = useState(() => initialRecord?.seller_name || getField('deed.vendor_name', record.seller_name || 'Kavita Naidu'));
  const [buyerName, setBuyerName] = useState(() => initialRecord?.buyer_name || getField('deed.vendee_name', record.buyer_name || 'Arumugam Kumar'));
  const [saleValue, setSaleValue] = useState(() => initialRecord?.sale_value_inr || getField('deed.sale_consideration_rs', record.sale_value_inr || 6860408));

  // Mutation Fields
  const [mutSerial, setMutSerial] = useState(() => initialRecord?.mutation_serial_number || getField('mutation.mutation_case_no', record.mutation_serial_number || 'MUT-2018-2584'));
  const [priorOwner, setPriorOwner] = useState(() => initialRecord?.transferor_prior_owner || getField('mutation.transferor', record.transferor_prior_owner || 'Kavita Naidu'));
  const [newOwner, setNewOwner] = useState(() => initialRecord?.transferee_new_owner || getField('mutation.transferee', record.transferee_new_owner || 'Arumugam Kumar'));

  // Cadastral Map Fields
  const [mapSheet, setMapSheet] = useState(() => initialRecord?.map_sheet_number || getField('cadastral.sheet_no', record.map_sheet_number || 'Sheet-04'));
  const [epsg, setEpsg] = useState(() => initialRecord?.projection_system || getField('cadastral.projection_system', record.projection_system || 'EPSG:4326'));

  // SYNC STATE WHEN PROPS CHANGE
  useEffect(() => {
    if (initialRecord) {
      setRecord(initialRecord);
      setIsSigned(false);
      
      const rorKhasra = initialRecord.khasra_no || initialRecord.ror?.khasra_no || '117/2';
      const rorKhata = initialRecord.khata_no || initialRecord.ror?.khata_no || '00229';
      const rorUlpin = initialRecord.ulpin || initialRecord.ror?.ulpin || '75QA02657Q4428';
      
      let names = initialRecord.owner_names;
      if (initialRecord.ror?.owners) {
        names = initialRecord.ror.owners.map(o => typeof o === 'string' ? o : o.name);
      }
      const namesStr = Array.isArray(names) ? names.join(', ') : (names || 'Kavita Naidu, Arumugam Kumar');
      
      let shares = initialRecord.owner_shares;
      if (initialRecord.ror?.owners) {
        shares = initialRecord.ror.owners.map(o => typeof o === 'string' ? '1/2' : (o.share || '1/2'));
      }
      const sharesStr = Array.isArray(shares) ? shares.join(', ') : (shares || '0.5, 0.5');

      const area = initialRecord.ror?.area_hectare ? (initialRecord.ror.area_hectare * 10000).toFixed(2) : (initialRecord.plot_area || 19091);

      setKhasraNo(rorKhasra);
      setKhataNo(rorKhata);
      setUlpin(rorUlpin);
      setOwnerNames(namesStr);
      setOwnerShares(sharesStr);
      setPlotArea(area);

      setRegNo(initialRecord.deed?.document_no || initialRecord.registration_number || '204 of 2018');
      setSellerName(initialRecord.deed?.vendor_name || initialRecord.seller_name || 'Kavita Naidu');
      setBuyerName(initialRecord.deed?.vendee_name || initialRecord.buyer_name || 'Arumugam Kumar');
      setSaleValue(initialRecord.deed?.sale_consideration_rs || initialRecord.sale_value_inr || 6860408);

      setMutSerial(initialRecord.mutation?.mutation_case_no || initialRecord.mutation_serial_number || 'MUT-2018-2584');
      setPriorOwner(initialRecord.mutation?.transferor || initialRecord.transferor_prior_owner || 'Kavita Naidu');
      setNewOwner(initialRecord.mutation?.transferee || initialRecord.transferee_new_owner || 'Arumugam Kumar');

      setMapSheet(initialRecord.cadastral?.sheet_no || initialRecord.map_sheet_number || 'Sheet-04');
      setEpsg(initialRecord.cadastral?.projection_system || initialRecord.projection_system || 'EPSG:4326');
      setCurrentPage(0);
      setIsModalOpen(false);
    }
  }, [initialRecord]);

  // Handle ESC key to close full document modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Multi-page document preview fallback & calculation
  const defaultSvg = getDocumentSvgForRecord(record);
  const pagePreviews = record.batch_page_previews && record.batch_page_previews.length > 0
    ? record.batch_page_previews
    : [record.scanned_image_url || defaultSvg];

  const totalPages = record.batch_pages_count || pagePreviews.length;
  const currentImageSrc = pagePreviews[currentPage] || pagePreviews[0] || record.scanned_image_url || defaultSvg;

  const isPdf = record.file_type?.includes('pdf') || 
                record.file_name?.toLowerCase().endsWith('.pdf') || 
                (typeof currentImageSrc === 'string' && (currentImageSrc.toLowerCase().includes('.pdf') || currentImageSrc.startsWith('data:application/pdf')));

  // Rule checks
  let parsedShares = [];
  const rawShareList = ownerShares.split(',');
  for (let s of rawShareList) {
    const trimmed = s.trim();
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      parsedShares.push(parseFloat(parts[0]) / parseFloat(parts[1]) || 0);
    } else {
      parsedShares.push(parseFloat(trimmed) || 0);
    }
  }
  const shareSum = parsedShares.reduce((a, b) => a + b, 0);
  const isShareSumValid = Math.abs(shareSum - 1.0) < 0.001;

  const handleFieldFocus = (fieldName) => {
    setActiveField(fieldName);
  };

  const handleApprove = async () => {
    setIsSigned(true);

    const parsedNames = typeof ownerNames === 'string' 
      ? ownerNames.split(',').map(s => s.trim()).filter(Boolean) 
      : ownerNames;
    const parsedShares = typeof ownerShares === 'string' 
      ? ownerShares.split(',').map(s => s.trim()).filter(Boolean) 
      : ownerShares;

    const updatedRecord = {
      ...record,
      khasra_no: khasraNo,
      khata_no: khataNo,
      owner_names: parsedNames,
      owner_shares: parsedShares,
      plot_area: parseFloat(plotArea) || record.plot_area,
      ulpin: ulpin,
      village: record.village || 'Nemili',
      tehsil: record.tehsil || 'Sriperumbudur',
      district: record.district || 'Kanchipuram',
      registration_number: regNo,
      seller_name: sellerName,
      buyer_name: buyerName,
      sale_value_inr: parseFloat(saleValue) || record.sale_value_inr,
      mutation_serial_number: mutSerial,
      transferor_prior_owner: priorOwner,
      transferee_new_owner: newOwner,
      map_sheet_number: mapSheet,
      projection_system: epsg,
      status_flag: 'VALID',
      routing: 'AUTO_APPROVED',
      priority_level: 'LOW_PRIORITY'
    };

    setRecord(updatedRecord);

    try {
      await commitReviewApi({
        record_id: record.id,
        officer_name: "Rajesh Sharma, IRS",
        officer_role: "tehsildar",
        action: "APPROVE",
        corrected_fields: {
          khasra_no: khasraNo,
          khata_no: khataNo,
          owner_names: ownerNames,
          owner_shares: ownerShares,
          plot_area: plotArea,
          ulpin: ulpin,
          village: record.village || 'Nemili',
          tehsil: record.tehsil || 'Sriperumbudur',
          district: record.district || 'Kanchipuram',
          registration_number: regNo,
          seller_name: sellerName,
          buyer_name: buyerName,
          sale_value_inr: saleValue,
          mutation_serial_number: mutSerial,
          transferor_prior_owner: priorOwner,
          transferee_new_owner: newOwner,
          map_sheet_number: mapSheet,
          projection_system: epsg
        }
      });
    } catch (err) {
      console.warn("Backend commit review fallback:", err);
    }

    // Directly navigate to Record Registry (records) as requested, passing the UPDATED record
    setTimeout(() => {
      if (onApproveComplete) onApproveComplete(updatedRecord);
    }, 1200);
  };

  const handleReject = async () => {
    setIsRejected(true);
    setIsRejectModalOpen(false);

    const finalReason = rejectReason.includes("Other") ? (customRejectNote || "Rejected by verification officer") : rejectReason;

    const updatedRecord = {
      ...record,
      status_flag: 'FAILED_CRITICAL',
      routing: 'REJECTED_CRITICAL',
      priority_level: 'HIGH_PRIORITY',
      error_reason: finalReason
    };

    setRecord(updatedRecord);

    try {
      await commitReviewApi({
        record_id: record.id,
        officer_name: "Rajesh Sharma, IRS",
        officer_role: "tehsildar",
        action: "REJECT",
        rejection_reason: finalReason
      });
    } catch (err) {
      console.warn("Backend commit rejection fallback:", err);
    }

    setTimeout(() => {
      if (onApproveComplete) onApproveComplete(updatedRecord);
    }, 1200);
  };

  const activeBbox = record.bounding_boxes?.[activeField] || { x: 120, y: 180, width: 200, height: 50 };

  const filteredRecords = MOCK_LAND_RECORDS.filter(r => {
    if (priorityFilter === 'HIGH_PRIORITY') return r.priority_level === 'HIGH_PRIORITY' || r.status_flag === 'FAILED_CRITICAL';
    if (priorityFilter === 'MEDIUM_PRIORITY') return r.priority_level === 'MEDIUM_PRIORITY' || r.status_flag === 'FLAGGED_WARNING';
    if (priorityFilter === 'LOW_PRIORITY') return r.priority_level === 'LOW_PRIORITY' || r.status_flag === 'VALID';
    return true;
  });

  return (
    <div className="flex flex-col gap-space-md max-w-[1720px] mx-auto w-full min-h-[calc(100vh-6rem)] h-auto lg:h-[calc(100vh-6rem)]">
      {/* Top Priority Filter & Selection Bar */}
      <div className="bg-surface-card p-3 rounded-xl border border-border-structural shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Filter className="w-4 h-4 text-primary" />
            <span className="font-heading text-xs font-bold text-text-primary">Triage Queue:</span>
          </div>
          
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            <button 
              onClick={() => setPriorityFilter('ALL')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all ${
                priorityFilter === 'ALL' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-text-secondary hover:bg-surface-container-high'
              }`}
            >
              All ({MOCK_LAND_RECORDS.length})
            </button>
            <button 
              onClick={() => setPriorityFilter('HIGH_PRIORITY')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all ${
                priorityFilter === 'HIGH_PRIORITY' ? 'bg-status-error text-white shadow-sm' : 'bg-status-error/10 text-status-error hover:bg-status-error/20'
              }`}
            >
              High Priority (Critical Flags)
            </button>
            <button 
              onClick={() => setPriorityFilter('MEDIUM_PRIORITY')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all ${
                priorityFilter === 'MEDIUM_PRIORITY' ? 'bg-status-warning text-white shadow-sm' : 'bg-status-warning/10 text-status-warning hover:bg-status-warning/20'
              }`}
            >
              Medium Priority (Queue)
            </button>
            <button 
              onClick={() => setPriorityFilter('LOW_PRIORITY')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all ${
                priorityFilter === 'LOW_PRIORITY' ? 'bg-status-success text-white shadow-sm' : 'bg-status-success/10 text-status-success hover:bg-status-success/20'
              }`}
            >
              Low Priority (STP)
            </button>
          </div>
        </div>

        {/* Record Quick Selector */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-text-secondary font-heading font-semibold whitespace-nowrap">Active Record:</span>
          <select 
            value={record.id}
            onChange={(e) => {
              const selected = MOCK_LAND_RECORDS.find(r => r.id === e.target.value);
              if (selected) setRecord(selected);
            }}
            className="px-2.5 py-1 rounded bg-surface-card border border-border-structural font-mono text-xs font-bold text-primary max-w-[200px] sm:max-w-none truncate"
            aria-label="Select Record for Verification"
          >
            {filteredRecords.map(r => (
              <option key={r.id} value={r.id}>
                {r.id} ({r.district || 'Lucknow'} - {r.priority_level || r.status_flag})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Record Status Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-card p-space-md rounded-xl border border-border-structural shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono font-bold text-sm px-2.5 py-1 rounded bg-primary-container text-on-primary flex-shrink-0">
            {record.id}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading font-bold text-base text-text-primary leading-tight">
                {t('verification_header', 'Split-View Verification (Human-in-the-Loop)')}
              </h1>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container-high text-primary border border-border-structural uppercase whitespace-nowrap">
                {docType.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5 truncate">
              {t('roi_bounding_box', 'Interactive OCR Bounding Box Backtracking Active')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 self-start sm:self-auto">
          <span className={`font-mono text-xs font-semibold px-2.5 py-1 rounded border ${
            record.status_flag === 'VALID' ? 'bg-status-success/10 text-status-success border-status-success/20' :
            record.status_flag === 'FLAGGED_WARNING' ? 'bg-status-warning/10 text-status-warning border-status-warning/20' : 'bg-status-error/10 text-status-error border-status-error/20'
          }`}>
            {t('composite_score')}: {record.confidence_score}% ({record.status_flag})
          </span>
        </div>
      </div>

      {/* Dynamic Rule Alert Banner */}
      {!isShareSumValid && docType === 'RECORD_OF_RIGHTS' && (
        <div className="bg-status-warning/10 border-l-4 border-status-warning p-3 rounded-r-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-status-warning font-mono flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Revenue Invariant Alert:</strong> Joint ownership share fractions sum to <strong>{shareSum.toFixed(2)}</strong> (Must equal 1.00). Update shares below to auto-clear warning.
            </span>
          </div>
          <button onClick={() => setOwnerShares("1/2, 1/2")} className="underline text-xs font-semibold hover:text-text-primary whitespace-nowrap self-start sm:self-auto">
            Auto-Fix Shares (1/2, 1/2)
          </button>
        </div>
      )}

      {/* Dynamic Duplicate Record Alert Banner */}
      {allRecords.some(r => r.id !== record.id && (
        (r.ulpin && ulpin && r.ulpin.trim().toLowerCase() === ulpin.trim().toLowerCase()) ||
        (r.khasra_no && khasraNo && r.khata_no && khataNo && r.khasra_no.trim() === khasraNo.trim() && r.khata_no.trim() === khataNo.trim()) ||
        (r.file_name && record.file_name && r.file_name.trim().toLowerCase() === record.file_name.trim().toLowerCase())
      )) && (
        <div className="bg-status-warning/15 border-l-4 border-status-warning p-3 rounded-r-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-status-warning font-mono flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-status-warning" />
            <span>
              <strong>Registry Duplicate Warning:</strong> Identical plot ULPIN <strong>{ulpin || record.ulpin}</strong> / Khasra <strong>{khasraNo || record.khasra_no}</strong> detected in database queue.
            </span>
          </div>
          <span className="bg-status-warning text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase shadow-sm whitespace-nowrap self-start sm:self-auto">
            Duplicate Detected
          </span>
        </div>
      )}

      {/* Main Dual-Pane Viewport (50/50 Split View) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md flex-1 lg:min-h-0">
        
        {/* Left Pane: Interactive Document Canvas */}
        <div className="bg-surface-card rounded-xl border border-border-structural flex flex-col overflow-hidden shadow-sm">
          <div className="p-3 bg-surface-container-low border-b border-border-structural flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <span className="font-heading font-semibold text-xs text-text-primary">Source Document Scan ({docType})</span>
              {totalPages > 1 && (
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-primary-container text-on-primary">
                  Page {currentPage + 1} of {totalPages}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Page Stepper Controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1 bg-surface-card border border-border-structural rounded-lg p-0.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="p-1 rounded hover:bg-surface-container disabled:opacity-30 transition-colors text-text-primary"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[11px] px-1 font-semibold text-text-primary">
                    {currentPage + 1}/{totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="p-1 rounded hover:bg-surface-container disabled:opacity-30 transition-colors text-text-primary"
                    title="Next Page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Zoom Controls */}
              <button onClick={() => setZoomLevel(z => Math.max(0.8, z - 0.2))} className="p-1 rounded hover:bg-surface-container text-text-secondary" title="Zoom Out">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs text-text-secondary">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={() => setZoomLevel(z => Math.min(2.0, z + 0.2))} className="p-1 rounded hover:bg-surface-container text-text-secondary" title="Zoom In">
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-border-structural"></div>

              {/* Full View Expand Modal Trigger */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-heading text-xs font-semibold shadow-sm transition-all"
                title="Open Complete Uploaded Document in Full Screen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full View</span>
              </button>
            </div>
          </div>

          <div 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 bg-gray-900 overflow-auto p-4 flex items-center justify-center relative cursor-pointer group min-h-[380px] sm:min-h-[480px] lg:min-h-0"
            title="Click to view complete uploaded document in full screen"
          >
            {/* Click Hover Hint Overlay */}
            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-primary/95 text-on-primary font-heading text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 pointer-events-none">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Click to View Full Document</span>
            </div>

            <div 
              className="relative transition-transform duration-200 shadow-2xl"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            >
              {isPdf ? (
                <iframe
                  src={currentImageSrc}
                  title={record.file_name || "Uploaded PDF Document"}
                  className="w-full h-full min-h-[350px] sm:min-h-[550px] rounded border border-gray-700 bg-white"
                />
              ) : (
                <img 
                  src={currentImageSrc} 
                  onError={(e) => {
                    e.currentTarget.src = getDocumentSvgForRecord(record);
                  }}
                  alt={`Scanned Land Record - Page ${currentPage + 1}`} 
                  className="max-w-full h-auto rounded border border-gray-700 select-none group-hover:ring-2 group-hover:ring-primary/60 transition-all"
                />
              )}

              {/* Dynamic ROI Bounding Box Overlay */}
              <div 
                className="absolute border-2 border-secondary bg-secondary/20 transition-all duration-300 pointer-events-none"
                style={{
                  left: `${activeBbox.x}px`,
                  top: `${activeBbox.y}px`,
                  width: `${activeBbox.width}px`,
                  height: `${activeBbox.height}px`,
                }}
              >
                <span className="absolute -top-5 left-0 bg-secondary text-white font-mono text-[9px] px-1 rounded shadow-sm whitespace-nowrap">
                  OCR: {activeField}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Schema-Aware Form & Backtracking */}
        <div className="bg-surface-card rounded-xl border border-border-structural flex flex-col overflow-hidden shadow-sm">
          <div className="p-3 bg-surface-container-low border-b border-border-structural flex items-center justify-between flex-shrink-0">
            <span className="font-heading font-semibold text-xs text-text-primary">Extracted Schema Form (Click Field to Backtrack)</span>
            <span className="font-mono text-[11px] text-text-secondary">Doc Ref: {record.document_id || 'DOC-001'}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-space-lg flex flex-col gap-space-md">
            
            {/* SCHEMA 1: RECORD OF RIGHTS */}
            {docType === 'RECORD_OF_RIGHTS' && (
              <>
                <div onClick={() => handleFieldFocus('khasra_no')} className={`p-3 rounded-lg border transition-all cursor-pointer ${activeField === 'khasra_no' ? 'border-secondary bg-surface-container-low' : 'border-border-structural'}`}>
                  <div className="flex justify-between mb-1">
                    <label className="font-heading text-xs font-semibold">{t('field_khasra')}</label>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold">98% Conf</span>
                  </div>
                  <input type="text" value={khasraNo} onChange={(e) => setKhasraNo(e.target.value)} className="w-full px-3 py-1.5 rounded bg-surface-card border border-border-structural font-mono text-xs" />
                </div>

                <div onClick={() => handleFieldFocus('khata_no')} className={`p-3 rounded-lg border transition-all cursor-pointer ${activeField === 'khata_no' ? 'border-secondary bg-surface-container-low' : 'border-border-structural'}`}>
                  <div className="flex justify-between mb-1">
                    <label className="font-heading text-xs font-semibold">{t('field_khata')}</label>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold">96% Conf</span>
                  </div>
                  <input type="text" value={khataNo} onChange={(e) => setKhataNo(e.target.value)} className="w-full px-3 py-1.5 rounded bg-surface-card border border-border-structural font-mono text-xs" />
                </div>

                <div onClick={() => handleFieldFocus('owner_names')} className={`p-3 rounded-lg border transition-all cursor-pointer ${activeField === 'owner_names' ? 'border-secondary bg-surface-container-low' : 'border-border-structural'}`}>
                  <div className="flex justify-between mb-1">
                    <label className="font-heading text-xs font-semibold">{t('field_landowners')}</label>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold">97% Conf</span>
                  </div>
                  <input type="text" value={ownerNames} onChange={(e) => setOwnerNames(e.target.value)} className="w-full px-3 py-1.5 rounded bg-surface-card border border-border-structural text-xs" />
                </div>

                <div onClick={() => handleFieldFocus('owner_shares')} className={`p-3 rounded-lg border transition-all cursor-pointer ${activeField === 'owner_shares' ? 'border-secondary bg-surface-container-low' : 'border-border-structural'}`}>
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <label className="font-heading text-xs font-semibold">{t('field_shares')}</label>
                      {!isShareSumValid && (
                        <span className="text-[10px] text-status-warning font-mono font-bold">
                          (! ∑ = {shareSum.toFixed(2)})
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-warning/10 text-status-warning font-semibold">82% Conf</span>
                  </div>
                  <input type="text" value={ownerShares} onChange={(e) => setOwnerShares(e.target.value)} className="w-full px-3 py-1.5 rounded bg-surface-card border border-border-structural font-mono text-xs" />
                </div>

                <div onClick={() => handleFieldFocus('plot_area')} className={`p-3 rounded-lg border transition-all cursor-pointer ${activeField === 'plot_area' ? 'border-secondary bg-surface-container-low' : 'border-border-structural'}`}>
                  <div className="flex justify-between mb-1">
                    <label className="font-heading text-xs font-semibold">{t('field_plot_area')}</label>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold">99% Conf</span>
                  </div>
                  <input type="text" value={plotArea} onChange={(e) => setPlotArea(e.target.value)} className="w-full px-3 py-1.5 rounded bg-surface-card border border-border-structural font-mono text-xs" />
                </div>

                <div onClick={() => handleFieldFocus('ulpin')} className={`p-3 rounded-lg border transition-all cursor-pointer ${activeField === 'ulpin' ? 'border-secondary bg-surface-container-low' : 'border-border-structural'}`}>
                  <div className="flex justify-between mb-1">
                    <label className="font-heading text-xs font-semibold">{t('field_ulpin')}</label>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold">98% Conf</span>
                  </div>
                  <input type="text" value={ulpin} onChange={(e) => setUlpin(e.target.value)} className="w-full px-3 py-1.5 rounded bg-surface-card border border-border-structural font-mono text-xs text-primary font-bold" />
                </div>
              </>
            )}

            {/* SCHEMA 2: CONVEYANCE & SALE DEED */}
            {docType === 'CONVEYANCE_DEED' && (
              <>
                <div onClick={() => handleFieldFocus('registration_number')} className={`p-3 rounded-lg border transition-all cursor-pointer ${activeField === 'registration_number' ? 'border-secondary bg-surface-container-low' : 'border-border-structural'}`}>
                  <div className="flex justify-between mb-1">
                    <label className="font-heading text-xs font-semibold">Deed Registration Number</label>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold">99% Conf</span>
                  </div>
                  <input type="text" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} className="w-full px-3 py-1.5 rounded bg-surface-card border border-border-structural font-mono text-xs font-bold text-primary" />
                </div>

                <div onClick={() => handleFieldFocus('seller_name')} className={`p-3 rounded-lg border transition-all cursor-pointer ${activeField === 'seller_name' ? 'border-secondary bg-surface-container-low' : 'border-border-structural'}`}>
                  <div className="flex justify-between mb-1">
                    <label className="font-heading text-xs font-semibold">Executant / Vendor (Seller)</label>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold">97% Conf</span>
                  </div>
                  <input type="text" value={sellerName} onChange={(e) => setSellerName(e.target.value)} className="w-full px-3 py-1.5 rounded bg-surface-card border border-border-structural text-xs" />
                </div>

                <div onClick={() => handleFieldFocus('buyer_name')} className={`p-3 rounded-lg border transition-all cursor-pointer ${activeField === 'buyer_name' ? 'border-secondary bg-surface-container-low' : 'border-border-structural'}`}>
                  <div className="flex justify-between mb-1">
                    <label className="font-heading text-xs font-semibold">Claimant / Vendee (Buyer)</label>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold">98% Conf</span>
                  </div>
                  <input type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="w-full px-3 py-1.5 rounded bg-surface-card border border-border-structural text-xs font-semibold" />
                </div>

                <div onClick={() => handleFieldFocus('sale_value')} className={`p-3 rounded-lg border transition-all cursor-pointer ${activeField === 'sale_value' ? 'border-secondary bg-surface-container-low' : 'border-border-structural'}`}>
                  <div className="flex justify-between mb-1">
                    <label className="font-heading text-xs font-semibold">Financial Consideration (Sale Value INR)</label>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold">99% Conf</span>
                  </div>
                  <input type="text" value={saleValue} onChange={(e) => setSaleValue(e.target.value)} className="w-full px-3 py-1.5 rounded bg-surface-card border border-border-structural font-mono text-xs" />
                </div>

                <div onClick={() => handleFieldFocus('plot_area')} className={`p-3 rounded-lg border transition-all cursor-pointer ${activeField === 'plot_area' ? 'border-secondary bg-surface-container-low' : 'border-border-structural'}`}>
                  <div className="flex justify-between mb-1">
                    <label className="font-heading text-xs font-semibold">Transacted Schedule Area (sqm)</label>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold">97% Conf</span>
                  </div>
                  <input type="text" value={plotArea} onChange={(e) => setPlotArea(e.target.value)} className="w-full px-3 py-1.5 rounded bg-surface-card border border-border-structural font-mono text-xs" />
                </div>
              </>
            )}

            {/* SCHEMA 3: MUTATION REGISTER */}
            {docType === 'MUTATION_ORDER' && (
              <>
                <div onClick={() => handleFieldFocus('mutation_serial_number')} className={`p-3 rounded-lg border transition-all cursor-pointer ${activeField === 'mutation_serial_number' ? 'border-secondary bg-surface-container-low' : 'border-border-structural'}`}>
                  <div className="flex justify-between mb-1">
                    <label className="font-heading text-xs font-semibold">Mutation Serial Order #</label>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold">99% Conf</span>
                  </div>
                  <input type="text" value={mutationSerial} onChange={(e) => setMutationSerial(e.target.value)} className="w-full px-3 py-1.5 rounded bg-surface-card border border-border-structural font-mono text-xs font-bold text-primary" />
                </div>

                <div onClick={() => handleFieldFocus('transferor')} className={`p-3 rounded-lg border transition-all cursor-pointer ${activeField === 'transferor' ? 'border-secondary bg-surface-container-low' : 'border-border-structural'}`}>
                  <div className="flex justify-between mb-1">
                    <label className="font-heading text-xs font-semibold">Prior Owner (Transferor)</label>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold">96% Conf</span>
                  </div>
                  <input type="text" value={priorOwner} onChange={(e) => setPriorOwner(e.target.value)} className="w-full px-3 py-1.5 rounded bg-surface-card border border-border-structural text-xs" />
                </div>

                <div onClick={() => handleFieldFocus('transferee')} className={`p-3 rounded-lg border transition-all cursor-pointer ${activeField === 'transferee' ? 'border-secondary bg-surface-container-low' : 'border-border-structural'}`}>
                  <div className="flex justify-between mb-1">
                    <label className="font-heading text-xs font-semibold">New Sanctioned Owner (Transferee)</label>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold">98% Conf</span>
                  </div>
                  <input type="text" value={newOwner} onChange={(e) => setNewOwner(e.target.value)} className="w-full px-3 py-1.5 rounded bg-surface-card border border-border-structural text-xs font-semibold" />
                </div>
              </>
            )}

            {/* SCHEMA 4: CADASTRAL MAP */}
            {docType === 'CADASTRAL_MAP' && (
              <>
                <div onClick={() => handleFieldFocus('map_sheet_number')} className={`p-3 rounded-lg border transition-all cursor-pointer ${activeField === 'map_sheet_number' ? 'border-secondary bg-surface-container-low' : 'border-border-structural'}`}>
                  <div className="flex justify-between mb-1">
                    <label className="font-heading text-xs font-semibold">Cadastral Map Sheet Number</label>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold">99% Conf</span>
                  </div>
                  <input type="text" value={mapSheet} onChange={(e) => setMapSheet(e.target.value)} className="w-full px-3 py-1.5 rounded bg-surface-card border border-border-structural font-mono text-xs font-bold text-primary" />
                </div>

                <div onClick={() => handleFieldFocus('projection_system')} className={`p-3 rounded-lg border transition-all cursor-pointer ${activeField === 'projection_system' ? 'border-secondary bg-surface-container-low' : 'border-border-structural'}`}>
                  <div className="flex justify-between mb-1">
                    <label className="font-heading text-xs font-semibold">Geodetic Spatial Projection (CRS)</label>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold">99% Conf</span>
                  </div>
                  <input type="text" value={epsg} onChange={(e) => setEpsg(e.target.value)} className="w-full px-3 py-1.5 rounded bg-surface-card border border-border-structural font-mono text-xs" />
                </div>
              </>
            )}

          </div>

          {/* Action Footer: Officer Sign / Reject */}
          <div className="p-4 bg-surface-container-low border-t border-border-structural flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-heading font-semibold text-text-primary truncate">Officer ECDSA Digital Sign &amp; Database Commit</span>
                {activeRole !== 'tehsildar' && activeRole !== 'admin' && (
                  <span className="text-[10px] font-mono text-status-warning font-bold flex items-center gap-1">
                    🔒 Sign-off Restricted: Tehsildar / Admin Approval Required
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Reject Button */}
              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={isSigned || isRejected}
                className={`px-4 py-2 rounded-lg font-heading text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                  isRejected 
                    ? 'bg-status-error text-white' 
                    : 'bg-status-error/10 hover:bg-status-error text-status-error hover:text-white border border-status-error/30'
                }`}
                title="Reject this submission and record critical error reason"
              >
                {isRejected ? (
                  <>
                    <XCircle className="w-4 h-4" /> Record Rejected &amp; Flagged!
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" /> Reject &amp; Flag Record
                  </>
                )}
              </button>

              {/* Approve / HITL Save Draft Button */}
              {activeRole === 'tehsildar' || activeRole === 'admin' ? (
                <button 
                  onClick={handleApprove}
                  disabled={isSigned || isRejected}
                  className={`px-5 py-2 rounded-lg font-heading text-xs font-semibold text-on-primary transition-all shadow-sm flex items-center justify-center gap-2 ${
                    isSigned ? 'bg-status-success' : 'bg-primary hover:bg-primary-container'
                  }`}
                >
                  {isSigned ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Signed &amp; Committed to Database!
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Approve &amp; Save to Database (Ed25519)
                    </>
                  )}
                </button>
              ) : (
                <button 
                  onClick={() => alert(`Review draft saved by ${activeRole.toUpperCase()}. Forwarded to Tehsildar for ECDSA Digital Sign-Off.`)}
                  disabled={isSigned || isRejected}
                  className="px-5 py-2 rounded-lg font-heading text-xs font-semibold bg-status-warning/20 text-status-warning border border-status-warning/40 hover:bg-status-warning/30 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-4 h-4" /> Save HITL Review Draft (Pending Sign-Off)
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* FULL DOCUMENT INSPECTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-fadeIn">
          {/* Modal Header Bar */}
          <div className="bg-surface-card border-b border-border-structural px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shadow-md flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-heading font-bold text-sm flex-shrink-0">
                DL
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-heading font-bold text-sm text-text-primary">
                    Full Document Inspection Viewer — {record.id}
                  </h2>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-primary-container text-on-primary border border-border-structural uppercase whitespace-nowrap">
                    {docType.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-text-secondary truncate">
                  Doc Ref: {record.document_id || 'DOC-ORIGINAL'} | File: {record.file_name || `${record.id}.pdf`}
                </p>
              </div>
            </div>

            {/* Toolbar Controls */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
              {/* Page Stepper */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1 sm:gap-2 bg-surface-container p-1 rounded-lg border border-border-structural">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="p-1 rounded hover:bg-surface-card disabled:opacity-30 text-text-primary"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-xs font-bold text-text-primary px-1">
                    {currentPage + 1}/{totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="p-1 rounded hover:bg-surface-card disabled:opacity-30 text-text-primary"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Zoom Level Controls */}
              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-border-structural">
                <button onClick={() => setModalZoom(z => Math.max(0.5, z - 0.25))} className="p-1 rounded hover:bg-surface-card text-text-primary" title="Zoom Out">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs font-bold text-text-primary w-10 sm:w-12 text-center">
                  {Math.round(modalZoom * 100)}%
                </span>
                <button onClick={() => setModalZoom(z => Math.min(3.0, z + 0.25))} className="p-1 rounded hover:bg-surface-card text-text-primary" title="Zoom In">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button onClick={() => setModalZoom(1)} className="p-1 rounded hover:bg-surface-card text-text-secondary hover:text-text-primary" title="Reset Zoom">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Toggle Bounding Boxes */}
              <button
                onClick={() => setShowModalBbox(!showModalBbox)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-heading font-semibold border transition-all ${
                  showModalBbox ? 'bg-secondary text-white border-secondary' : 'bg-surface-container text-text-secondary border-border-structural'
                }`}
              >
                {showModalBbox ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">OCR Bounding Box</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 sm:p-2 rounded-lg bg-surface-container hover:bg-status-error hover:text-white text-text-primary transition-colors"
                title="Close Viewer (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Main Viewport with optional Page Thumbnails Strip */}
          <div className="flex-1 overflow-hidden flex bg-gray-950 relative">
            {/* Left Thumbnail Strip for Multi-Page Documents */}
            {totalPages > 1 && (
              <div className="w-24 sm:w-44 bg-gray-900 border-r border-gray-800 p-2 sm:p-3 overflow-y-auto flex flex-col gap-2 sm:gap-3 flex-shrink-0">
                <span className="font-heading text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pages ({totalPages})</span>
                {pagePreviews.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`p-1 rounded border transition-all text-left flex flex-col gap-1 ${
                      currentPage === idx ? 'border-primary bg-primary/10 ring-2 ring-primary/40' : 'border-gray-800 hover:border-gray-600 bg-gray-900/50'
                    }`}
                  >
                    <img src={img} alt={`Page ${idx + 1}`} className="w-full h-16 sm:h-24 object-cover rounded bg-white" />
                    <span className={`font-mono text-[10px] text-center font-bold ${currentPage === idx ? 'text-primary' : 'text-gray-400'}`}>
                      P.{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Main Document Inspection Canvas */}
            <div className="flex-1 overflow-auto p-2 sm:p-8 flex items-center justify-center">
              <div
                className="relative transition-transform duration-200 shadow-2xl max-w-full"
                style={{ transform: `scale(${modalZoom})`, transformOrigin: 'top center' }}
              >
                {isPdf ? (
                  <iframe
                    src={currentImageSrc}
                    title={record.file_name || "Uploaded PDF Document"}
                    className="w-full max-w-5xl h-[75vh] sm:h-[85vh] min-w-[280px] rounded border border-gray-700 bg-white shadow-2xl"
                  />
                ) : (
                  <img
                    src={currentImageSrc}
                    alt={`Uploaded Document - Page ${currentPage + 1}`}
                    className="max-w-full sm:max-w-none w-auto max-h-[75vh] sm:max-h-[85vh] rounded border border-gray-700 bg-white select-none"
                  />
                )}

                {/* Optional Bounding Box Overlay in Modal */}
                {showModalBbox && (
                  <div 
                    className="absolute border-2 border-secondary bg-secondary/20 shadow-[0_0_20px_rgba(193,120,23,0.8)] transition-all duration-300 rounded pointer-events-none flex items-start justify-end p-1"
                    style={{
                      left: `${activeBbox.x}px`,
                      top: `${activeBbox.y}px`,
                      width: `${activeBbox.width}px`,
                      height: `${activeBbox.height}px`
                    }}
                  >
                    <span className="bg-secondary text-white font-mono text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shadow">
                      Active Field: {activeField}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT REJECTION REASON MODAL */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-card rounded-2xl border border-status-error/40 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-status-error/15 border-b border-status-error/30 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-status-error text-white flex items-center justify-center shadow-md">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-status-error text-white uppercase tracking-wider">
                    REJECT_DECISION
                  </span>
                  <h3 className="font-heading font-bold text-base text-text-primary leading-tight mt-0.5">
                    Reject Land Record Submission ({record.id})
                  </h3>
                </div>
              </div>

              <button 
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary hover:text-text-primary transition-colors"
                title="Cancel Rejection"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4">
              <p className="text-xs text-text-secondary font-body">
                Select the primary legal reason for rejecting this document entry. This decision will be permanently committed to the ECDSA signed audit ledger.
              </p>

              <div className="flex flex-col gap-2">
                {REJECTION_REASONS.map((reason, idx) => (
                  <label 
                    key={idx}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 text-xs ${
                      rejectReason === reason 
                        ? 'bg-status-error/10 border-status-error font-semibold text-text-primary' 
                        : 'bg-canvas-bg border-border-structural text-text-secondary hover:border-status-error/40'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="rejectionReason" 
                      value={reason}
                      checked={rejectReason === reason}
                      onChange={() => setRejectReason(reason)}
                      className="text-status-error focus:ring-status-error"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {rejectReason.includes("Other") && (
                <div className="mt-1">
                  <label className="text-xs font-heading font-semibold text-text-primary block mb-1">
                    Officer Custom Rejection Note:
                  </label>
                  <textarea
                    rows={3}
                    value={customRejectNote}
                    onChange={(e) => setCustomRejectNote(e.target.value)}
                    placeholder="Provide detailed legal justification for rejection..."
                    className="w-full p-3 rounded-xl bg-canvas-bg border border-border-structural font-body text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-status-error"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface-container-low border-t border-border-structural flex items-center justify-end gap-3">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-heading text-xs font-semibold transition-all border border-border-structural"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-5 py-2 rounded-xl bg-status-error hover:bg-status-error/90 text-white font-heading text-xs font-semibold shadow-md transition-all flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Confirm Rejection &amp; Commit Ledger
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
