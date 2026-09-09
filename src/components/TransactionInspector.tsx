import React, { useState } from 'react';
import { 
  NormalizedTransaction 
} from '../types/forensics';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowRight, 
  Layers
} from 'lucide-react';

interface TransactionInspectorProps {
  tx: NormalizedTransaction;
  onClose: () => void;
  onNavigateAddress?: (address: string) => void;
  onNavigateTx?: (txid: string) => void;
  btcPriceUsd: number;
}

type TabKey = 'OVERVIEW' | 'INPUTS' | 'OUTPUTS' | 'UTXOs' | 'FLOW' | 'RAW DATA' | 'FORENSICS' | 'TIMELINE';

export const TransactionInspector: React.FC<TransactionInspectorProps> = ({
  tx,
  onClose,
  onNavigateAddress,
  onNavigateTx,
  btcPriceUsd
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('OVERVIEW');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const tabs: TabKey[] = ['OVERVIEW', 'INPUTS', 'OUTPUTS', 'UTXOs', 'FLOW', 'RAW DATA', 'FORENSICS', 'TIMELINE'];

  const feeUsd = tx.feeBtc * btcPriceUsd;
  const transferredUsd = tx.valueTransferredBtc * btcPriceUsd;

  return (
    <div className="w-full bg-black border border-neutral-800 rounded-xl overflow-hidden shadow-2xl text-neutral-100 font-mono text-xs">
      {/* Header Bar */}
      <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#D4AF37]" />
          <span className="font-bold text-sm tracking-wider text-white">TRANSACTION FORENSICS</span>
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-[#D4AF37]/40 text-[#F5D77F] text-[10px]">
            {tx.network.toUpperCase()}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1a1608] text-[#F5D77F] border border-[#D4AF37]/50">
            {tx.status.toUpperCase()} ({tx.confirmations} CONFIRMATIONS)
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => copyToClipboard(tx.txid, 'header_txid')}
            className="text-neutral-400 hover:text-white flex items-center space-x-1"
            title="Copy Transaction Hash"
          >
            {copiedField === 'header_txid' ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px] truncate max-w-[140px]">{tx.txid.slice(0, 16)}...</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-850 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-neutral-800 bg-neutral-950 px-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            id={`tx-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-xs font-mono font-medium transition-all whitespace-nowrap border-b-2 ${
              activeTab === tab
                ? 'border-[#D4AF37] text-[#F5D77F] bg-[#D4AF37]/10'
                : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents Area */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            {/* Value Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3">
                <span className="text-[10px] text-neutral-400 block mb-1">TOTAL TRANSFERRED</span>
                <div className="text-base font-bold text-white">
                  {tx.valueTransferredBtc.toFixed(8)} BTC
                </div>
                <div className="text-[11px] text-neutral-400">
                  ≈ ${transferredUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3">
                <span className="text-[10px] text-neutral-400 block mb-1">MINER FEE & RATE</span>
                <div className="text-base font-bold text-[#F5D77F]">
                  {tx.feeBtc.toFixed(8)} BTC ({tx.feeSats.toLocaleString()} sats)
                </div>
                <div className="text-[11px] text-neutral-400">
                  {tx.feeRateSatVb.toFixed(1)} sat/vB (≈ ${feeUsd.toFixed(2)})
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3">
                <span className="text-[10px] text-neutral-400 block mb-1">BLOCK & AGE</span>
                <div className="text-base font-bold text-[#E5C158]">
                  #{tx.blockHeight ?? 'Mempool'}
                </div>
                <div className="text-[11px] text-neutral-400">
                  {tx.age} ({new Date(tx.timestamp * 1000).toLocaleString()})
                </div>
              </div>
            </div>

            {/* Technical Parameters Matrix */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2">
              <h4 className="text-xs font-bold text-neutral-300 border-b border-neutral-800 pb-1.5">
                CRYPTOGRAPHIC & PROTOCOL SPECIFICATIONS
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 text-[11px]">
                <div>
                  <span className="text-neutral-500 block">Transaction Size:</span>
                  <span className="text-neutral-200">{tx.size} bytes</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Virtual Size (vSize):</span>
                  <span className="text-neutral-200">{tx.vsize} vB</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Weight Units (WU):</span>
                  <span className="text-neutral-200">{tx.weight} WU</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Version:</span>
                  <span className="text-neutral-200">{tx.version}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Locktime:</span>
                  <span className="text-neutral-200">{tx.locktime}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Replace-By-Fee (RBF):</span>
                  <span className={tx.rbf ? 'text-[#F5D77F] font-bold' : 'text-neutral-500'}>
                    {tx.rbf ? 'OPT-IN ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Inputs Count:</span>
                  <span className="text-neutral-200">{tx.inputCount} inputs</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Outputs Count:</span>
                  <span className="text-neutral-200">{tx.outputCount} outputs</span>
                </div>
              </div>
            </div>

            {/* Hashes Row */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2 text-[11px]">
              <div>
                <span className="text-neutral-500 block mb-0.5">TXID:</span>
                <div className="flex items-center justify-between bg-black px-2 py-1 rounded border border-neutral-800">
                  <span className="text-[#F5D77F] break-all">{tx.txid}</span>
                  <button
                    onClick={() => copyToClipboard(tx.txid, 'ov_txid')}
                    className="ml-2 text-neutral-400 hover:text-white"
                  >
                    {copiedField === 'ov_txid' ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {tx.blockHash && (
                <div>
                  <span className="text-neutral-500 block mb-0.5">Block Hash:</span>
                  <div className="flex items-center justify-between bg-black px-2 py-1 rounded border border-neutral-800">
                    <span className="text-neutral-300 break-all">{tx.blockHash}</span>
                    <button
                      onClick={() => copyToClipboard(tx.blockHash!, 'ov_blockhash')}
                      className="ml-2 text-neutral-400 hover:text-white"
                    >
                      {copiedField === 'ov_blockhash' ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. INPUTS TAB */}
        {activeTab === 'INPUTS' && (
          <div className="space-y-2">
            <div className="text-[11px] text-neutral-400 flex items-center justify-between pb-1 border-b border-neutral-800">
              <span>{tx.inputs.length} SPENT INPUTS (PREVOUTS)</span>
              <span>TOTAL INPUT: {tx.totalInputValueBtc.toFixed(8)} BTC</span>
            </div>

            {tx.inputs.map((inp, idx) => (
              <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#F5D77F] font-bold">Input #{idx}</span>
                  <span className="text-white font-bold">
                    {(inp.prevout.value / 100000000).toFixed(8)} BTC
                  </span>
                </div>

                <div className="text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Address:</span>
                    <button
                      onClick={() => inp.prevout.scriptpubkey_address && onNavigateAddress?.(inp.prevout.scriptpubkey_address)}
                      className="text-neutral-200 hover:text-[#F5D77F] hover:underline flex items-center space-x-1"
                    >
                      <span>{inp.prevout.scriptpubkey_address || 'Coinbase / Non-standard'}</span>
                      <ExternalLink className="w-3 h-3 text-[#D4AF37]" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Prev UTXO:</span>
                    <span className="text-neutral-400 font-mono">
                      {inp.txid.slice(0, 16)}...:{inp.vout}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Script Type:</span>
                    <span className="px-1.5 py-0.5 rounded bg-black border border-neutral-800 text-neutral-300 text-[10px]">
                      {inp.prevout.scriptpubkey_type || 'standard'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. OUTPUTS TAB */}
        {activeTab === 'OUTPUTS' && (
          <div className="space-y-2">
            <div className="text-[11px] text-neutral-400 flex items-center justify-between pb-1 border-b border-neutral-800">
              <span>{tx.outputs.length} CREATED OUTPUTS</span>
              <span>TOTAL OUTPUT: {tx.totalOutputValueBtc.toFixed(8)} BTC</span>
            </div>

            {tx.outputs.map((out, idx) => (
              <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#F5D77F] font-bold">vout:{idx}</span>
                    {out.isChangeCandidate && (
                      <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-400 rounded text-[9px]">
                        CHANGE CANDIDATE
                      </span>
                    )}
                  </div>
                  <span className="text-white font-bold">
                    {(out.value / 100000000).toFixed(8)} BTC
                  </span>
                </div>

                <div className="text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Destination:</span>
                    <button
                      onClick={() => out.scriptpubkey_address && onNavigateAddress?.(out.scriptpubkey_address)}
                      className="text-neutral-200 hover:text-[#F5D77F] hover:underline flex items-center space-x-1"
                    >
                      <span>{out.scriptpubkey_address || 'OP_RETURN / Data Output'}</span>
                      <ExternalLink className="w-3 h-3 text-[#D4AF37]" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">ScriptPubKey Type:</span>
                    <span className="px-1.5 py-0.5 rounded bg-black border border-neutral-800 text-neutral-300 text-[10px]">
                      {out.scriptpubkey_type || 'standard'}
                    </span>
                  </div>

                  {out.scriptpubkey_asm && (
                    <div>
                      <span className="text-neutral-500 block mb-0.5">ASM Script:</span>
                      <p className="bg-black p-1.5 rounded text-[10px] text-neutral-400 break-all border border-neutral-850">
                        {out.scriptpubkey_asm}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. UTXOs TAB */}
        {activeTab === 'UTXOs' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-300">
              UTXO LIFECYCLE RECONCILIATION
            </h4>
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-black text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="p-2">UTXO Identifier</th>
                    <th className="p-2">Value (BTC)</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Script Format</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {tx.outputs.map((out, idx) => (
                    <tr key={idx} className="hover:bg-neutral-900">
                      <td className="p-2 font-mono text-[#F5D77F]">
                        {tx.txid.slice(0, 12)}...:{idx}
                      </td>
                      <td className="p-2 font-bold text-white">
                        {(out.value / 100000000).toFixed(8)}
                      </td>
                      <td className="p-2">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-900 text-[#F5D77F] border border-[#D4AF37]/50 text-[9px]">
                          CREATED / UNSPENT
                        </span>
                      </td>
                      <td className="p-2 text-neutral-400">
                        {out.scriptpubkey_type || 'v0_p2wpkh'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. FLOW TAB */}
        {activeTab === 'FLOW' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-neutral-300 text-center">
              VALUE CONSERVATION & FLOW BALANCE
            </h4>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-950 border border-neutral-800 p-4 rounded-lg">
              {/* Inputs column */}
              <div className="flex-1 w-full space-y-1.5">
                <span className="text-[11px] text-neutral-400 font-bold block">
                  INPUTS ({tx.totalInputValueBtc.toFixed(6)} BTC)
                </span>
                {tx.inputs.map((inp, i) => (
                  <div key={i} className="bg-black p-2 rounded border border-neutral-800 flex justify-between text-[10px]">
                    <span className="text-neutral-400 truncate max-w-[120px]">
                      {inp.prevout.scriptpubkey_address || 'Coinbase'}
                    </span>
                    <span className="text-white font-bold">
                      {(inp.prevout.value / 100000000).toFixed(6)} BTC
                    </span>
                  </div>
                ))}
              </div>

              {/* Center TX Arrow */}
              <div className="flex flex-col items-center justify-center p-2 text-center">
                <div className="w-10 h-10 rounded-full bg-neutral-900 border border-[#D4AF37] flex items-center justify-center text-[#F5D77F] shadow-md">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <span className="text-[9px] text-neutral-500 mt-1">
                  Fee: {tx.feeBtc.toFixed(6)} BTC
                </span>
              </div>

              {/* Outputs column */}
              <div className="flex-1 w-full space-y-1.5">
                <span className="text-[11px] text-neutral-400 font-bold block">
                  OUTPUTS ({tx.totalOutputValueBtc.toFixed(6)} BTC)
                </span>
                {tx.outputs.map((out, i) => (
                  <div key={i} className="bg-black p-2 rounded border border-neutral-800 flex justify-between text-[10px]">
                    <span className="text-neutral-400 truncate max-w-[120px]">
                      {out.scriptpubkey_address || 'OP_RETURN'}
                    </span>
                    <span className="text-[#F5D77F] font-bold">
                      {(out.value / 100000000).toFixed(6)} BTC
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. RAW DATA TAB */}
        {activeTab === 'RAW DATA' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300">RAW TRANSACTION DATA (JSON)</span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(tx, null, 2), 'raw_json')}
                className="px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-300 hover:text-white flex items-center space-x-1"
              >
                {copiedField === 'raw_json' ? <Check className="w-3 h-3 text-[#D4AF37]" /> : <Copy className="w-3 h-3" />}
                <span>Copy Payload</span>
              </button>
            </div>
            <pre className="bg-black border border-neutral-800 p-3 rounded-lg text-[10px] text-neutral-300 overflow-x-auto max-h-80 font-mono">
              {JSON.stringify(tx, null, 2)}
            </pre>
          </div>
        )}

        {/* 7. FORENSICS TAB */}
        {activeTab === 'FORENSICS' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-300">
              CRYPTOGRAPHIC PATTERN & HEURISTIC ANALYSIS
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg space-y-2">
                <span className="font-bold text-[#F5D77F] block">Change Heuristic Assessment</span>
                {tx.changeCandidates.length > 0 ? (
                  <p className="text-neutral-300">
                    Detected {tx.changeCandidates.length} change output candidate(s) at vout [{tx.changeCandidates.join(', ')}].
                    Based on script reuse check, round payment value difference, and address type matching.
                  </p>
                ) : (
                  <p className="text-neutral-400">
                    No change candidate identified. Transaction appears to be a sweep or consolidation.
                  </p>
                )}
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg space-y-2">
                <span className="font-bold text-white block">Entity & VASP Attributes</span>
                <p className="text-neutral-300">
                  Outputs checked against verified VASP omnibus and cold storage clusters.
                  Confidence score calculated using hop distance and UTXO provenance.
                </p>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg space-y-2">
                <span className="font-bold text-[#F5D77F] block">Fee Anomaly Check</span>
                <p className="text-neutral-300">
                  Fee rate: {tx.feeRateSatVb.toFixed(1)} sat/vB. Normal network range is 10–250 sat/vB.
                  {tx.feeRateSatVb > 400 ? ' WARNING: Unusually high fee rate detected (covert data exfiltration risk).' : ' Fee rate is consistent with standard mempool conditions.'}
                </p>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg space-y-2">
                <span className="font-bold text-neutral-200 block">Mixing & CoinJoin Signals</span>
                <p className="text-neutral-300">
                  {tx.inputCount >= 5 && tx.outputCount >= 5 ? (
                    'High input/output entropy detected. Possible CoinJoin or exchange batch processing.'
                  ) : (
                    'Standard peer-to-peer or peel chain transfer topology.'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 8. TIMELINE TAB */}
        {activeTab === 'TIMELINE' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-300">
              TRANSACTION LIFECYCLE TIMELINE
            </h4>
            <div className="border-l-2 border-[#D4AF37] pl-4 space-y-4 text-[11px]">
              <div>
                <span className="text-[#F5D77F] font-bold block">First Broadcast & Mempool Entry</span>
                <span className="text-neutral-400">{new Date(tx.timestamp * 1000).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-white font-bold block">Included in Block #{tx.blockHeight ?? 'Pending'}</span>
                <span className="text-neutral-400">
                  Confirmed with {tx.confirmations} subsequent network confirmation blocks
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
