import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchConsole } from './components/SearchConsole';
import { GraphCanvas } from './components/GraphCanvas';
import { ForensicIntelligencePanel } from './components/ForensicIntelligencePanel';
import { ForensicTimelineView } from './components/ForensicTimelineView';
import { TransactionInspector } from './components/TransactionInspector';
import { WalletInspector } from './components/WalletInspector';
import { BlockInspector } from './components/BlockInspector';
import { SeizureNoticeModal } from './components/SeizureNoticeModal';
import { AuditDebugModal } from './components/AuditDebugModal';
import { DriveWorkspaceModal } from './components/DriveWorkspaceModal';
import { VaspRegistryView } from './components/VaspRegistryView';
import { CustodyView } from './components/CustodyView';

import { 
  ForensicCaseFixture, 
  ForensicGraphNode, 
  ForensicGraphEdge, 
  ForensicIntelligence, 
  ProvenanceHop, 
  NormalizedTransaction, 
  NormalizedAddress, 
  NormalizedBlock, 
  DetectedInputType 
} from './types/forensics';
import { FORENSIC_CASES, getCaseByCode, getCaseByAddress } from './data/forensicCases';
import { blockchainService } from './services/blockchain/blockchainService';
import { UtxoProvenanceEngine } from './services/provenance/utxoTracker';
import { initAuth } from './services/firebaseAuth';
import { User } from 'firebase/auth';
import { AlertCircle, Layers, Radio } from 'lucide-react';

