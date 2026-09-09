import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import { DetectedInputType } from '../types/forensics';
import { blockchainService } from '../services/blockchain/blockchainService';

interface SearchConsoleProps {
  onSearch: (query: string, detectedType: DetectedInputType) => void;
  isLoading: boolean;
  dataMode: 'LIVE' | 'ARCHIVE';
}

export const SearchConsole: React.FC<SearchConsoleProps> = ({ onSearch, isLoading, dataMode }) => {
  const [query, setQuery] = useState('');
  const [detectedType, setDetectedType] = useState<DetectedInputType>('UNKNOWN');

  useEffect(() => {
    if (!query.trim()) {
      setDetectedType('UNKNOWN');
      return;
    }
    const detected = blockchainService.detectInputType(query.trim());
    setDetectedType(detected);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim(), detectedType);
  };

  const setSample = (sample: string) => {
    setQuery(sample);
    const detected = blockchainService.detectInputType(sample);
    setDetectedType(detected);
    onSearch(sample, detected);
  };

  const getBadgeStyle = (type: DetectedInputType) => {
    switch (type) {
      case 'BITCOIN_ADDRESS':
        return 'bg-neutral-900 text-[#F5D77F] border border-[#D4AF37]/60';
      case 'BITCOIN_TRANSACTION':
        return 'bg-neutral-900 text-white border border-neutral-600';
      case 'BITCOIN_BLOCK_HASH':
      case 'BITCOIN_BLOCK_HEIGHT':
        return 'bg-neutral-900 text-[#E5C158] border border-[#B38F4D]/60';
      case 'ETHEREUM_ADDRESS':
      case 'ETHEREUM_TRANSACTION':
        return 'bg-neutral-900 text-zinc-300 border border-zinc-700';
      default:
        return 'bg-neutral-900 text-neutral-400 border-neutral-800';
    }
  };

  const formatBadgeLabel = (type: DetectedInputType) => {
    switch (type) {
      case 'BITCOIN_ADDRESS': return 'BITCOIN ADDRESS';
      case 'BITCOIN_TRANSACTION': return 'BITCOIN TRANSACTION';
      case 'BITCOIN_BLOCK_HASH': return 'BITCOIN BLOCK HASH';
      case 'BITCOIN_BLOCK_HEIGHT': return 'BITCOIN BLOCK HEIGHT';
      case 'ETHEREUM_ADDRESS': return 'ETHEREUM ADDRESS';
      case 'ETHEREUM_TRANSACTION': return 'ETHEREUM TX';
      default: return 'DETECTING TARGET TYPE...';
    }
  };

  return (
    <div className="w-full bg-black border-b border-neutral-800 px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="relative flex flex-col md:flex-row items-center gap-2">
          <div className="relative w-full flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4 text-[#D4AF37]" />
            </div>

            <input
              id="forensic-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Bitcoin/Ethereum address, transaction hash (txid), block height, or case code..."
              className="w-full pl-10 pr-32 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 font-mono focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
            />

            {/* Live Detected Type Indicator Badge */}
            <div className="absolute inset-y-0 right-2 flex items-center">
              {query.trim() && (
                <span
                  id="detected-type-badge"
                  className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border transition-all ${getBadgeStyle(
                    detectedType
                  )}`}
                >
                  {formatBadgeLabel(detectedType)}
                </span>
              )}
            </div>
          </div>

          <button
            id="forensic-search-submit"
            type="submit"
            disabled={isLoading || !query.trim()}
            className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#F5D77F] to-[#B38F4D] hover:brightness-110 text-black font-mono font-bold text-xs rounded-lg transition-all flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(212,175,55,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>INVESTIGATING...</span>
              </>
            ) : (
              <>
                <span>ANALYZE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Targets */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-neutral-400">
          <span className="text-neutral-500 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>Fast Targets:</span>
          </span>

          {dataMode === 'LIVE' ? (
            <>
              <button
                type="button"
                onClick={() => setSample('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')}
                className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-[#D4AF37] hover:text-[#F5D77F] transition-colors"
                title="Satoshi Genesis Wallet (Legacy P2PKH)"
              >
                Genesis Wallet
              </button>
              <button
                type="button"
                onClick={() => setSample('34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo')}
                className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-[#D4AF37] hover:text-[#F5D77F] transition-colors"
                title="Binance Cold Storage Reserve (Nested P2SH)"
              >
                Binance Reserve
              </button>
              <button
                type="button"
                onClick={() => setSample('4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b')}
                className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-[#D4AF37] hover:text-[#F5D77F] transition-colors"
                title="Bitcoin Genesis Block 0 Coinbase Transaction"
              >
                Genesis TX
              </button>
              <button
                type="button"
                onClick={() => setSample('880000')}
                className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-[#D4AF37] hover:text-[#F5D77F] transition-colors"
                title="Bitcoin Block Height 880,000"
              >
                Block #880000
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setSample('bc1q_case_ransom_extortion_889x')}
                className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-[#D4AF37] hover:text-[#F5D77F] transition-colors"
              >
                ANV-CASE-001 (Ransomware)
              </button>
              <button
                type="button"
                onClick={() => setSample('bc1q_case_theft_source_005btc')}
                className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-[#D4AF37] hover:text-[#F5D77F] transition-colors"
              >
                ANV-CASE-002 (0.005 BTC UTXO)
              </button>
              <button
                type="button"
                onClick={() => setSample('bc1q_case_phishing_scam_020btc')}
                className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-[#D4AF37] hover:text-[#F5D77F] transition-colors"
              >
                ANV-CASE-003 (Break Detected)
              </button>
              <button
                type="button"
                onClick={() => setSample('0x742d35cc6634c0532925a3b844bc454e4438f44e')}
                className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-[#D4AF37] hover:text-[#F5D77F] transition-colors"
              >
                ANV-CASE-ETH (Bridge)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
