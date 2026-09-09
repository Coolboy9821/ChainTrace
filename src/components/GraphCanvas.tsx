import React, { useState, useRef } from 'react';
import { 
  ForensicGraphNode, 
  ForensicGraphEdge, 
  NodeClassification 
} from '../types/forensics';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Building2, 
  Share2, 
  Cpu, 
  Coins
} from 'lucide-react';

interface GraphCanvasProps {
  nodes: ForensicGraphNode[];
  edges: ForensicGraphEdge[];
  selectedNodeId?: string;
  selectedEdgeId?: string;
  onSelectNode: (node: ForensicGraphNode) => void;
  onSelectEdge: (edge: ForensicGraphEdge) => void;
  isArchived?: boolean;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
  isArchived
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [hopFilter, setHopFilter] = useState<number | 'all'>('all');
  const [minAmountFilter, setMinAmountFilter] = useState<number>(0);
  const [focusPathOnly, setFocusPathOnly] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom(prev => Math.min(2.5, Math.max(0.4, prev + zoomDelta)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 40, y: 30 });
  };

  // Node filtering
  const filteredNodes = nodes.filter(n => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (hopFilter !== 'all' && n.hop !== hopFilter) return false;
    if (focusPathOnly && n.type === 'change') return false;
    return true;
  });

  const visibleNodeIds = new Set(filteredNodes.map(n => n.id));

  // Edge filtering
  const filteredEdges = edges.filter(e => {
    if (!visibleNodeIds.has(e.source) || !visibleNodeIds.has(e.target)) return false;
    if (e.amountBtc < minAmountFilter) return false;
    if (focusPathOnly && e.isChange) return false;
    return true;
  });

  // Unique hops available
  const availableHops: number[] = Array.from(new Set(nodes.map(n => n.hop).filter((h): h is number => typeof h === 'number')));
  availableHops.sort((a: number, b: number) => a - b);

  // Black, Gold, Silver Node Styling
  const getNodeColor = (type: NodeClassification, isSelected: boolean) => {
    switch (type) {
      case 'suspect':
        // Suspect: High-contrast Silver/Platinum on Charcoal Obsidian
        return { 
          fill: '#121212', 
          stroke: '#E0E0E0', 
          text: '#FFFFFF', 
          badge: 'bg-neutral-900 text-white border-neutral-400' 
        };
      case 'vasp':
        // VASP: Radiant Polished Gold
        return { 
          fill: '#1a1608', 
          stroke: '#D4AF37', 
          text: '#F5D77F', 
          badge: 'bg-[#1a1608] text-[#F5D77F] border-[#D4AF37]' 
        };
      case 'mixer':
        // Mixer: Deep Metallic Gold
        return { 
          fill: '#241a06', 
          stroke: '#F5D77F', 
          text: '#F5D77F', 
          badge: 'bg-[#241a06] text-[#F5D77F] border-[#B38F4D]' 
        };
      case 'bridge':
        // Bridge: Bronze Gold
        return { 
          fill: '#1a1408', 
          stroke: '#C5A059', 
          text: '#E5C158', 
          badge: 'bg-[#1a1408] text-[#E5C158] border-[#8C6D31]' 
        };
      case 'change':
        // Change: Dark Gunmetal Silver
        return { 
          fill: '#0d0d0d', 
          stroke: '#525252', 
          text: '#A3A3A3', 
          badge: 'bg-neutral-900 text-neutral-400 border-neutral-700' 
        };
      case 'intermediate':
      default:
        // Intermediate: Brushed Platinum Silver
        return { 
          fill: '#171717', 
          stroke: '#A3A3A3', 
          text: '#E5E5E5', 
          badge: 'bg-neutral-900 text-neutral-200 border-neutral-600' 
        };
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className="relative w-full h-[540px] lg:h-[620px] bg-black border border-neutral-800 rounded-xl overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-inner"
    >
      {/* Background Blueprint Grid - Pure Black / Subtle Gold Matrix */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px), radial-gradient(#333333 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px'
        }}
      />

      {/* Floating Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 bg-neutral-950/95 border border-neutral-800 p-1.5 rounded-lg shadow-xl backdrop-blur">
        <button
          onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
          className="p-1.5 rounded hover:bg-neutral-850 text-neutral-300 hover:text-[#F5D77F] transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
          className="p-1.5 rounded hover:bg-neutral-850 text-neutral-300 hover:text-[#F5D77F] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 rounded hover:bg-neutral-850 text-neutral-300 hover:text-[#F5D77F] transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-neutral-800 mx-1" />

        <button
          onClick={() => setShowFilters(s => !s)}
          className={`px-2.5 py-1 rounded text-xs font-mono font-medium flex items-center space-x-1.5 transition-all ${
            showFilters ? 'bg-[#D4AF37]/20 text-[#F5D77F] border border-[#D4AF37]/60' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Filters</span>
        </button>

        <button
          onClick={() => setFocusPathOnly(f => !f)}
          className={`px-2.5 py-1 rounded text-xs font-mono font-medium flex items-center space-x-1.5 transition-all ${
            focusPathOnly ? 'bg-neutral-800 text-white border border-neutral-600' : 'text-neutral-400 hover:text-white'
          }`}
          title="Hides change outputs and unrelated side branches"
        >
          {focusPathOnly ? <Eye className="w-3.5 h-3.5 text-[#D4AF37]" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Focus Path</span>
        </button>
      </div>

      {/* Floating Filter Drawer */}
      {showFilters && (
        <div className="absolute top-14 left-3 z-10 bg-neutral-950/95 border border-neutral-800 p-3 rounded-lg shadow-2xl backdrop-blur max-w-xs text-xs font-mono space-y-2.5">
          <div>
            <label className="text-neutral-400 block mb-1">Node Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200"
            >
              <option value="all">All Types</option>
              <option value="suspect">Suspect Wallets</option>
              <option value="intermediate">Intermediate Wallets</option>
              <option value="vasp">VASP Endpoints</option>
              <option value="mixer">Mixers / CoinJoin</option>
              <option value="bridge">Cross-Chain Bridges</option>
              <option value="change">Change Outputs</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Hop Filter:</label>
            <select
              value={hopFilter}
              onChange={(e) => setHopFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200"
            >
              <option value="all">All Hops</option>
              {availableHops.map(h => (
                <option key={h} value={h}>Hop {h}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Min Forward Amount (BTC):</label>
            <input
              type="number"
              step="0.001"
              value={minAmountFilter}
              onChange={(e) => setMinAmountFilter(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200"
            />
          </div>
        </div>
      )}

      {/* Main SVG Graph */}
      <svg className="w-full h-full">
        <defs>
          {/* Gold Arrow marker for normal edges */}
          <marker
            id="arrowhead-gold"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#D4AF37" />
          </marker>
          {/* Bright Gold Selected Arrowhead */}
          <marker
            id="arrowhead-selected"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#F5D77F" />
          </marker>
          {/* Silver/White Break Arrowhead */}
          <marker
            id="arrowhead-break"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#FFFFFF" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Render Edges */}
          {filteredEdges.map((edge) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const sx = sourceNode.x ?? 100;
            const sy = sourceNode.y ?? 200;
            const tx = targetNode.x ?? 300;
            const ty = targetNode.y ?? 200;

            const isSelected = selectedEdgeId === edge.id;
            const isBreak = edge.provenanceBreak;

            // Compute midpoint for edge label
            const mx = (sx + tx) / 2;
            const my = (sy + ty) / 2 - 12;

            return (
              <g 
                key={edge.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEdge(edge);
                }}
                className="cursor-pointer group"
              >
                {/* Edge line */}
                <line
                  x1={sx}
                  y1={sy}
                  x2={tx}
                  y2={ty}
                  stroke={isBreak ? '#FFFFFF' : isSelected ? '#F5D77F' : edge.isChange ? '#525252' : '#D4AF37'}
                  strokeWidth={isSelected ? 3.5 : 2}
                  strokeDasharray={isBreak ? '4,4' : edge.isChange ? '5,5' : undefined}
                  markerEnd={isBreak ? 'url(#arrowhead-break)' : isSelected ? 'url(#arrowhead-selected)' : 'url(#arrowhead-gold)'}
                  className="transition-all"
                />

                {/* Amount pill along edge */}
                <g transform={`translate(${mx}, ${my})`}>
                  <rect
                    x="-42"
                    y="-10"
                    width="84"
                    height="20"
                    rx="4"
                    fill="#0a0a0a"
                    stroke={isSelected ? '#F5D77F' : edge.isChange ? '#404040' : '#8C6D31'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={isBreak ? '#FFFFFF' : isSelected ? '#F5D77F' : edge.isChange ? '#A3A3A3' : '#E5C158'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {edge.amountBtc.toFixed(4)} {edge.asset}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Render Nodes */}
          {filteredNodes.map((node) => {
            const nx = node.x ?? 200;
            const ny = node.y ?? 200;
            const isSelected = selectedNodeId === node.id;
            const colors = getNodeColor(node.type, isSelected);

            return (
              <g
                key={node.id}
                transform={`translate(${nx}, ${ny})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node);
                }}
                className="cursor-pointer group"
              >
                {/* Outer halo / selection indicator */}
                {isSelected && (
                  <circle
                    r="34"
                    fill="none"
                    stroke="#F5D77F"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    className="animate-spin"
                    style={{ transformOrigin: '0 0' }}
                  />
                )}

                {/* Node main circle */}
                <circle
                  r="26"
                  fill={colors.fill}
                  stroke={isSelected ? '#F5D77F' : colors.stroke}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all filter drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] group-hover:scale-105"
                />

                {/* Center Icon */}
                <g transform="translate(-8, -8)" pointerEvents="none">
                  {node.type === 'suspect' ? (
                    <ShieldAlert className="w-4 h-4 text-white" />
                  ) : node.type === 'vasp' ? (
                    <Building2 className="w-4 h-4 text-[#F5D77F]" />
                  ) : node.type === 'mixer' ? (
                    <Share2 className="w-4 h-4 text-[#F5D77F]" />
                  ) : node.type === 'bridge' ? (
                    <Cpu className="w-4 h-4 text-[#E5C158]" />
                  ) : (
                    <Coins className="w-4 h-4 text-[#A3A3A3]" />
                  )}
                </g>

                {/* Label Box */}
                <g transform="translate(0, 36)" pointerEvents="none">
                  <rect
                    x="-65"
                    y="-8"
                    width="130"
                    height="18"
                    rx="3"
                    fill="#0a0a0a"
                    stroke={isSelected ? '#F5D77F' : '#333333'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {node.entityName ? node.entityName.slice(0, 16) : node.label.slice(0, 16)}
                  </text>
                </g>

                {/* Hop badge pill */}
                <g transform="translate(20, -20)" pointerEvents="none">
                  <circle r="9" fill="#000000" stroke={colors.stroke} strokeWidth="1" />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#F5D77F"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    H{node.hop}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Mini-map in bottom-right corner */}
      <div className="absolute bottom-3 right-3 w-40 h-28 bg-neutral-950/95 border border-neutral-800 rounded-lg p-1.5 shadow-2xl backdrop-blur hidden sm:block pointer-events-none">
        <div className="text-[9px] font-mono text-neutral-400 mb-1 flex items-center justify-between">
          <span>MINIMAP</span>
          <span>{nodes.length} Nodes</span>
        </div>
        <div className="w-full h-20 bg-black rounded border border-neutral-800 relative overflow-hidden">
          {nodes.map(n => (
            <div
              key={n.id}
              className={`absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                n.type === 'suspect' ? 'bg-white' : n.type === 'vasp' ? 'bg-[#D4AF37]' : 'bg-neutral-400'
              }`}
              style={{
                left: `${Math.min(95, Math.max(5, ((n.x ?? 100) / 800) * 100))}%`,
                top: `${Math.min(95, Math.max(5, ((n.y ?? 200) / 450) * 100))}%`
              }}
            />
          ))}
        </div>
      </div>

      {/* Legend at bottom left */}
      <div className="absolute bottom-3 left-3 z-10 hidden md:flex items-center space-x-3 bg-neutral-950/90 border border-neutral-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-neutral-300 backdrop-blur">
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white border border-neutral-400" />
          <span>Suspect</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
          <span>Intermediate</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
          <span>VASP Cluster</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F5D77F]" />
          <span>Mixer/CoinJoin</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#525252]" />
          <span>Change</span>
        </span>
      </div>
    </div>
  );
};
