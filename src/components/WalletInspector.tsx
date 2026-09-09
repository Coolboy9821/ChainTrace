import React, { useState } from 'react';
import { 
  NormalizedAddress 
} from '../types/forensics';
import { 
  X, 
  Copy, 
  Check, 
  Coins
} from 'lucide-react';

interface WalletInspectorProps {
  wallet: NormalizedAddress;
  onClose: () => void;
  onSelectTx?: (txid: string) => void;
  onSelectAddress?: (addr: string) => void;
  btcPriceUsd: number;
}

export const WalletInspector: React.FC<WalletInspectorProps> = ({
  wallet,
  onClose,
  onSelectTx,
  onSelectAddress,
  btcPriceUsd
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'UTXOs' | 'COUNTERPARTIES' | 'FORENSICS'>('TRANSACTIONS');

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const balanceUsd = wallet.balanceBtc * btcPriceUsd;
  const receivedUsd = wallet.totalReceivedBtc * btcPriceUsd;
  const sentUsd = wallet.totalSentBtc * btcPriceUsd;

  return (
    <div className="w-full bg-black border border-neutral-800 rounded-xl overflow-hidden shadow-2xl text-neutral-100 font-mono text-xs">
      {/* Header */}
      <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Coins className="w-4 h-4 text-[#D4AF37]" />
          <span className="font-bold text-sm tracking-wider text-white">WALLET FORENSICS</span>
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-[#D4AF37]/40 text-[#F5D77F] text-[10px]">
            {wallet.network.toUpperCase()}
          </span>
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 text-[10px]">
            {wallet.addressType}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-neutral-850 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Address Bar */}
      <div className="bg-neutral-950 px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <span className="text-neutral-400 text-[11px]">Address:</span>
          <span className="text-[#F5D77F] font-bold text-xs truncate max-w-sm sm:max-w-xl">
            {wallet.address}
          </span>
        </div>
        <button
          onClick={copyAddress}
          className="ml-2 px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-neutral-300 flex items-center space-x-1 shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Financial Matrix */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-neutral-950/60 border-b border-neutral-800">
        <div className="bg-black border border-neutral-800 rounded-lg p-3">
          <span className="text-[10px] text-neutral-400 block mb-1">CURRENT BALANCE</span>
          <div className="text-base font-bold text-[#F5D77F]">
            {wallet.balanceBtc.toFixed(8)} BTC
          </div>
          <div className="text-[11px] text-neutral-500">
            ≈ ${balanceUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
          </div>
        </div>

        <div className="bg-black border border-neutral-800 rounded-lg p-3">
          <span className="text-[10px] text-neutral-400 block mb-1">TOTAL RECEIVED</span>
          <div className="text-base font-bold text-white">
            {wallet.totalReceivedBtc.toFixed(8)} BTC
          </div>
          <div className="text-[11px] text-neutral-500">
            ≈ ${receivedUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
          </div>
        </div>

        <div className="bg-black border border-neutral-800 rounded-lg p-3">
          <span className="text-[10px] text-neutral-400 block mb-1">TOTAL SENT</span>
          <div className="text-base font-bold text-white">
            {wallet.totalSentBtc.toFixed(8)} BTC
          </div>
          <div className="text-[11px] text-neutral-500">
            ≈ ${sentUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
          </div>
        </div>

        <div className="bg-black border border-neutral-800 rounded-lg p-3">
          <span className="text-[10px] text-neutral-400 block mb-1">TRANSACTIONS / UTXOs</span>
          <div className="text-base font-bold text-neutral-200">
            {wallet.txCount.toLocaleString()} TXs
          </div>
          <div className="text-[11px] text-neutral-500">
            {wallet.unspentOutputCount} Unspent UTXOs
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex border-b border-neutral-800 bg-neutral-950 px-3">
        {(['TRANSACTIONS', 'UTXOs', 'COUNTERPARTIES', 'FORENSICS'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 font-mono text-xs font-semibold border-b-2 transition-all ${
              activeTab === tab
                ? 'border-[#D4AF37] text-[#F5D77F] bg-[#D4AF37]/10'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Body */}
      <div className="p-4 max-h-[420px] overflow-y-auto">
        {/* TRANSACTIONS */}
        {activeTab === 'TRANSACTIONS' && (
          <div className="space-y-2">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="p-2">TXID</th>
                  <th className="p-2">Block</th>
                  <th className="p-2">Time / Age</th>
                  <th className="p-2">Value (BTC)</th>
                  <th className="p-2">Fee</th>
                  <th className="p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {wallet.recentTransactions.map((tx) => (
                  <tr key={tx.txid} className="hover:bg-neutral-900">
                    <td className="p-2 font-mono text-[#F5D77F]">
                      {tx.txid.slice(0, 16)}...
                    </td>
                    <td className="p-2 text-neutral-300">
                      #{tx.blockHeight ?? 'Pending'}
                    </td>
                    <td className="p-2 text-neutral-400">
                      {tx.age}
                    </td>
                    <td className="p-2 font-bold text-white">
                      {tx.valueTransferredBtc.toFixed(6)} BTC
                    </td>
                    <td className="p-2 text-neutral-400">
                      {tx.feeBtc.toFixed(6)}
                    </td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => onSelectTx?.(tx.txid)}
                        className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-[#F5D77F]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
                {wallet.recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-neutral-500 italic">
                      No recent transactions recorded for this address.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* UTXOs */}
        {activeTab === 'UTXOs' && (
          <div className="space-y-2">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="p-2">UTXO Outpoint (TXID:vout)</th>
                  <th className="p-2">Value (BTC)</th>
                  <th className="p-2">Value (Sats)</th>
                  <th className="p-2">Confirmations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {wallet.utxos.map((u, i) => (
                  <tr key={i} className="hover:bg-neutral-900">
                    <td className="p-2 font-mono text-[#F5D77F]">
                      {u.txid.slice(0, 16)}...:{u.vout}
                    </td>
                    <td className="p-2 font-bold text-white">
                      {(u.value / 100000000).toFixed(8)} BTC
                    </td>
                    <td className="p-2 text-neutral-400">
                      {u.value.toLocaleString()} sats
                    </td>
                    <td className="p-2 text-neutral-300">
                      {u.confirmations}
                    </td>
                  </tr>
                ))}
                {wallet.utxos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-neutral-500 italic">
                      All outputs spent (0 unspent UTXOs).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* COUNTERPARTIES */}
        {activeTab === 'COUNTERPARTIES' && (
          <div className="space-y-2">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="p-2">Interacting Counterparty Address</th>
                  <th className="p-2">Interactions</th>
                  <th className="p-2">Total Volume (BTC)</th>
                  <th className="p-2 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {wallet.counterparties.map((cp, idx) => (
                  <tr key={idx} className="hover:bg-neutral-900">
                    <td className="p-2 font-mono text-neutral-300">
                      {cp.address}
                    </td>
                    <td className="p-2 text-[#F5D77F] font-bold">
                      {cp.count}
                    </td>
                    <td className="p-2 font-bold text-white">
                      {cp.volumeBtc.toFixed(6)} BTC
                    </td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => onSelectAddress?.(cp.address)}
                        className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-[#F5D77F]"
                      >
                        Pivot
                      </button>
                    </td>
                  </tr>
                ))}
                {wallet.counterparties.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-neutral-500 italic">
                      No direct counterparty interactions recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* FORENSICS */}
        {activeTab === 'FORENSICS' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg space-y-1.5">
                <span className="font-bold text-[#F5D77F] block">Attributed Entity</span>
                {wallet.knownEntity ? (
                  <div>
                    <span className="text-sm font-bold text-white block">
                      {wallet.knownEntity.name} ({wallet.knownEntity.category})
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Jurisdiction: {wallet.knownEntity.country} • Confidence: {wallet.knownEntity.confidenceScore}%
                    </span>
                  </div>
                ) : (
                  <span className="text-neutral-400 italic">
                    Unattributed private or intermediate wallet.
                  </span>
                )}
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg space-y-1.5">
                <span className="font-bold text-[#F5D77F] block">Risk Score & Indicators</span>
                <span className="text-sm font-bold text-white block">
                  Risk Score: {wallet.riskScore ?? 45}/100
                </span>
                <div className="space-y-1">
                  {wallet.riskIndicators?.map((r, i) => (
                    <div key={i} className="text-[11px] text-neutral-300 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
