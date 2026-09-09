import React from 'react';
import { 
  ForensicIntelligence, 
  ProvenanceHop 
} from '../types/forensics';
import { 
  ShieldCheck, 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  Download, 
  FolderPlus, 
  Bug, 
  Building
} from 'lucide-react';

interface ForensicIntelligencePanelProps {
  intelligence: ForensicIntelligence;
  hops: ProvenanceHop[];
  onOpenSeizureModal: () => void;
  onDownloadGraphJson: () => void;
  onSaveToDrive: () => void;
  onOpenAuditModal: () => void;
  btcPriceUsd: number;
}

export const ForensicIntelligencePanel: React.FC<ForensicIntelligencePanelProps> = ({
  intelligence,
  hops,
  onOpenSeizureModal,
  onDownloadGraphJson,
  onSaveToDrive,
  onOpenAuditModal,
  btcPriceUsd
}) => {
  const getStatusBadge = (status: ForensicIntelligence['status']) => {
    switch (status) {
      case 'ATTRIBUTED':
        return 'bg-black text-[#F5D77F] border border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.2)]';
      case 'PROVENANCE_BREAK':
        return 'bg-black text-white border-2 border-[#D4AF37] font-bold';
      case 'ANALYZING':
      case 'IN_PROGRESS':
        return 'bg-neutral-900 text-[#F5D77F] border border-neutral-700 animate-pulse';
      case 'NO_OUTBOUND':
        return 'bg-neutral-900 text-neutral-400 border border-neutral-800';
      default:
        return 'bg-neutral-900 text-neutral-300 border border-neutral-700';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-white bg-black border-2 border-white font-bold';
    if (score >= 50) return 'text-[#F5D77F] bg-neutral-950 border border-[#D4AF37]';
    return 'text-neutral-200 bg-neutral-950 border border-neutral-600';
  };

  const initialUsd = intelligence.initialTracedAmountBtc * btcPriceUsd;
  const currentUsd = intelligence.currentTracedAmountBtc * btcPriceUsd;

  return (
    <div className="w-full bg-black border border-neutral-800 rounded-xl p-4 flex flex-col space-y-4 shadow-2xl text-neutral-100 font-mono">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="font-bold text-sm tracking-wide text-white">FORENSIC INTELLIGENCE</h3>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${getStatusBadge(intelligence.status)}`}>
          {intelligence.status}
        </span>
      </div>

      {/* Target VASP Card */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3">
        <div className="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
          <span>ATTRIBUTED VASP CANDIDATE:</span>
          <span className="text-[10px] text-[#F5D77F] font-bold">
            {intelligence.targetVasp ? intelligence.targetVasp.verificationStatus : 'NO VERIFIED VASP'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h4 className="text-base font-bold text-white">
                {intelligence.targetVasp?.name || 'Unattributed Entity'}
              </h4>
              <p className="text-[11px] text-neutral-400">
                {intelligence.targetVasp?.country || 'Jurisdiction Pending'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-[#F5D77F]">
              {intelligence.attributionConfidence}%
            </span>
            <p className="text-[10px] text-neutral-500">Confidence</p>
          </div>
        </div>

        {/* Confidence Progress Bar */}
        <div className="w-full bg-neutral-900 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#B38F4D] via-[#D4AF37] to-[#F5D77F] h-full rounded-full transition-all duration-700" 
            style={{ width: `${intelligence.attributionConfidence}%` }}
          />
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Traced Amounts */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5">
          <span className="text-[10px] text-neutral-400 block mb-1">INITIAL TRACED</span>
          <div className="font-bold text-sm text-[#F5D77F]">
            {intelligence.initialTracedAmountBtc.toFixed(6)} BTC
          </div>
          <div className="text-[10px] text-neutral-500">
            ≈ ${initialUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5">
          <span className="text-[10px] text-neutral-400 block mb-1">CURRENT AT TERMINUS</span>
          <div className="font-bold text-sm text-white">
            {intelligence.currentTracedAmountBtc.toFixed(6)} BTC
          </div>
          <div className="text-[10px] text-neutral-500">
            ≈ ${currentUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Hops & Forwarded */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5">
          <span className="text-[10px] text-neutral-400 block mb-1">INVESTIGATION HOPS</span>
          <div className="font-bold text-sm text-white">
            Hop {intelligence.currentHop} / {intelligence.totalHops}
          </div>
          <div className="text-[10px] text-neutral-500">
            {intelligence.transactionsAnalyzedCount} TXs Analyzed
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5">
          <span className="text-[10px] text-neutral-400 block mb-1">RISK ASSESSMENT</span>
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRiskScoreColor(intelligence.riskScore)}`}>
              Score: {intelligence.riskScore}/100
            </span>
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">
            {intelligence.walletsAnalyzedCount} Wallets Scanned
          </div>
        </div>
      </div>

      {/* Movement Timestamps */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-[11px] space-y-1">
        <div className="flex items-center justify-between text-neutral-400">
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-[#D4AF37]" />
            <span>First Movement:</span>
          </span>
          <span className="text-neutral-200">
            {intelligence.firstMovementTimestamp ? new Date(intelligence.firstMovementTimestamp * 1000).toLocaleDateString() : 'N/A'}
          </span>
        </div>
        <div className="flex items-center justify-between text-neutral-400">
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span>Last Movement:</span>
          </span>
          <span className="text-neutral-200">
            {intelligence.lastMovementTimestamp ? new Date(intelligence.lastMovementTimestamp * 1000).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>

      {/* Evidence Breakdown */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-neutral-300">
          <span className="font-semibold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Cryptographic Evidence ({intelligence.evidenceCount}):</span>
          </span>
        </div>
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 max-h-36 overflow-y-auto space-y-1.5 text-[11px]">
          {intelligence.evidenceList.map((ev, i) => (
            <div key={i} className="flex items-start space-x-1.5 text-neutral-300">
              <span className="text-[#F5D77F] font-bold shrink-0">#{i + 1}</span>
              <span className="leading-tight">{ev}</span>
            </div>
          ))}
          {intelligence.evidenceList.length === 0 && (
            <p className="text-neutral-500 italic">No conclusive evidence recorded yet.</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-neutral-800 grid grid-cols-2 gap-2 text-xs">
        <button
          id="export-seizure-btn"
          onClick={onOpenSeizureModal}
          className="px-3 py-2 bg-gradient-to-r from-[#D4AF37] via-[#F5D77F] to-[#B38F4D] hover:brightness-110 text-black font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-md"
          title="Generates legal-grade Asset Seizure & Freezing Notice for SIH #26182"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-black" />
          <span>Seizure Order</span>
        </button>

        <button
          id="save-drive-btn"
          onClick={onSaveToDrive}
          className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 hover:border-[#D4AF37] rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
          title="Saves forensic evidence package directly to user's Google Drive"
        >
          <FolderPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="font-semibold">Save to Drive</span>
        </button>

        <button
          id="download-graph-btn"
          onClick={onDownloadGraphJson}
          className="px-3 py-2 bg-neutral-950 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 hover:border-neutral-600 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
          title="Exports entire forensic graph & hops as JSON"
        >
          <Download className="w-3.5 h-3.5 text-neutral-400" />
          <span>Export JSON</span>
        </button>

        <button
          id="audit-trail-btn"
          onClick={onOpenAuditModal}
          className="px-3 py-2 bg-neutral-950 hover:bg-neutral-850 text-[#F5D77F] border border-[#D4AF37]/50 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
          title="Exposes parent UTXO math, hash validation, and attribution rules"
        >
          <Bug className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Audit Debug</span>
        </button>
      </div>
    </div>
  );
};
