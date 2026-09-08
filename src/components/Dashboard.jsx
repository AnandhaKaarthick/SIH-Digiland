import React from 'react';
import { 
  FileText, 
  SpellCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Upload, 
  ShieldCheck, 
  ArrowUpRight,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { MOCK_LAND_RECORDS } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard({ onNavigateToReview, onNavigateToUpload }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-space-xl max-w-[1720px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary tracking-tight">{t('nav_dashboard')}</h1>
          <p className="text-xs text-text-secondary mt-1">
            Digitization throughput, validation accuracy, and pending verification queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onNavigateToUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-heading text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            {t('nav_document_upload')}
          </button>
        </div>
      </div>

      {/* Top 4 Essential Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-lg">
        {/* Metric 1 */}
        <div className="rounded-xl p-space-lg bg-surface-container-low shadow-sm border border-border-structural flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-heading text-[10px] uppercase tracking-wider text-text-secondary font-semibold">DIGITIZATION</span>
              <span className="font-heading font-semibold text-sm text-text-primary block mt-0.5">{t('documents_processed')}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-surface-card flex items-center justify-center text-primary shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-bold text-3xl text-text-primary">14,892</span>
              <span className="font-mono text-xs text-status-success font-semibold">+12.4%</span>
            </div>
            <span className="text-xs text-text-secondary mt-1 block">Weekly increment: +1,640</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl p-space-lg bg-surface-card shadow-sm border border-border-structural flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-status-info"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-heading text-[10px] uppercase tracking-wider text-text-secondary font-semibold">OCR &amp; NLP</span>
              <span className="font-heading font-semibold text-sm text-text-primary block mt-0.5">{t('extraction_accuracy')}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-status-info shadow-sm">
              <SpellCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-bold text-3xl text-text-primary">98.42%</span>
              <span className="font-mono text-xs text-status-success font-semibold">High Conf</span>
            </div>
            <span className="text-xs text-text-secondary mt-1 block">Handwritten OCR: 94.10%</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl p-space-lg bg-surface-card shadow-sm border border-border-structural flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-status-warning"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-heading text-[10px] uppercase tracking-wider text-text-secondary font-semibold">HITL REVIEW</span>
              <span className="font-heading font-semibold text-sm text-text-primary block mt-0.5">{t('pending_queue')}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-status-warning shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-bold text-3xl text-text-primary">14</span>
              <span className="font-mono text-xs text-status-warning font-semibold">Needs Action</span>
            </div>
            <span className="text-xs text-text-secondary mt-1 block">Critical Flags: 3</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl p-space-lg bg-surface-card shadow-sm border border-border-structural flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-primary"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-heading text-[10px] uppercase tracking-wider text-text-secondary font-semibold">CADASTRAL GIS</span>
              <span className="font-heading font-semibold text-sm text-text-primary block mt-0.5">{t('parcels_mapped')}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shadow-sm">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-bold text-3xl text-text-primary">91.80%</span>
              <span className="font-mono text-xs text-status-success font-semibold">Lucknow</span>
            </div>
            <span className="text-xs text-text-secondary mt-1 block">Verified Parcels: 130k</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Queue + Validation Triage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-xl">
        {/* Pending Queue Widget */}
        <div className="lg:col-span-2 bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-structural flex flex-col">
          <div className="flex items-center justify-between pb-space-md border-b border-border-structural">
            <div>
              <h2 className="font-heading font-bold text-base text-text-primary">{t('pending_queue')}</h2>
              <p className="text-xs text-text-secondary mt-0.5">Records requiring human review with status-first left-border indicators</p>
            </div>
            <button 
              onClick={onNavigateToReview}
              className="flex items-center gap-1 text-xs font-heading font-semibold text-primary hover:text-primary-container"
            >
              View Queue <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-border-structural/60 mt-space-md">
            {MOCK_LAND_RECORDS.map((record) => {
              const borderClass = 
                record.status_flag === 'VALID' ? 'status-border-valid' :
                record.status_flag === 'FLAGGED_WARNING' ? 'status-border-flagged' : 'status-border-error';

              const badgeColor = 
                record.status_flag === 'VALID' ? 'bg-status-success/10 text-status-success border-status-success/20' :
                record.status_flag === 'FLAGGED_WARNING' ? 'bg-status-warning/10 text-status-warning border-status-warning/20' : 'bg-status-error/10 text-status-error border-status-error/20';

              return (
                <div 
                  key={record.id} 
                  className={`p-4 bg-surface-card hover:bg-surface-container-low transition-all rounded-r-lg ${borderClass} flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-2 border-t border-r border-b border-border-structural/40`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-text-primary">Khasra #{record.khasra_no}</span>
                      <span className="text-xs text-text-secondary">• Khata #{record.khata_no}</span>
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${badgeColor}`}>
                        {record.confidence_score}% ({record.status_flag})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary mt-1">
                      <span><strong>Village:</strong> {record.village}</span>
                      <span><strong>Owner:</strong> {record.owner_names.join(', ')}</span>
                      <span><strong>Area:</strong> {record.plot_area} sqm</span>
                    </div>

                    {record.warning_reason && (
                      <p className="text-[11px] text-status-warning mt-1 flex items-center gap-1 font-mono">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        {record.warning_reason}
                      </p>
                    )}

                    {record.error_reason && (
                      <p className="text-[11px] text-status-error mt-1 flex items-center gap-1 font-mono">
                        <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {record.error_reason}
                      </p>
                    )}
                  </div>

                  <button 
                    onClick={() => onNavigateToReview(record)}
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-heading text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm flex-shrink-0"
                  >
                    Review & Sign
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validation Breakdown */}
        <div className="flex flex-col gap-space-lg">
          <div className="bg-surface-card rounded-xl p-space-lg shadow-sm border border-border-structural flex flex-col">
            <h3 className="font-heading font-bold text-sm text-text-primary pb-space-xs border-b border-border-structural">
              Validation Engine Triage
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-status-success font-semibold">VALID (Auto-Approved ≥ 85%)</span>
                  <span className="font-mono text-text-primary">82.4%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-status-success rounded-full" style={{ width: '82.4%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-status-warning font-semibold">FLAGGED (Review Queue 60-84%)</span>
                  <span className="font-mono text-text-primary">12.1%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-status-warning rounded-full" style={{ width: '12.1%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-status-error font-semibold">FAILED (Critical Reject &lt; 60%)</span>
                  <span className="font-mono text-text-primary">5.5%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-status-error rounded-full" style={{ width: '5.5%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-space-lg shadow-sm border border-border-structural flex flex-col justify-between">
            <div>
              <span className="font-heading text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Quick Action</span>
              <h4 className="font-heading font-bold text-sm text-primary mt-1">Ingest Upstream JSON</h4>
              <p className="text-xs text-text-secondary mt-1">
                Upload extracted JSON payloads directly from your teammate's OCR module.
              </p>
            </div>
            <button 
              onClick={onNavigateToUpload}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-primary text-on-primary font-heading text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              Upload Payload <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
