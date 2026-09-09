import React, { useState } from 'react';
import { ProvenanceHop } from '../types/forensics';
import { 
  Clock, 
  ArrowRight, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check 
} from 'lucide-react';

interface ForensicTimelineViewProps {
  hops: ProvenanceHop[];
  onSelectTx?: (txid: string) => void;
  onSelectAddress?: (address: string) => void;
  btcPriceUsd: number;
}

export const ForensicTimelineView: React.FC<ForensicTimelineViewProps> = ({
  hops,
  onSelectTx,
  onSelectAddress,
  btcPriceUsd
}) => {
  const [expandedHop, setExpandedHop] = useState<number | null>(null);
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const copyTxid = (txid: string) => {
    navigator.clipboard.writeText(txid);
    setCopiedTx(txid);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const getClassificationBadge = (hop: ProvenanceHop) => {
    if (hop.provenanceBreak) {
      return 'bg-black text-white border-2 border-[#D4AF37] font-bold';
    }
    switch (hop.classification) {
      case 'suspect':
        return 'bg-black text-white border border-neutral-400';
      case 'vasp':
        return 'bg-[#1a1608] text-[#F5D77F] border border-[#D4AF37]';
      case 'mixer':
      case 'bridge':
        return 'bg-neutral-900 text-[#F5D77F] border border-[#B38F4D]';
      case 'change':
        return 'bg-neutral-900 text-neutral-400 border border-neutral-700';
      default:
        return 'bg-neutral-900 text-neutral-200 border border-neutral-600';
    }
  };

  return (
    <div className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-neutral-100 font-mono text-xs shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="font-bold text-sm tracking-wider text-white">
            FORENSIC UTXO PROVENANCE TIMELINE ({hops.length} HOPS)
          </h3>
        </div>
        <span className="text-[11px] text-neutral-400">
          Chronologically ordered spend provenance
        </span>
      </div>

      <div className="space-y-2.5">
        {hops.map((hop) => {
          const isExpanded = expandedHop === hop.hopNumber;
          const hopUsd = hop.amountBtc * btcPriceUsd;

          return (
            <div
              key={hop.hopNumber}
              className={`border rounded-lg p-3 transition-all ${
                hop.provenanceBreak
                  ? 'bg-black border-2 border-[#D4AF37]'
                  : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Hop Header Row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 border border-[#D4AF37] text-[#F5D77F] flex items-center justify-center font-bold text-[11px]">
                    {hop.hopNumber}
                  </span>
                  <span className="text-neutral-400 text-[11px]">
                    {new Date(hop.timestamp * 1000).toLocaleString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getClassificationBadge(hop)}`}>
                    {hop.provenanceBreak ? 'PROVENANCE BREAK' : hop.entityName ? hop.entityName.toUpperCase() : hop.classification.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="font-bold text-[#F5D77F] text-xs">
                      {hop.amountBtc.toFixed(8)} BTC
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      ≈ ${hopUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  <button
                    onClick={() => setExpandedHop(isExpanded ? null : hop.hopNumber)}
                    className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Source -> Destination Flow Bar */}
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] bg-black p-2 rounded border border-neutral-800">
                <div className="flex items-center space-x-1 truncate max-w-xs">
                  <span className="text-neutral-500">From:</span>
                  <button
                    onClick={() => onSelectAddress?.(hop.sourceAddress)}
                    className="text-[#F5D77F] hover:underline truncate"
                  >
                    {hop.sourceAddress}
                  </button>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-neutral-600 shrink-0 hidden sm:block" />

                <div className="flex items-center space-x-1 truncate max-w-xs">
                  <span className="text-neutral-500">To:</span>
                  <button
                    onClick={() => onSelectAddress?.(hop.destinationAddress)}
                    className="text-white hover:underline truncate"
                  >
                    {hop.destinationAddress}
                  </button>
                </div>
              </div>

              {/* Provenance Break Warning Box */}
              {hop.provenanceBreak && (
                <div className="mt-2 bg-neutral-900 border border-[#D4AF37] p-2.5 rounded text-[#F5D77F] text-[11px] flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-white">FUND PROVENANCE BREAK DETECTED</span>
                    <span>{hop.provenanceBreakReason || hop.reasonSelected}</span>
                  </div>
                </div>
              )}

              {/* Expanded Technical Details */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-neutral-800 space-y-2 text-[11px] bg-black p-2.5 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Transaction ID (txid):</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onSelectTx?.(hop.txid)}
                        className="text-[#F5D77F] hover:underline truncate max-w-sm"
                      >
                        {hop.txid}
                      </button>
                      <button
                        onClick={() => copyTxid(hop.txid)}
                        className="text-neutral-400 hover:text-white"
                      >
                        {copiedTx === hop.txid ? <Check className="w-3 h-3 text-[#D4AF37]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Block Height:</span>
                    <span className="text-neutral-200">#{hop.blockHeight ?? 'Mempool'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Miner Fee:</span>
                    <span className="text-neutral-200">{hop.feeBtc.toFixed(8)} BTC</span>
                  </div>

                  {hop.parentUtxo && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Parent Consumed UTXO:</span>
                      <span className="text-neutral-400 font-mono">{hop.parentUtxo}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-neutral-500 block mb-0.5">Heuristic Selection Reason:</span>
                    <p className="text-neutral-300 bg-neutral-900 p-1.5 rounded border border-neutral-800">
                      {hop.reasonSelected}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
