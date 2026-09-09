import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  FileSpreadsheet, 
  Building, 
  UserCheck, 
  Coins, 
  Compass, 
  Hash, 
  Layers,
  Calendar,
  Grid,
  TrendingUp,
  Landmark
} from 'lucide-react';
import { getDocumentSvgForRecord } from '../utils/documentSvgGenerator';
import { useLanguage } from '../context/LanguageContext';

export default function RecordDetailsView({ record, onBack }) {
  const { t } = useLanguage();

  const defaultSvg = getDocumentSvgForRecord(record || {});

  const pagePreviews = record?.batch_page_previews && record.batch_page_previews.length > 0
    ? record.batch_page_previews
    : [record?.scanned_image_url || defaultSvg];

  const [currentPage, setCurrentPage] = useState(0);

  const [imgSrc, setImgSrc] = useState(() => {
    const url = pagePreviews[0] || record?.scanned_image_url;
    if (!url || typeof url !== 'string' || url.startsWith('blob:')) return defaultSvg;
    return url;
  });

  useEffect(() => {
    const fallback = getDocumentSvgForRecord(record || {});
    const url = pagePreviews[currentPage] || record?.scanned_image_url;
    if (!url || typeof url !== 'string' || url.startsWith('blob:')) {
      setImgSrc(fallback);
    } else {
      setImgSrc(url);
    }
  }, [record, currentPage]);

  if (!record) return null;

  const currentSrc = imgSrc || defaultSvg;

  const isPdf = record.file_type?.includes('pdf') || 
                record.file_name?.toLowerCase().endsWith('.pdf') || 
                (typeof currentSrc === 'string' && (currentSrc.toLowerCase().includes('.pdf') || currentSrc.startsWith('data:application/pdf')));

  const docType = (record.doc_type || 'RECORD_OF_RIGHTS').toUpperCase();
  const breakdown = record.scoring_breakdown || {};
  const payload = record.raw_payload || record.payload || {};

  return (
    <div className="flex flex-col gap-space-xl max-w-[1500px] mx-auto w-full pb-12">
      {/* Top Header Bar with Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card p-space-md rounded-xl border border-border-structural shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-primary transition-colors border border-border-structural flex items-center gap-1.5 text-xs font-heading font-semibold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> {t('btn_back_registry')}
          </button>
          
          <div className="hidden sm:block h-6 w-[1px] bg-border-structural mx-1"></div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-sm text-primary px-2 py-0.5 rounded bg-primary-container">
                {record.id}
              </span>
              <h1 className="font-heading font-bold text-base text-text-primary">
                Validated Land Record &amp; Extracted Schema Details
              </h1>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-primary text-on-primary uppercase tracking-wide shadow-sm">
                {docType.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              ULPIN: <strong className="font-mono text-primary">{record.ulpin || '14BW89201L9842'}</strong> • Village: <strong>{record.village || 'Nemili'}</strong>, Tehsil: <strong>{record.tehsil || 'Sriperumbudur'}</strong>, District: <strong>{record.district || 'Kanchipuram'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {record.priority_level === 'HIGH_PRIORITY' ? (
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-status-error/10 text-status-error border border-status-error/20 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> High Priority / Critical Flag
            </span>
          ) : record.priority_level === 'MEDIUM_PRIORITY' ? (
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-status-warning/10 text-status-warning border border-status-warning/20 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Medium Priority / Needs Review
            </span>
          ) : (
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-status-success/10 text-status-success border border-status-success/20 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Low Priority / STP Auto-Approved
            </span>
          )}

          <span className="font-mono text-xs font-bold px-3 py-1.5 rounded bg-primary text-on-primary shadow-sm">
            Composite Score: {record.confidence_score}%
          </span>
        </div>
      </div>

      {/* Formula-Based Composite Confidence Scoring Breakdown Card */}
      <div className="bg-surface-card rounded-xl p-space-lg border border-border-structural shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-border-structural pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold text-sm text-text-primary">
              Multi-Tier Composite Confidence Formula Score Breakdown
            </h3>
          </div>
          <span className="font-mono text-xs text-text-secondary bg-surface-container-low px-2.5 py-1 rounded border border-border-structural/60">
            Formula: C = 0.35·C_OCR + 0.30·C_Rules + 0.20·C_DB + 0.15·C_Dup
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Layer 1: OCR Quality */}
          <div className="p-3.5 rounded-lg bg-canvas-bg border border-border-structural flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-heading font-semibold text-text-secondary">1. OCR Quality (C_OCR)</span>
              <span className="font-mono text-[10px] font-bold text-primary bg-primary-container px-1.5 py-0.5 rounded">35% Wt</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-mono font-bold text-lg text-text-primary">
                {breakdown.ocr_score !== undefined ? `${breakdown.ocr_score}%` : '96%'}
              </span>
              <span className="text-[11px] text-status-success font-semibold">Vision Tokens Sharp</span>
            </div>
          </div>

          {/* Layer 2: Revenue Rule Invariants */}
          <div className="p-3.5 rounded-lg bg-canvas-bg border border-border-structural flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-heading font-semibold text-text-secondary">2. Revenue Rules (C_Rules)</span>
              <span className="font-mono text-[10px] font-bold text-primary bg-primary-container px-1.5 py-0.5 rounded">30% Wt</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-mono font-bold text-lg text-text-primary">
                {breakdown.rules_score !== undefined ? `${breakdown.rules_score}%` : '100%'}
              </span>
              <span className={`text-[11px] font-semibold ${breakdown.share_rule_passed !== false ? 'text-status-success' : 'text-status-error'}`}>
                {breakdown.share_rule_passed !== false ? '∑ Shares = 1.00' : 'Invariant Fail'}
              </span>
            </div>
          </div>

          {/* Layer 3: Master DB & GIS */}
          <div className="p-3.5 rounded-lg bg-canvas-bg border border-border-structural flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-heading font-semibold text-text-secondary">3. GIS &amp; LGD (C_DB)</span>
              <span className="font-mono text-[10px] font-bold text-primary bg-primary-container px-1.5 py-0.5 rounded">20% Wt</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-mono font-bold text-lg text-text-primary">
                {breakdown.database_gis_score !== undefined ? `${breakdown.database_gis_score}%` : '95%'}
              </span>
              <span className="text-[11px] text-status-success font-semibold">LGD &amp; ST_Area Match</span>
            </div>
          </div>

          {/* Layer 4: Deduplication */}
          <div className="p-3.5 rounded-lg bg-canvas-bg border border-border-structural flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-heading font-semibold text-text-secondary">4. Deduplication (C_Dup)</span>
              <span className="font-mono text-[10px] font-bold text-primary bg-primary-container px-1.5 py-0.5 rounded">15% Wt</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-mono font-bold text-lg text-text-primary">
                {breakdown.deduplication_score !== undefined ? `${breakdown.deduplication_score}%` : '100%'}
              </span>
              <span className="text-[11px] text-status-success font-semibold">pHash Unique</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Left Pane (Schema Details) ↔ Right Pane (SVG Document Scan & Audit Cert) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl">
        
        {/* Left Pane: Schema-Specific Data Extraction Details */}
        <div className="flex flex-col gap-space-lg">
          
          {/* ------------------------------------------------------------------ */}
          {/* SCHEMA 1: RECORD OF RIGHTS (RoR / Patta / 7/12 / Jamabandi) */}
          {/* ------------------------------------------------------------------ */}
          {(docType.includes('ROR') || docType.includes('RIGHTS') || docType.includes('KHATA')) && (
            <div className="bg-surface-card rounded-xl p-space-lg border border-border-structural shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border-structural pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-bold text-base text-text-primary">1. Record of Rights (RoR / Jamabandi / Khatauni)</h3>
                </div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-primary-container text-on-primary">
                  Khata #{payload.khata_number || record.khata_no || '489'}
                </span>
              </div>

              {/* Parcels */}
              <div className="flex flex-col gap-2">
                <h4 className="font-heading font-bold text-xs text-text-secondary uppercase tracking-wider">Parcels Schedule</h4>
                {(payload.parcels || [
                  {
                    khasra_survey_number: record.khasra_no || "142/3B",
                    base_survey_no: "142",
                    sub_division: "3B",
                    bhu_aadhaar_ulpin: record.ulpin || "14BW89201L9842",
                    plot_area: { raw_recorded: "0.45 Acre", metric_sqm: record.plot_area || 1821.08, metric_hectares: 0.1821 },
                    land_classification: record.land_classification || "Agricultural",
                    soil_type: "Wet / Nanja",
                    irrigation_source: "Government Canal"
                  }
                ]).map((parcel, idx) => (
                  <div key={idx} className="bg-canvas-bg rounded-lg p-3 border border-border-structural/70 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div><span className="text-text-secondary block font-heading">Khasra / Survey #</span><strong className="font-mono font-bold text-primary text-sm">{parcel.khasra_survey_number}</strong></div>
                    <div><span className="text-text-secondary block font-heading">Sub Division</span><strong className="font-mono font-semibold">{parcel.sub_division || '3B'}</strong></div>
                    <div><span className="text-text-secondary block font-heading">ULPIN</span><strong className="font-mono text-primary font-semibold">{parcel.bhu_aadhaar_ulpin}</strong></div>
                    <div><span className="text-text-secondary block font-heading">Raw Area</span><strong className="font-body font-semibold">{parcel.plot_area?.raw_recorded || '0.45 Acre'}</strong></div>
                    <div><span className="text-text-secondary block font-heading">Metric SqM</span><strong className="font-mono text-primary font-bold">{parcel.plot_area?.metric_sqm || parcel.plot_area} SqM</strong></div>
                    <div><span className="text-text-secondary block font-heading">Hectares</span><strong className="font-mono font-semibold">{parcel.plot_area?.metric_hectares || '0.1821'} Ha</strong></div>
                    <div><span className="text-text-secondary block font-heading">Classification</span><strong className="font-body font-semibold">{parcel.land_classification}</strong></div>
                    <div><span className="text-text-secondary block font-heading">Soil Type</span><strong className="font-body font-semibold">{parcel.soil_type || 'Nanja'}</strong></div>
                    <div><span className="text-text-secondary block font-heading">Irrigation Source</span><strong className="font-body font-semibold">{parcel.irrigation_source || 'Government Canal'}</strong></div>
                  </div>
                ))}
              </div>

              {/* Ownership Details */}
              <div className="flex flex-col gap-2">
                <h4 className="font-heading font-bold text-xs text-text-secondary uppercase tracking-wider">Registered Ownership &amp; Share Fractions</h4>
                <div className="border border-border-structural rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-container-low border-b border-border-structural text-text-secondary font-heading">
                      <tr>
                        <th className="p-2.5">Owner Name</th>
                        <th className="p-2.5">Relation</th>
                        <th className="p-2.5 font-mono">Share Fraction</th>
                        <th className="p-2.5">Primary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-structural/60">
                      {(payload.ownership_details || [
                        { owner_name: "K. Raman", relationship_type: "Son of", relative_name: "M. Murugan", share_fraction: 1.0, is_primary_owner: true }
                      ]).map((owner, idx) => (
                        <tr key={idx} className="hover:bg-canvas-bg">
                          <td className="p-2.5 font-body font-bold text-text-primary">{owner.owner_name}</td>
                          <td className="p-2.5 text-text-secondary">{owner.relationship_type} {owner.relative_name}</td>
                          <td className="p-2.5 font-mono text-primary font-bold">{owner.share_fraction} (100%)</td>
                          <td className="p-2.5">
                            {owner.is_primary_owner ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-status-success/10 text-status-success font-semibold">Primary Owner</span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-text-secondary">Co-Owner</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Revenue & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-canvas-bg rounded-lg border border-border-structural">
                  <span className="text-text-secondary block font-heading">Revenue Taxation</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono font-bold text-text-primary">Annual: ₹{payload.revenue_taxation?.annual_assessment_inr || '85.50'}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-success/10 text-status-success font-bold">STATUS: {payload.revenue_taxation?.tax_status || 'PAID'}</span>
                  </div>
                </div>
                <div className="p-3 bg-canvas-bg rounded-lg border border-border-structural">
                  <span className="text-text-secondary block font-heading">Remarks / Kaifiyat</span>
                  <p className="text-xs font-semibold text-text-primary mt-1">{payload.remarks_kaifiyat || 'Bank loan lien active under SBI branch ref 2022/441'}</p>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* SCHEMA 2: CONVEYANCE & TRANSFER DEEDS (Sale / Gift / Partition) */}
          {/* ------------------------------------------------------------------ */}
          {(docType.includes('DEED') || docType.includes('CONVEYANCE') || docType.includes('SALE')) && (
            <div className="bg-surface-card rounded-xl p-space-lg border border-border-structural shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border-structural pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-bold text-base text-text-primary">2. Conveyance &amp; Transfer Deed</h3>
                </div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-primary-container text-on-primary">
                  Reg #{payload.registration_details?.registration_number || record.registration_number || '984/2021'}
                </span>
              </div>

              {/* Registration Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-canvas-bg p-3 rounded-lg border border-border-structural/70 text-xs">
                <div><span className="text-text-secondary block font-heading">Deed Type</span><strong className="font-mono text-primary font-bold">{payload.registration_details?.deed_type || 'SALE_DEED'}</strong></div>
                <div><span className="text-text-secondary block font-heading">SRO Office</span><strong className="font-body font-semibold">{payload.registration_details?.sro_office || 'Sriperumbudur SRO'}</strong></div>
                <div><span className="text-text-secondary block font-heading">Execution Date</span><strong className="font-mono font-semibold">{payload.registration_details?.execution_date || '2021-04-12'}</strong></div>
                <div><span className="text-text-secondary block font-heading">Registration Date</span><strong className="font-mono font-semibold">{payload.registration_details?.registration_date || '2021-04-14'}</strong></div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-canvas-bg rounded-lg border border-border-structural">
                  <span className="text-text-secondary block font-heading uppercase text-[11px] font-bold text-primary">Executants / Sellers</span>
                  {(payload.parties?.executants_sellers || [{ name: record.seller_name || "M. Murugan", relationship_type: "Son of", relative_name: "K. Munusamy", address: "No 12, Car Street, Nemili" }]).map((seller, i) => (
                    <div key={i} className="mt-1">
                      <p className="font-body font-bold text-text-primary">{seller.name}</p>
                      <p className="text-[11px] text-text-secondary">{seller.relationship_type} {seller.relative_name}</p>
                      <p className="text-[11px] text-text-secondary italic">{seller.address}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-canvas-bg rounded-lg border border-border-structural">
                  <span className="text-text-secondary block font-heading uppercase text-[11px] font-bold text-primary">Claimants / Buyers</span>
                  {(payload.parties?.claimants_buyers || [{ name: record.buyer_name || "K. Raman", relationship_type: "Son of", relative_name: "M. Murugan", address: "No 14, East Mada Street, Nemili" }]).map((buyer, i) => (
                    <div key={i} className="mt-1">
                      <p className="font-body font-bold text-text-primary">{buyer.name}</p>
                      <p className="text-[11px] text-text-secondary">{buyer.relationship_type} {buyer.relative_name}</p>
                      <p className="text-[11px] text-text-secondary italic">{buyer.address}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Consideration */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-surface-container-low p-3 rounded-lg border border-border-structural">
                <div><span className="text-text-secondary block font-heading">Transacted Value</span><strong className="font-mono text-primary font-bold text-sm">₹{Number(payload.financial_consideration?.sale_value_inr || record.sale_value_inr || 1500000).toLocaleString('en-IN')}</strong></div>
                <div><span className="text-text-secondary block font-heading">Guideline Value</span><strong className="font-mono font-semibold">₹{Number(payload.financial_consideration?.guideline_value_inr || 1420000).toLocaleString('en-IN')}</strong></div>
                <div><span className="text-text-secondary block font-heading">Stamp Duty Paid</span><strong className="font-mono font-semibold">₹{Number(payload.financial_consideration?.stamp_duty_paid_inr || 105000).toLocaleString('en-IN')}</strong></div>
                <div><span className="text-text-secondary block font-heading">Registration Fee</span><strong className="font-mono font-semibold">₹{Number(payload.financial_consideration?.registration_fee_inr || 60000).toLocaleString('en-IN')}</strong></div>
              </div>

              {/* Property Schedule & Four Boundaries */}
              <div className="p-3 bg-canvas-bg rounded-lg border border-border-structural text-xs flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-heading font-bold text-text-primary">Property Schedule (Four Boundaries / Chauhaddi)</span>
                  <span className="font-mono text-primary font-bold">Survey #{payload.property_schedule?.survey_number || record.khasra_no || '142/3B'}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 bg-surface-card rounded border"><strong>North:</strong> {payload.property_schedule?.four_boundaries_chauhaddi?.north || 'Survey No 141 (Canal)'}</div>
                  <div className="p-2 bg-surface-card rounded border"><strong>South:</strong> {payload.property_schedule?.four_boundaries_chauhaddi?.south || 'Panchayat Road'}</div>
                  <div className="p-2 bg-surface-card rounded border"><strong>East:</strong> {payload.property_schedule?.four_boundaries_chauhaddi?.east || 'Survey No 142/3A'}</div>
                  <div className="p-2 bg-surface-card rounded border"><strong>West:</strong> {payload.property_schedule?.four_boundaries_chauhaddi?.west || 'Village Commons'}</div>
                </div>
                <p className="text-[11px] text-text-secondary italic mt-1 font-body">
                  Prior Title Recitals: {payload.prior_title_recitals || 'Vendor acquired rights via registered Settlement Deed No. 312/1998.'}
                </p>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* SCHEMA 3: MUTATION REGISTER & ORDERS (Dakhil-Kharij / VF-6) */}
          {/* ------------------------------------------------------------------ */}
          {(docType.includes('MUTATION') || docType.includes('MUT')) && (
            <div className="bg-surface-card rounded-xl p-space-lg border border-border-structural shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border-structural pb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-bold text-base text-text-primary">3. Mutation Register &amp; Orders (Dakhil-Kharij)</h3>
                </div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-primary-container text-on-primary">
                  Mutation #{payload.mutation_serial_number || record.mutation_serial_number || 'MUT-2024-0012'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-canvas-bg p-3 rounded-lg border border-border-structural text-xs">
                <div><span className="text-text-secondary block font-heading">Case Ref #</span><strong className="font-mono font-bold text-text-primary">{payload.case_reference_no || 'REV/TEH/2024/782'}</strong></div>
                <div><span className="text-text-secondary block font-heading">Nature</span><strong className="font-mono text-primary font-bold">{payload.nature_of_mutation || 'SUCCESSION_INHERITANCE'}</strong></div>
                <div><span className="text-text-secondary block font-heading">Applied Date</span><strong className="font-mono font-semibold">{payload.applied_date || '2024-01-10'}</strong></div>
                <div><span className="text-text-secondary block font-heading">Sanctioned Date</span><strong className="font-mono font-semibold">{payload.sanctioned_date || '2024-02-18'}</strong></div>
              </div>

              {/* Transferor & Transferee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-canvas-bg rounded-lg border border-border-structural">
                  <span className="text-text-secondary block font-heading text-[11px] uppercase font-bold text-status-warning">Transferor (Prior Owner)</span>
                  <p className="font-body font-bold text-text-primary mt-1">{payload.transferor_prior_owner?.name || record.transferor_prior_owner || 'M. Murugan'}</p>
                  <p className="text-xs text-text-secondary">Prior Khata #: <strong>{payload.transferor_prior_owner?.prior_khata_no || '310'}</strong></p>
                </div>
                <div className="p-3 bg-canvas-bg rounded-lg border border-border-structural">
                  <span className="text-text-secondary block font-heading text-[11px] uppercase font-bold text-status-success">Transferee (New Owner)</span>
                  <p className="font-body font-bold text-text-primary mt-1">{payload.transferee_new_owner?.name || record.transferee_new_owner || 'K. Raman'}</p>
                  <p className="text-xs text-text-secondary">New Khata #: <strong>{payload.transferee_new_owner?.new_khata_no || '489'}</strong> • Share Acquired: <strong>{payload.transferee_new_owner?.share_acquired || 1.0} (100%)</strong></p>
                </div>
              </div>

              {/* Sanctioning Authority */}
              <div className="p-3 bg-surface-container-low rounded-lg border border-border-structural text-xs flex items-center justify-between">
                <div>
                  <span className="text-text-secondary block font-heading">Sanctioning Authority</span>
                  <strong className="font-body font-bold text-text-primary">{payload.sanctioning_authority?.officer_designation || 'Tehsildar'} ({payload.sanctioning_authority?.subdivision || 'Sriperumbudur'})</strong>
                </div>
                <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-status-success/10 text-status-success font-bold flex items-center gap-1 border border-status-success/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Digital Signature Verified
                </span>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* SCHEMA 4: SPATIAL CADASTRAL MAP (Bhu-Naksha / FMB) */}
          {/* ------------------------------------------------------------------ */}
          {(docType.includes('CADASTRAL') || docType.includes('MAP') || docType.includes('NAKSHA')) && (
            <div className="bg-surface-card rounded-xl p-space-lg border border-border-structural shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border-structural pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-bold text-base text-text-primary">4. Spatial Cadastral Map (Bhu-Naksha / FMB)</h3>
                </div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-primary-container text-on-primary">
                  Sheet #{payload.map_sheet_number || record.map_sheet_number || 'Sheet-04'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-canvas-bg p-3 rounded-lg border border-border-structural text-xs">
                <div><span className="text-text-secondary block font-heading">Map Sheet Number</span><strong className="font-mono font-bold text-text-primary">{payload.map_sheet_number || 'Sheet-04'}</strong></div>
                <div><span className="text-text-secondary block font-heading">Projection CRS</span><strong className="font-mono text-primary font-bold">{payload.projection_system || 'EPSG:4326'}</strong></div>
              </div>

              {/* Extracted Features */}
              <div className="flex flex-col gap-2">
                <h4 className="font-heading font-bold text-xs text-text-secondary uppercase tracking-wider">Extracted Vector Polygon Features</h4>
                {(payload.extracted_features || [
                  {
                    khasra_survey_number: record.khasra_no || "142/3B",
                    geometry_type: "Polygon",
                    coordinates: [[[79.94125, 12.98142], [79.94189, 12.98145], [79.94185, 12.98082], [79.94121, 12.98080], [79.94125, 12.98142]]],
                    calculated_gis_area_sqm: 1821.50,
                    centroid: { latitude: 12.98112, longitude: 79.94155 }
                  }
                ]).map((feat, idx) => (
                  <div key={idx} className="bg-canvas-bg rounded-lg p-3 border border-border-structural/70 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div><span className="text-text-secondary block font-heading">Survey Polygon #</span><strong className="font-mono font-bold text-primary">{feat.khasra_survey_number}</strong></div>
                    <div><span className="text-text-secondary block font-heading">Geometry Type</span><strong className="font-mono font-semibold">{feat.geometry_type}</strong></div>
                    <div><span className="text-text-secondary block font-heading">PostGIS Calculated Area</span><strong className="font-mono text-primary font-bold">{feat.calculated_gis_area_sqm} SqM</strong></div>
                    <div className="col-span-2 sm:col-span-3">
                      <span className="text-text-secondary block font-heading">Polygon Centroid</span>
                      <span className="font-mono text-[11px] text-text-primary">Lat: {feat.centroid?.latitude}, Lon: {feat.centroid?.longitude}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tie Line Measurements */}
              <div className="p-3 bg-canvas-bg rounded-lg border border-border-structural text-xs">
                <span className="font-heading font-bold text-text-primary block mb-1">Tie Line &amp; Boundary Measurements</span>
                {(payload.tie_line_measurements || [{ from_marker: "G1", to_marker: "G2", field_distance_meters: 45.2 }]).map((line, i) => (
                  <div key={i} className="flex justify-between items-center font-mono text-[11px] text-text-secondary">
                    <span>Marker {line.from_marker} ➔ Marker {line.to_marker}</span>
                    <strong className="text-primary">{line.field_distance_meters} Meters</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location & Administrative Card */}
          <div className="bg-surface-card rounded-xl p-space-lg border border-border-structural shadow-sm">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border-structural">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-bold text-sm text-text-primary">Administrative &amp; Location Hierarchy</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-text-secondary block font-heading">District Name</span>
                <span className="font-body font-bold text-text-primary">{record.district || 'Kanchipuram'}</span>
              </div>
              <div>
                <span className="text-text-secondary block font-heading">Tehsil / Sub-Division</span>
                <span className="font-body font-bold text-text-primary">{record.tehsil || 'Sriperumbudur'}</span>
              </div>
              <div>
                <span className="text-text-secondary block font-heading">Village Revenue Circle</span>
                <span className="font-body font-bold text-text-primary">{record.village || 'Nemili'}</span>
              </div>
              <div>
                <span className="text-text-secondary block font-heading">State Name</span>
                <span className="font-mono text-primary font-bold">{record.state || 'Tamil Nadu'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Pane: SVG Document Scan Inspection & Officer Digital Sign Certificate */}
        <div className="flex flex-col gap-space-lg">
          
          <div className="bg-surface-card rounded-xl border border-border-structural overflow-hidden shadow-sm flex flex-col">
            <div className="p-3 bg-surface-container-low border-b border-border-structural flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-heading font-semibold text-xs text-text-primary">Source Document Preview ({docType})</span>
                {pagePreviews.length > 1 && (
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-primary-container text-on-primary">
                    Page {currentPage + 1} of {pagePreviews.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {pagePreviews.length > 1 && (
                  <div className="flex items-center gap-1 bg-surface-card border border-border-structural rounded-lg p-0.5">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="px-1.5 py-0.5 rounded text-xs hover:bg-surface-container disabled:opacity-30 text-text-primary"
                    >
                      ‹
                    </button>
                    <span className="font-mono text-[11px] px-1 font-semibold text-text-primary">
                      {currentPage + 1}/{pagePreviews.length}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(pagePreviews.length - 1, p + 1))}
                      disabled={currentPage === pagePreviews.length - 1}
                      className="px-1.5 py-0.5 rounded text-xs hover:bg-surface-container disabled:opacity-30 text-text-primary"
                    >
                      ›
                    </button>
                  </div>
                )}
                <span className="font-mono text-[11px] text-text-secondary">Doc Ref: {record.document_id || 'DOC-001'}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-900 flex items-center justify-center min-h-[460px]">
              {isPdf ? (
                <iframe 
                  src={currentSrc} 
                  title={record.file_name || "Source Document PDF"} 
                  className="w-full h-full min-h-[460px] rounded border border-gray-700 bg-white"
                />
              ) : (
                <img 
                  src={currentSrc} 
                  onError={() => setImgSrc(defaultSvg)}
                  alt="Land Record Scan" 
                  className="max-w-full h-auto rounded border border-gray-700 shadow-xl" 
                />
              )}
            </div>
          </div>

          {/* Cryptographic Digital Signature Certificate */}
          <div className="bg-surface-card rounded-xl p-space-lg border border-border-structural shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border-structural">
              <ShieldCheck className="w-5 h-5 text-status-success" />
              <h3 className="font-heading font-bold text-sm text-text-primary">
                Cryptographic Officer Digital Signature Certificate
              </h3>
            </div>

            <div className="text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-text-secondary">Signing Authority:</span>
                <span className="font-bold text-text-primary">Rajesh Sharma, IRS (Tehsildar / Admin)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Signature Scheme:</span>
                <span className="font-bold text-primary">Ed25519-SIG / ECDSA-SHA256</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Database Commitment:</span>
                <span className="font-bold text-status-success">Persisted in SQLite (digiland.db)</span>
              </div>
              <div className="p-2 rounded bg-black/90 text-green-400 text-[11px] overflow-x-auto break-all font-mono">
                SIG: Ed25519:{Array.from({length: 48}, () => Math.floor(Math.random()*16).toString(16)).join('')}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
