import React, { useState } from 'react';
import { KNOWN_VASPS } from '../services/vasp/vaspRegistry';
import { VaspEntity } from '../types/forensics';
import { 
  Building2, 
  Search, 
  Mail, 
  Globe
} from 'lucide-react';

interface VaspRegistryViewProps {
  onSelectVasp?: (vasp: VaspEntity) => void;
}

export const VaspRegistryView: React.FC<VaspRegistryViewProps> = ({ onSelectVasp }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredVasps = KNOWN_VASPS.filter(v => {
    const matchesSearch = 
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.country.toLowerCase().includes(search.toLowerCase()) ||
      (v.legalEntityName && v.legalEntityName.toLowerCase().includes(search.toLowerCase())) ||
      v.knownAddresses.some(a => a.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-neutral-100 font-mono text-xs shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-bold text-sm tracking-wider text-white">
              VERIFIED VASP & ENTITY INTELLIGENCE REGISTRY
            </h2>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Cryptographic omnibus clustering, compliance officers, and jurisdictional risk
          </p>
        </div>

        {/* Search and Category Filters */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search VASP name, country, address..."
              className="bg-neutral-900 border border-neutral-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-mono w-48 sm:w-64"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-neutral-200 font-mono"
          >
            <option value="ALL">All Categories</option>
            <option value="CEX">Centralized Exchanges (CEX)</option>
            <option value="MIXER">Mixers / Obfuscation</option>
            <option value="MINING_POOL">Mining Pools</option>
            <option value="DEX">Decentralized Protocols</option>
            <option value="BRIDGE">Cross-Chain Bridges</option>
          </select>
        </div>
      </div>

      {/* Grid of VASP Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredVasps.map((vasp) => (
          <div
            key={vasp.id}
            className="bg-neutral-950 border border-neutral-800 hover:border-[#D4AF37]/60 rounded-lg p-3 space-y-2.5 transition-all shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">{vasp.name}</h4>
                <p className="text-[10px] text-neutral-400">{vasp.legalEntityName || vasp.name}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                vasp.category === 'CEX'
                  ? 'bg-[#1a1608] text-[#F5D77F] border-[#D4AF37]'
                  : vasp.category === 'MIXER'
                  ? 'bg-neutral-900 text-[#F5D77F] border-[#B38F4D]'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-700'
              }`}>
                {vasp.category}
              </span>
            </div>

            <div className="space-y-1 text-[11px] bg-black p-2 rounded border border-neutral-850">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="flex items-center space-x-1">
                  <Globe className="w-3 h-3 text-[#D4AF37]" />
                  <span>Jurisdiction:</span>
                </span>
                <span className="text-neutral-200">{vasp.country}</span>
              </div>

              <div className="flex items-center justify-between text-neutral-400">
                <span className="flex items-center space-x-1">
                  <Mail className="w-3 h-3 text-neutral-400" />
                  <span>LE Contact:</span>
                </span>
                <span className="text-neutral-200 truncate max-w-[140px]">{vasp.complianceContact || vasp.complianceEmail || vasp.leContact || 'compliance@vasp.org'}</span>
              </div>

              <div className="flex items-center justify-between text-neutral-400">
                <span>Confidence:</span>
                <span className="text-[#F5D77F] font-bold">{vasp.confidenceScore || (100 - vasp.riskScore)}%</span>
              </div>
            </div>

            <div className="text-[10px] text-neutral-400 flex items-center justify-between pt-1 border-t border-neutral-800">
              <span>{vasp.knownAddresses.length} Identified Clusters</span>
              <span className="text-neutral-500">{vasp.source}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
