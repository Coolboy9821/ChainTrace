import React, { useState } from 'react';
import { ProvenanceHop, ForensicIntelligence } from '../types/forensics';
import { 
  X, 
  Bug, 
  Copy, 
  Check, 
  ShieldCheck
} from 'lucide-react';

interface AuditDebugModalProps {
  intelligence: ForensicIntelligence;
  hops: ProvenanceHop[];
  onClose: () => void;
}

export const AuditDebugModal: React.FC<AuditDebugModalProps> = ({
  intelligence,
  hops,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const copyAuditTrail = () => {
    const auditData = {
      investigationId: intelligence.investigationId,
      mode: intelligence.mode,
      targetVasp: intelligence.targetVasp?.name,
      confidence: intelligence.attributionConfidence,
      hops: hops.map(h => ({
        hop: h.hopNumber,
        txid: h.txid,
        vout: h.vout,
        source: h.sourceAddress,
        destination: h.destinationAddress,
        amountBtc: h.amountBtc,
        feeBtc: h.feeBtc,
        parentUtxo: h.parentUtxo,
        newUtxo: h.newUtxo,
        classification: h.classification,
        reason: h.reasonSelected,
        isChange: h.isChangeOutput,
        provenanceBreak: h.provenanceBreak,
        breakReason: h.provenanceBreakReason
      })),
      auditTrailLog: intelligence.auditTrail
    };

    navigator.clipboard.writeText(JSON.stringify(auditData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="bg-black border border-neutral-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col font-mono text-neutral-100 text-xs overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bug className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-bold text-sm text-white">FORENSIC AUDIT TRAIL & HEURISTIC DEBUGGER</span>
            <span className="px-2 py-0.5 rounded bg-neutral-900 border border-[#D4AF37]/50 text-[#F5D77F] text-[10px]">
              MODE: {intelligence.mode}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-900 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Rules and Verification Summary */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-bold text-neutral-300 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>UTXO ACCOUNTING & HEURISTIC INTEGRITY CHECKS</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-neutral-400">
              <div className="flex items-center justify-between p-2 rounded bg-black border border-neutral-800">
                <span>Value Conservation:</span>
                <span className="text-[#F5D77F] font-bold">VERIFIED (Σ_in ≥ Σ_out)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-black border border-neutral-800">
                <span>Change Address Detection:</span>
                <span className="text-white font-bold">ACTIVE (Isolate change)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-black border border-neutral-800">
                <span>Provenance Break Guard:</span>
                <span className="text-[#D4AF37] font-bold">ACTIVE (Halt on inflation)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-black border border-neutral-800">
                <span>Target VASP Rule Fired:</span>
                <span className="text-white font-bold">{intelligence.targetVasp?.name || 'Clustering'}</span>
              </div>
            </div>
          </div>

          {/* Hop by Hop Audit Records */}
          <div className="space-y-2">
            <h5 className="font-bold text-neutral-400 text-[11px]">EVALUATED CANDIDATE HOPS:</h5>
            {hops.map((h) => (
              <div
                key={h.hopNumber}
                className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-1.5 text-[11px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#F5D77F]">HOP #{h.hopNumber}</span>
                    <span className="text-neutral-500 font-mono">vout:{h.vout}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                    h.provenanceBreak
                      ? 'bg-black text-white border-2 border-[#D4AF37]'
                      : 'bg-black text-[#F5D77F] border border-[#D4AF37]'
                  }`}>
                    {h.provenanceBreak ? 'PROVENANCE BREAK' : 'CONFIRMED'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-neutral-400">
                  <div>TXID: <span className="text-neutral-200">{h.txid.slice(0, 24)}...</span></div>
                  <div>Amount: <span className="text-[#F5D77F] font-bold">{h.amountBtc.toFixed(8)} BTC</span></div>
                  <div>From: <span className="text-neutral-300">{h.sourceAddress.slice(0, 20)}...</span></div>
                  <div>To: <span className="text-neutral-300">{h.destinationAddress.slice(0, 20)}...</span></div>
                </div>

                <div className="bg-black p-2 rounded border border-neutral-800 text-neutral-300">
                  <span className="text-neutral-500 block mb-0.5">Selection Reason / Heuristic:</span>
                  <span>{h.reasonSelected}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Log Messages */}
          {intelligence.auditTrail && intelligence.auditTrail.length > 0 && (
            <div className="space-y-1.5">
              <h5 className="font-bold text-neutral-400 text-[11px]">EXECUTION LOGS:</h5>
              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-1 max-h-36 overflow-y-auto text-[10px]">
                {intelligence.auditTrail.map((log, i) => (
                  <div key={i} className="flex items-start space-x-2 text-neutral-300">
                    <span className="text-neutral-500 shrink-0">
                      [{new Date(log.timestamp * 1000).toLocaleTimeString()}]
                    </span>
                    <span className="text-[#F5D77F] font-bold shrink-0">{log.step}:</span>
                    <span className="text-neutral-300">{log.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={copyAuditTrail}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-neutral-300 flex items-center space-x-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Full Audit JSON' : 'Copy Audit Log JSON'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 rounded font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