export default function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<'trace' | 'explorer' | 'registry' | 'custody' | 'drive'>('trace');
  const [dataMode, setDataMode] = useState<'LIVE' | 'ARCHIVE'>('ARCHIVE');

  // Active Case / Trace State
  const [selectedCase, setSelectedCase] = useState<ForensicCaseFixture>(FORENSIC_CASES[0]);
  const [nodes, setNodes] = useState<ForensicGraphNode[]>(FORENSIC_CASES[0].nodes);
  const [edges, setEdges] = useState<ForensicGraphEdge[]>(FORENSIC_CASES[0].edges);
  const [hops, setHops] = useState<ProvenanceHop[]>(FORENSIC_CASES[0].hops);
  const [intelligence, setIntelligence] = useState<ForensicIntelligence>(FORENSIC_CASES[0].intelligence);

  // Inspector States
  const [selectedNode, setSelectedNode] = useState<ForensicGraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<ForensicGraphEdge | null>(null);
  const [inspectedTx, setInspectedTx] = useState<NormalizedTransaction | null>(null);
  const [inspectedWallet, setInspectedWallet] = useState<NormalizedAddress | null>(null);
  const [inspectedBlock, setInspectedBlock] = useState<NormalizedBlock | null>(null);

  // Modal States
  const [isSeizureModalOpen, setIsSeizureModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Runtime / API States
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [btcPriceUsd, setBtcPriceUsd] = useState<number>(96500);
  const [user, setUser] = useState<User | null>(null);
  const [latestBlocks, setLatestBlocks] = useState<NormalizedBlock[]>([]);

  // Initialize Firebase Auth listener and fetch initial data
  useEffect(() => {
    initAuth(
      (currentUser) => setUser(currentUser),
      () => setUser(null)
    );

    // Fetch BTC price
    blockchainService.getBtcPriceUsd()
      .then(price => setBtcPriceUsd(price))
      .catch(() => setBtcPriceUsd(96500));

    // Fetch latest blocks
    blockchainService.getLatestBlocks(6)
      .then(blocks => setLatestBlocks(blocks))
      .catch(err => console.warn('Could not fetch initial blocks:', err));
  }, []);

  // When switching archive cases
  const handleSelectCase = (fixture: ForensicCaseFixture) => {
    setSelectedCase(fixture);
    setNodes(fixture.nodes);
    setEdges(fixture.edges);
    setHops(fixture.hops);
    setIntelligence(fixture.intelligence);
    setSelectedNode(null);
    setSelectedEdge(null);
    setInspectedTx(null);
    setInspectedWallet(null);
    setStatusMessage(null);
  };

  // Search Dispatcher
  const handleSearch = async (query: string, detectedType: DetectedInputType) => {
    setStatusMessage(null);
    setIsLoading(true);

    try {
      // 1. Check if user is searching for a local archive fixture code (e.g. ANV-CASE-BTC-001)
      const fixtureMatch = getCaseByCode(query) || getCaseByAddress(query);
      if (fixtureMatch) {
        setDataMode('ARCHIVE');
        handleSelectCase(fixtureMatch);
        setCurrentView('trace');
        setIsLoading(false);
        return;
      }

      // 2. Prevent sending transaction hashes to address endpoints (TEST C)
      if (detectedType === 'BITCOIN_TRANSACTION' || detectedType === 'ETHEREUM_TRANSACTION') {
        const tx = await blockchainService.getTransaction(query);
        setInspectedTx(tx);
        setCurrentView('explorer');
        setIsLoading(false);
        return;
      }

      // 3. Block Hash / Block Height
      if (detectedType === 'BITCOIN_BLOCK_HASH' || detectedType === 'BITCOIN_BLOCK_HEIGHT') {
        const block = await blockchainService.getBlock(query);
        setInspectedBlock(block);
        setCurrentView('explorer');
        setIsLoading(false);
        return;
      }

      // 4. Bitcoin Address Trace (LIVE BLOCKCHAIN OR ARCHIVE)
      if (detectedType === 'BITCOIN_ADDRESS') {
        if (dataMode === 'ARCHIVE') {
          // In archive mode, inform user
          setStatusMessage({
            isError: false,
            text: 'ARCHIVE MODE active: Address was not found in static archive cases. Switch to LIVE mode to query Bitcoin mainnet.'
          });
          setIsLoading(false);
          return;
        }

        // Live Trace
        const addrData = await blockchainService.getAddress(query);
        setInspectedWallet(addrData);

        if (addrData.txCount === 0) {
          setStatusMessage({
            isError: false,
            text: 'No blockchain activity found for this address.'
          });
          setIsLoading(false);
          return;
        }

        if (addrData.totalSentBtc === 0) {
          setStatusMessage({
            isError: false,
            text: 'No outbound movement recorded (all received funds unspent).'
          });
          setIsLoading(false);
          return;
        }

        // Perform multi-hop UTXO provenance tracing
        setStatusMessage({
          isError: false,
          text: `Tracing UTXO provenance for ${query.slice(0, 12)}...`
        });

        const traceResult = await UtxoProvenanceEngine.traceUtxoProvenance(
          blockchainService,
          query,
          addrData.balanceBtc > 0 ? addrData.balanceBtc : addrData.totalSentBtc,
          4
        );

        setNodes(traceResult.nodes);
        setEdges(traceResult.edges);
        setHops(traceResult.hops);
        setIntelligence(traceResult.intelligence);
        setCurrentView('trace');
      } else {
        setStatusMessage({
          isError: false,
          text: `Target format (${detectedType}) is recognized. Enter a Bitcoin address, tx hash, or block height.`
        });
      }
    } catch (err: any) {
      console.error('Search error:', err);
      if (err.type === 'RATE_LIMITED') {
        setStatusMessage({
          isError: true,
          text: 'Blockchain provider rate limited (HTTP 429). Using cached local state.'
        });
      } else if (err.type === 'SERVICE_UNAVAILABLE') {
        setStatusMessage({
          isError: true,
          text: 'Blockchain data unavailable (HTTP 500). Please retry shortly.'
        });
      } else {
        setStatusMessage({
          isError: true,
          text: err.message || 'Investigation query failed.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Click on graph node
  const handleSelectNode = async (node: ForensicGraphNode) => {
    setSelectedNode(node);
    if (node.address) {
      if (dataMode === 'ARCHIVE' && selectedCase.wallets[node.address]) {
        setInspectedWallet(selectedCase.wallets[node.address]);
      } else {
        try {
          const addr = await blockchainService.getAddress(node.address);
          setInspectedWallet(addr);
        } catch {
          // Create fallback normalized address
          setInspectedWallet({
            address: node.address,
            network: 'bitcoin',
            addressType: 'Native SegWit (P2WPKH)',
            balanceSats: Math.round((node.balanceBtc || 0) * 100000000),
            balanceBtc: node.balanceBtc || 0,
            totalReceivedBtc: node.tracedAmountBtc,
            totalSentBtc: node.balanceBtc === 0 ? node.tracedAmountBtc : 0,
            txCount: 2,
            unspentOutputCount: node.balanceBtc > 0 ? 1 : 0,
            utxos: [],
            recentTransactions: [],
            counterparties: [],
            riskScore: node.riskScore
          });
        }
      }
    }
  };

  // Click on graph edge
  const handleSelectEdge = async (edge: ForensicGraphEdge) => {
    setSelectedEdge(edge);
    if (edge.txid) {
      const caseTx = selectedCase.transactions.find(t => t.txid === edge.txid);
      if (caseTx) {
        setInspectedTx(caseTx);
      } else {
        try {
          const liveTx = await blockchainService.getTransaction(edge.txid);
          setInspectedTx(liveTx);
        } catch (err) {
          console.warn('Could not fetch live tx for edge:', err);
        }
      }
    }
  };

  // Download graph JSON
  const handleDownloadGraphJson = () => {
    const payload = {
      investigationId: intelligence.investigationId,
      exportedAt: new Date().toISOString(),
      mode: dataMode,
      suspectAddress: intelligence.suspectAddress,
      targetVasp: intelligence.targetVasp,
      attributionConfidence: intelligence.attributionConfidence,
      nodes,
      edges,
      hops,
      intelligence
    };

    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `ANVESHAN_GRAPH_${intelligence.investigationId}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Top Application Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        dataMode={dataMode}
        setDataMode={(mode) => {
          setDataMode(mode);
          if (mode === 'ARCHIVE') {
            handleSelectCase(FORENSIC_CASES[0]);
          }
        }}
        selectedCase={selectedCase}
        onSelectCase={handleSelectCase}
        user={user}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        btcPriceUsd={btcPriceUsd}
      />

      {/* Forensic Search Console */}
      <SearchConsole
        onSearch={handleSearch}
        isLoading={isLoading}
        dataMode={dataMode}
      />

      {/* Status / Alert Banner */}
      {statusMessage && (
        <div className={`px-4 py-2 text-xs font-mono border-b flex items-center justify-between ${
          statusMessage.isError
            ? 'bg-black border border-neutral-700 text-[#F5D77F]'
            : 'bg-neutral-950 border border-neutral-800 text-neutral-200'
        }`}>
          <div className="max-w-7xl mx-auto w-full flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Forensic Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-4">
        {/* VIEW 1: TRACE VIEW */}
        {currentView === 'trace' && (
          <div className="space-y-4">
            {/* Top Workspace Split: Graph Canvas on Left, Intelligence Panel on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left / Main Graph Canvas */}
              <div className="lg:col-span-8 space-y-2">
                <div className="flex items-center justify-between px-1 text-xs font-mono text-neutral-400">
                  <span className="font-bold flex items-center space-x-1.5 text-white">
                    <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>INTERACTIVE ATTRIBUTION GRAPH ({nodes.length} NODES, {edges.length} EDGES)</span>
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Click node for wallet forensics • Click edge for underlying tx
                  </span>
                </div>

                <GraphCanvas
                  nodes={nodes}
                  edges={edges}
                  selectedNodeId={selectedNode?.id}
                  selectedEdgeId={selectedEdge?.id}
                  onSelectNode={handleSelectNode}
                  onSelectEdge={handleSelectEdge}
                  isArchived={dataMode === 'ARCHIVE'}
                />
              </div>

              {/* Right Intelligence Panel */}
              <div className="lg:col-span-4">
                <ForensicIntelligencePanel
                  intelligence={intelligence}
                  hops={hops}
                  onOpenSeizureModal={() => setIsSeizureModalOpen(true)}
                  onDownloadGraphJson={handleDownloadGraphJson}
                  onSaveToDrive={() => setIsDriveModalOpen(true)}
                  onOpenAuditModal={() => setIsAuditModalOpen(true)}
                  btcPriceUsd={btcPriceUsd}
                />
              </div>
            </div>

            {/* Bottom Timeline View */}
            <ForensicTimelineView
              hops={hops}
              onSelectTx={async (txid) => {
                try {
                  const tx = await blockchainService.getTransaction(txid);
                  setInspectedTx(tx);
                } catch {
                  const caseTx = selectedCase.transactions.find(t => t.txid === txid);
                  if (caseTx) setInspectedTx(caseTx);
                }
              }}
              onSelectAddress={async (addr) => {
                try {
                  const wallet = await blockchainService.getAddress(addr);
                  setInspectedWallet(wallet);
                } catch {
                  const caseW = selectedCase.wallets[addr];
                  if (caseW) setInspectedWallet(caseW);
                }
              }}
              btcPriceUsd={btcPriceUsd}
            />
          </div>
        )}

        {/* VIEW 2: EXPLORER VIEW (Deep Blockchain Data) */}
        {currentView === 'explorer' && (
          <div className="space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <h2 className="font-bold text-sm tracking-wide text-white flex items-center space-x-2">
                <Radio className="w-4 h-4 text-[#D4AF37]" />
                <span>DEEP BLOCKCHAIN EXPLORER (LIVE MAINNET)</span>
              </h2>
              <span className="text-xs text-neutral-400">
                Latest blocks, transactions, and addresses
              </span>
            </div>

            {/* Latest Blocks Grid */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-400">LATEST VERIFIED BITCOIN BLOCKS:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {latestBlocks.map((b) => (
                  <button
                    key={b.height}
                    onClick={() => setInspectedBlock(b)}
                    className="bg-neutral-950 border border-neutral-800 hover:border-[#D4AF37] rounded-lg p-2.5 text-left transition-all group"
                  >
                    <span className="text-[#F5D77F] font-bold text-xs block group-hover:text-white transition-colors">#{b.height}</span>
                    <span className="text-[10px] text-neutral-400 block truncate">{b.miner}</span>
                    <span className="text-[10px] text-neutral-500 block">{b.txCount} txs • {b.age}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Inspector Display if Open */}
            {inspectedBlock && (
              <BlockInspector
                block={inspectedBlock}
                onClose={() => setInspectedBlock(null)}
                onNavigateBlock={async (h) => {
                  try {
                    const blk = await blockchainService.getBlock(h);
                    setInspectedBlock(blk);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                btcPriceUsd={btcPriceUsd}
              />
            )}

            {inspectedTx && (
              <TransactionInspector
                tx={inspectedTx}
                onClose={() => setInspectedTx(null)}
                onNavigateAddress={async (addr) => {
                  const w = await blockchainService.getAddress(addr);
                  setInspectedWallet(w);
                }}
                btcPriceUsd={btcPriceUsd}
              />
            )}

            {inspectedWallet && (
              <WalletInspector
                wallet={inspectedWallet}
                onClose={() => setInspectedWallet(null)}
                onSelectTx={async (txid) => {
                  const t = await blockchainService.getTransaction(txid);
                  setInspectedTx(t);
                }}
                btcPriceUsd={btcPriceUsd}
              />
            )}
          </div>
        )}

        {/* VIEW 3: VASP REGISTRY */}
        {currentView === 'registry' && (
          <VaspRegistryView />
        )}

        {/* VIEW 4: CUSTODY VAULT */}
        {currentView === 'custody' && (
          <CustodyView />
        )}
      </main>

      {/* Floating Active Inspectors (when in Trace View) */}
      {currentView === 'trace' && inspectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="max-w-4xl w-full">
            <TransactionInspector
              tx={inspectedTx}
              onClose={() => setInspectedTx(null)}
              onNavigateAddress={async (addr) => {
                try {
                  const w = await blockchainService.getAddress(addr);
                  setInspectedWallet(w);
                } catch {
                  const caseW = selectedCase.wallets[addr];
                  if (caseW) setInspectedWallet(caseW);
                }
              }}
              btcPriceUsd={btcPriceUsd}
            />
          </div>
        </div>
      )}

      {currentView === 'trace' && inspectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="max-w-4xl w-full">
            <WalletInspector
              wallet={inspectedWallet}
              onClose={() => setInspectedWallet(null)}
              onSelectTx={async (txid) => {
                try {
                  const t = await blockchainService.getTransaction(txid);
                  setInspectedTx(t);
                } catch {
                  const caseT = selectedCase.transactions.find(tx => tx.txid === txid);
                  if (caseT) setInspectedTx(caseT);
                }
              }}
              btcPriceUsd={btcPriceUsd}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {isSeizureModalOpen && (
        <SeizureNoticeModal
          intelligence={intelligence}
          hops={hops}
          onClose={() => setIsSeizureModalOpen(false)}
          caseRefNumber={selectedCase.caseCode}
        />
      )}

      {isAuditModalOpen && (
        <AuditDebugModal
          intelligence={intelligence}
          hops={hops}
          onClose={() => setIsAuditModalOpen(false)}
        />
      )}

      <DriveWorkspaceModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        user={user}
        onLoadCaseFile={(content, filename) => {
          try {
            const parsed = JSON.parse(content);
            if (parsed.nodes && parsed.edges && parsed.intelligence) {
              setNodes(parsed.nodes);
              setEdges(parsed.edges);
              setHops(parsed.hops || []);
              setIntelligence(parsed.intelligence);
              setCurrentView('trace');
              setIsDriveModalOpen(false);
            }
          } catch {
            alert(`Loaded file ${filename}, but it did not contain a valid Anveshan graph JSON.`);
          }
        }}
      />
    </div>
  );
}
