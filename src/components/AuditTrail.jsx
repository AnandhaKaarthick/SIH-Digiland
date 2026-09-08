import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Key, 
  History, 
  RefreshCw, 
  FileCheck, 
  AlertCircle,
  Hash
} from 'lucide-react';
import { MOCK_AUDIT_TRAIL } from '../data/mockData';

export default function AuditTrail() {
  const [auditList, setAuditList] = useState(MOCK_AUDIT_TRAIL);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerifyChain = () => {
    setVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      setVerifying(false);
      setVerificationResult({
        valid: true,
        blocksCount: auditList.length,
        verifiedAt: new Date().toLocaleTimeString(),
        genesisHash: auditList[0].previous_hash,
        latestHash: auditList[auditList.length - 1].current_hash
      });
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-space-xl max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary">Compliance & Non-Repudiation</span>
          <h1 className="font-heading font-bold text-2xl text-text-primary tracking-tight">Cryptographic Audit Trail</h1>
          <p className="text-xs text-text-secondary mt-1">
            Immutable SHA-256 hash-chained history ledger with revenue officer ECDSA digital signatures.
          </p>
        </div>

        <button 
          onClick={handleVerifyChain}
          disabled={verifying}
          className="px-4 py-2 rounded-lg bg-tertiary text-on-tertiary font-heading text-xs font-semibold hover:bg-tertiary-container transition-colors shadow-sm flex items-center gap-2"
        >
          {verifying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Verifying SHA-256 Hash Chain...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" /> Verify Chain Integrity
            </>
          )}
        </button>
      </div>

      {/* Chain Integrity Verification Result Banner */}
      {verificationResult && (
        <div className="bg-status-success/10 border-l-4 border-status-success p-4 rounded-r-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-status-success shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <div>
              <h4 className="font-heading font-bold text-sm text-status-success">SHA-256 Hash Chain Verified Intact</h4>
              <p className="text-xs text-text-secondary mt-0.5">
                All {verificationResult.blocksCount} blocks verified at {verificationResult.verifiedAt}. Zero data tampering detected across append-only history.
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] px-3 py-1 bg-surface-card rounded border border-status-success/30 text-text-primary">
            Latest Hash: {verificationResult.latestHash.slice(0, 16)}...
          </span>
        </div>
      )}

      {/* Hash-Chained Timeline Ledger */}
      <div className="bg-surface-card rounded-xl p-space-xl shadow-sm border border-border-structural flex flex-col gap-space-lg">
        <h3 className="font-heading font-bold text-sm text-text-primary pb-space-xs border-b border-border-structural flex items-center gap-2">
          <Hash className="w-4 h-4 text-tertiary" /> Immutable Event Blocks Ledger
        </h3>

        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-structural">
          {auditList.map((item, idx) => (
            <div key={item.history_id} className="relative group">
              {/* Timeline Marker Dot */}
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-surface-card border-2 border-tertiary flex items-center justify-center text-[10px] font-mono font-bold text-tertiary shadow-sm">
                {idx + 1}
              </div>

              {/* Event Card */}
              <div className="bg-canvas-bg p-space-lg rounded-xl border border-border-structural/80 hover:border-tertiary/60 transition-all flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-structural/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{item.record_id}</span>
                    <span className="font-heading text-xs font-semibold px-2 py-0.5 rounded bg-tertiary/10 text-tertiary">
                      {item.action}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-text-secondary">{item.timestamp}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-text-secondary block font-semibold mb-0.5">Field Changed:</span>
                    <span className="font-mono text-text-primary bg-surface-card px-2 py-1 rounded border border-border-structural block">
                      {item.field_changed}
                    </span>
                  </div>

                  <div>
                    <span className="text-text-secondary block font-semibold mb-0.5">Mutation / Correction:</span>
                    <span className="font-body text-text-primary bg-surface-card px-2 py-1 rounded border border-border-structural block">
                      {item.new_value}
                    </span>
                  </div>
                </div>

                {/* Cryptographic Block Metadata Bar */}
                <div className="bg-surface-card p-3 rounded-lg border border-border-structural/60 font-mono text-[11px] flex flex-col gap-1">
                  <div className="flex flex-wrap items-center justify-between text-text-secondary">
                    <span><strong>Previous Block Hash:</strong> {item.previous_hash}</span>
                    <span><strong>Verified By:</strong> {item.actor_name}</span>
                  </div>
                  <div className="text-tertiary font-semibold">
                    <strong>Current Block Hash:</strong> {item.current_hash}
                  </div>
                  <div className="text-status-success font-semibold flex items-center gap-1 mt-1">
                    <Lock className="w-3 h-3" />
                    <span><strong>Digital Signature:</strong> {item.digital_signature}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
