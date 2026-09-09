import React, { useState } from 'react';
import { NormalizedBlock } from '../types/forensics';
import { 
  X, 
  Copy, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Box
} from 'lucide-react';

interface BlockInspectorProps {
  block: NormalizedBlock;
  onClose: () => void;
  onNavigateBlock: (heightOrHash: string | number) => void;
  onSelectTx?: (txid: string) => void;
  btcPriceUsd: number;
}

export const BlockInspector: React.FC<BlockInspectorProps> = ({
  block,
  onClose,
  onNavigateBlock,
  onSelectTx,
  btcPriceUsd
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const feesUsd = block.totalFeesBtc * btcPriceUsd;

  return (
    <div className="w-full bg-black border border-neutral-800 rounded-xl overflow-hidden shadow-2xl text-neutral-100 font-mono text-xs">
      {/* Header with Block Navigation */}
      <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Box className="w-4 h-4 text-[#D4AF37]" />
          <span className="font-bold text-sm tracking-wider text-white">
            BITCOIN BLOCK #{block.height.toLocaleString()}
          </span>
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-[#D4AF37]/40 text-[#F5D77F] text-[10px]">
            MINED BY: {block.miner}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Previous Block Button */}
          {block.previousBlockHash && (
            <button
              onClick={() => onNavigateBlock(block.height - 1)}
              className="px-2.5 py-1 bg-black hover:bg-neutral-900 border border-neutral-700 rounded text-neutral-300 flex items-center space-x-1"
              title="Navigate to Previous Block"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>#{block.height - 1}</span>
            </button>
          )}

          {/* Next Block Button */}
          {block.nextBlockHash && (
            <button
              onClick={() => onNavigateBlock(block.height + 1)}
              className="px-2.5 py-1 bg-black hover:bg-neutral-900 border border-neutral-700 rounded text-neutral-300 flex items-center space-x-1"
              title="Navigate to Next Block"
            >
              <span>#{block.height + 1}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-850 text-neutral-400 hover:text-white transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Block Hash Bar */}
      <div className="bg-neutral-950 px-4 py-2 border-b border-neutral-800 flex items-center justify-between text-[11px]">
        <div className="flex items-center space-x-2 truncate">
          <span className="text-neutral-500">Hash:</span>
          <span className="text-[#F5D77F] font-bold truncate">{block.hash}</span>
        </div>
        <button
          onClick={() => copyText(block.hash, 'hash')}
          className="ml-2 text-neutral-400 hover:text-white"
        >
          {copied === 'hash' ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Block Metrics Matrix */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-neutral-950/60 border-b border-neutral-800">
        <div className="bg-black border border-neutral-800 rounded-lg p-3">
          <span className="text-[10px] text-neutral-400 block mb-1">TRANSACTIONS</span>
          <div className="text-base font-bold text-white">
            {block.txCount.toLocaleString()} TXs
          </div>
          <div className="text-[10px] text-neutral-500">
            {block.sizeMb.toFixed(2)} MB ({block.sizeBytes.toLocaleString()} B)
          </div>
        </div>

        <div className="bg-black border border-neutral-800 rounded-lg p-3">
          <span className="text-[10px] text-neutral-400 block mb-1">BLOCK WEIGHT (WU)</span>
          <div className="text-base font-bold text-[#E5C158]">
            {block.weight.toLocaleString()} WU
          </div>
          <div className="text-[10px] text-neutral-500">
            {((block.weight / 4000000) * 100).toFixed(1)}% of 4M limit
          </div>
        </div>

        <div className="bg-black border border-neutral-800 rounded-lg p-3">
          <span className="text-[10px] text-neutral-400 block mb-1">TOTAL FEES</span>
          <div className="text-base font-bold text-[#F5D77F]">
            {block.totalFeesBtc.toFixed(6)} BTC
          </div>
          <div className="text-[10px] text-neutral-500">
            ≈ ${feesUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
          </div>
        </div>

        <div className="bg-black border border-neutral-800 rounded-lg p-3">
          <span className="text-[10px] text-neutral-400 block mb-1">TIMESTAMP & NONCE</span>
          <div className="text-base font-bold text-neutral-200">
            {block.age}
          </div>
          <div className="text-[10px] text-neutral-500">
            Nonce: {block.nonce}
          </div>
        </div>
      </div>

      {/* Merkle Root & Technical Specs */}
      <div className="p-4 space-y-2 border-b border-neutral-800 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">Merkle Root:</span>
          <span className="text-neutral-300 font-mono truncate max-w-md">{block.merkleRoot}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">Difficulty:</span>
          <span className="text-neutral-300">{block.difficulty.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">Block Version:</span>
          <span className="text-neutral-300">{block.version}</span>
        </div>
      </div>
    </div>
  );
};
