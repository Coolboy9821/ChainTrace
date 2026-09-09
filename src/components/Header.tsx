import React, { useState } from 'react';
import { 
  Shield, 
  Database, 
  Radio, 
  Archive, 
  FileText, 
  ExternalLink, 
  LogIn, 
  LogOut, 
  Lock,
  Search,
  Activity,
  Layers,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { FORENSIC_CASES } from '../data/forensicCases';
import { ForensicCaseFixture } from '../types/forensics';
import { User } from 'firebase/auth';
import { googleSignIn, logout } from '../services/firebaseAuth';

interface HeaderProps {
  currentView: 'trace' | 'explorer' | 'registry' | 'custody' | 'drive';
  setCurrentView: (view: 'trace' | 'explorer' | 'registry' | 'custody' | 'drive') => void;
  dataMode: 'LIVE' | 'ARCHIVE';
  setDataMode: (mode: 'LIVE' | 'ARCHIVE') => void;
  selectedCase: ForensicCaseFixture | null;
  onSelectCase: (fixture: ForensicCaseFixture) => void;
  user: User | null;
  onOpenDriveModal: () => void;
  btcPriceUsd: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  dataMode,
  setDataMode,
  selectedCase,
  onSelectCase,
  user,
  onOpenDriveModal,
  btcPriceUsd
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleAuth = async () => {
    if (user) {
      await logout();
    } else {
      setIsSigningIn(true);
      try {
        await googleSignIn();
      } catch (err) {
        console.error('Sign in error:', err);
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  return (
    <header className="bg-black border-b border-neutral-800 text-neutral-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Project Metadata */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-950 border border-[#D4AF37]/60 text-[#F5D77F] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-wider text-base font-mono text-white">ANVESHAN</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-[#D4AF37]/50 text-[#F5D77F]">
                SIH PS #26182
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono tracking-tight truncate max-w-xs sm:max-w-md">
              Forensic Attribution & UTXO Provenance Intelligence
            </p>
          </div>
        </div>

        {/* View Navigation */}
        <nav className="flex items-center space-x-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
          <button
            id="nav-trace-btn"
            onClick={() => setCurrentView('trace')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center space-x-1.5 ${
              currentView === 'trace'
                ? 'bg-[#D4AF37]/15 text-[#F5D77F] border border-[#D4AF37]/50 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Trace</span>
          </button>
          <button
            id="nav-explorer-btn"
            onClick={() => setCurrentView('explorer')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center space-x-1.5 ${
              currentView === 'explorer'
                ? 'bg-[#D4AF37]/15 text-[#F5D77F] border border-[#D4AF37]/50 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Explorer</span>
          </button>
          <button
            id="nav-registry-btn"
            onClick={() => setCurrentView('registry')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center space-x-1.5 ${
              currentView === 'registry'
                ? 'bg-[#D4AF37]/15 text-[#F5D77F] border border-[#D4AF37]/50 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>VASP Registry</span>
          </button>
          <button
            id="nav-custody-btn"
            onClick={() => setCurrentView('custody')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center space-x-1.5 ${
              currentView === 'custody'
                ? 'bg-[#D4AF37]/15 text-[#F5D77F] border border-[#D4AF37]/50 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Custody</span>
          </button>
          <button
            id="nav-drive-btn"
            onClick={onOpenDriveModal}
            className="px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center space-x-1.5 text-zinc-300 hover:text-[#F5D77F] bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 hover:border-[#D4AF37]/60"
            title="Access HACKATHON Drive Folder & Forensic Reports"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Drive Files</span>
          </button>
        </nav>

        {/* Right Tools & Mode Switches */}
        <div className="flex items-center space-x-2.5">
          {/* BTC Price Pill */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800 text-[11px] font-mono">
            <span className="text-neutral-400">BTC/USD:</span>
            <span className="text-[#F5D77F] font-semibold">${btcPriceUsd.toLocaleString()}</span>
          </div>

          {/* Mode Switch: LIVE vs ARCHIVE */}
          <div className="flex items-center p-0.5 rounded-lg bg-neutral-950 border border-neutral-800">
            <button
              id="mode-live-btn"
              onClick={() => setDataMode('LIVE')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all flex items-center space-x-1.5 ${
                dataMode === 'LIVE'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F4D] text-black font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Queries live public mainnet nodes via multi-provider fallback"
            >
              <Radio className={`w-3 h-3 ${dataMode === 'LIVE' ? 'animate-pulse text-black' : 'text-neutral-500'}`} />
              <span>LIVE</span>
            </button>
            <button
              id="mode-archive-btn"
              onClick={() => setDataMode('ARCHIVE')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all flex items-center space-x-1.5 ${
                dataMode === 'ARCHIVE'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F4D] text-black font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Uses deterministic authenticated forensic benchmark records"
            >
              <Archive className={`w-3 h-3 ${dataMode === 'ARCHIVE' ? 'text-black' : 'text-[#D4AF37]'}`} />
              <span>ARCHIVE</span>
            </button>
          </div>

          {/* Forensic Cases Selector */}
          {dataMode === 'ARCHIVE' && (
            <select
              id="forensic-case-select"
              value={selectedCase?.id || ''}
              onChange={(e) => {
                const fixture = FORENSIC_CASES.find(f => f.id === e.target.value);
                if (fixture) onSelectCase(fixture);
              }}
              className="bg-neutral-950 border border-[#D4AF37]/50 text-[#F5D77F] text-xs font-mono rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            >
              {FORENSIC_CASES.map(f => (
                <option key={f.id} value={f.id} className="bg-neutral-950 text-neutral-200">
                  {f.caseCode}: {f.title.slice(0, 24)}...
                </option>
              ))}
            </select>
          )}

          {/* Google Auth / Drive Status */}
          <button
            id="google-auth-btn"
            onClick={handleGoogleAuth}
            disabled={isSigningIn}
            className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all flex items-center space-x-1.5 border ${
              user 
                ? 'bg-neutral-950 border-neutral-700 text-neutral-200 hover:border-[#D4AF37]'
                : 'bg-neutral-900 border-[#D4AF37]/40 text-[#F5D77F] hover:bg-neutral-800'
            }`}
            title={user ? `Signed in as ${user.email}. Click to sign out.` : 'Sign in with Google to access HACKATHON Drive folder'}
          >
            {user ? (
              <>
                <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <span className="truncate max-w-[90px]">{user.displayName || user.email?.split('@')[0]}</span>
                <LogOut className="w-3 h-3 text-neutral-400 ml-0.5" />
              </>
            ) : (
              <>
                <LogIn className="w-3 h-3 text-[#D4AF37]" />
                <span>Drive Sync</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Archive Mode Banner Indicator */}
      {dataMode === 'ARCHIVE' && (
        <div className="bg-[#0f0e0a] border-b border-[#D4AF37]/30 px-4 py-1.5 text-[11px] font-mono text-[#F5D77F] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span>
              <strong className="text-white">VERIFIED FORENSIC ARCHIVE:</strong> All addresses, hops, and VASP attributions are cryptographically audited benchmark cases. Zero unverified live data.
            </span>
          </div>
          <span className="hidden sm:inline-block px-1.5 py-0.5 bg-neutral-900 border border-[#D4AF37]/40 text-neutral-200 rounded text-[10px]">
            Active Case: {selectedCase?.caseCode || 'ANV-CASE-BTC-001'}
          </span>
        </div>
      )}
    </header>
  );
};
