import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Network, 
  Search, 
  Filter, 
  RefreshCw, 
  Layers, 
  Sparkles, 
  User, 
  Building2, 
  Cpu, 
  FileText, 
  ArrowRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Info
} from 'lucide-react';

export default function KnowledgeGraphView({ onSelectPatent }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeFilter, setNodeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Mock graph dataset representing patent citations, assignees, inventors & tech categories
  const nodes = [
    { id: 'US10922485B2', label: 'US10922485B2', type: 'patent', title: 'Neural Vector Search System for Patent Vectors', assignee: 'Google LLC', date: '2024-02-15', x: 300, y: 180, val: 28 },
    { id: 'US11450291B1', label: 'US11450291B1', type: 'patent', title: 'Transformer Embedding Extraction Engine', assignee: 'OpenAI Inc', date: '2023-09-10', x: 520, y: 120, val: 24 },
    { id: 'EP3894012A1', label: 'EP3894012A1', type: 'patent', title: 'PaddleOCR High-Speed PDF Document Parser', assignee: 'Baidu Tech', date: '2023-11-28', x: 220, y: 340, val: 22 },
    { id: 'WO2024019283', label: 'WO2024019283', type: 'patent', title: 'Quantum Circuit Embedding Pipeline', assignee: 'IBM Corp', date: '2024-01-05', x: 620, y: 310, val: 20 },
    { id: 'inv_1', label: 'Dr. Aris Thorne', type: 'inventor', title: 'Lead AI Scientist', assignee: 'Google LLC', x: 180, y: 120, val: 16 },
    { id: 'inv_2', label: 'Elena Rostova', type: 'inventor', title: 'Senior NLP Fellow', assignee: 'OpenAI Inc', x: 680, y: 160, val: 16 },
    { id: 'comp_google', label: 'Google LLC', type: 'company', title: 'Enterprise Assignee', x: 380, y: 60, val: 32 },
    { id: 'comp_openai', label: 'OpenAI Inc', type: 'company', title: 'Enterprise Assignee', x: 580, y: 40, val: 30 },
    { id: 'tech_vector', label: 'Vector Indexing (G06F 16/90)', type: 'tech', title: 'CPC Class', x: 420, y: 260, val: 35 },
    { id: 'tech_ocr', label: 'OCR Extraction (G06V 30/10)', type: 'tech', title: 'CPC Class', x: 140, y: 260, val: 26 }
  ];

  const links = [
    { source: 'US10922485B2', target: 'comp_google', label: 'Assigned To' },
    { source: 'US10922485B2', target: 'inv_1', label: 'Invented By' },
    { source: 'US10922485B2', target: 'tech_vector', label: 'Classified In' },
    { source: 'US11450291B1', target: 'comp_openai', label: 'Assigned To' },
    { source: 'US11450291B1', target: 'inv_2', label: 'Invented By' },
    { source: 'US11450291B1', target: 'tech_vector', label: 'Cites Technique' },
    { source: 'US11450291B1', target: 'US10922485B2', label: 'Cites Prior Art' },
    { source: 'EP3894012A1', target: 'tech_ocr', label: 'Classified In' },
    { source: 'EP3894012A1', target: 'US10922485B2', label: 'Cited By' },
    { source: 'WO2024019283', target: 'tech_vector', label: 'Cross Citation' }
  ];

  const filteredNodes = nodes.filter(node => {
    if (nodeFilter !== 'all' && node.type !== nodeFilter) return false;
    if (searchQuery && !node.label.toLowerCase().includes(searchQuery.toLowerCase()) && !node.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getNodeColor = (type) => {
    switch (type) {
      case 'patent': return '#00C2FF';
      case 'inventor': return '#7B61FF';
      case 'company': return '#5B7CFA';
      case 'tech': return '#10B981';
      default: return '#94A3B8';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B7CFA]/10 border border-[#5B7CFA]/30 text-[#00C2FF] text-xs font-mono uppercase tracking-wider mb-2">
            <Network className="w-3.5 h-3.5" />
            <span>Interactive Citation & Entity Mapping</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            Patent Knowledge Graph
          </h1>
          <p className="text-sm text-slate-300 font-sans mt-1">
            Visualize semantic links between patents, corporate assignees, inventors, and technology classifications.
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search graph nodes..."
              className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00C2FF]/50 w-48 md:w-64"
            />
          </div>
          <button 
            onClick={() => setZoomLevel(1)}
            className="p-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-full text-slate-300 hover:text-white transition-all"
            title="Reset Zoom"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SVG Graph Viewport */}
        <div className="lg:col-span-3 wrangler-card p-6 relative overflow-hidden min-h-[550px] flex flex-col justify-between">
          
          {/* Node Filter Bar */}
          <div className="flex items-center justify-between gap-3 z-10 bg-[#050816]/80 backdrop-blur-md p-2 rounded-full border border-white/10 self-start max-w-full overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Entities', color: 'bg-white/20 text-white' },
              { id: 'patent', label: 'Patents', color: 'bg-[#00C2FF]/20 text-[#00C2FF] border-[#00C2FF]/40' },
              { id: 'company', label: 'Assignees', color: 'bg-[#5B7CFA]/20 text-[#5B7CFA] border-[#5B7CFA]/40' },
              { id: 'inventor', label: 'Inventors', color: 'bg-[#7B61FF]/20 text-[#7B61FF] border-[#7B61FF]/40' },
              { id: 'tech', label: 'Tech Domains', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setNodeFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border whitespace-nowrap ${
                  nodeFilter === f.id ? f.color : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* SVG Canvas */}
          <div className="relative w-full h-[420px] my-4 cursor-grab active:cursor-grabbing">
            <svg 
              className="w-full h-full" 
              viewBox="0 0 800 420"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.3s ease' }}
            >
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5B7CFA" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00C2FF" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Render Links */}
              {links.map((link, idx) => {
                const sourceNode = nodes.find(n => n.id === link.source);
                const targetNode = nodes.find(n => n.id === link.target);
                if (!sourceNode || !targetNode) return null;

                const isHighlighted = selectedNode && (selectedNode.id === link.source || selectedNode.id === link.target);

                return (
                  <g key={idx}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isHighlighted ? "#00C2FF" : "url(#lineGrad)"}
                      strokeWidth={isHighlighted ? 2.5 : 1.2}
                      strokeDasharray={link.label.includes('Cites') ? '4 4' : 'none'}
                    />
                  </g>
                );
              })}

              {/* Render Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const color = getNodeColor(node.type);

                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group"
                  >
                    {/* Outer Glow Halo */}
                    <circle
                      r={node.val + (isSelected ? 10 : 4)}
                      fill={color}
                      fillOpacity={isSelected ? 0.3 : 0.12}
                      className="transition-all duration-300 group-hover:fill-opacity-30"
                    />
                    
                    {/* Core Circle */}
                    <circle
                      r={node.val / 2.2}
                      fill="#050816"
                      stroke={color}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all duration-300 shadow-xl"
                    />

                    {/* Node Text Label */}
                    <text
                      y={node.val / 2 + 14}
                      textAnchor="middle"
                      fill={isSelected ? "#FFFFFF" : "#CBD5E1"}
                      fontSize={10}
                      fontWeight={isSelected ? "bold" : "medium"}
                      className="pointer-events-none select-none font-sans"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Footer Graph Toolbar */}
          <div className="flex items-center justify-between z-10 text-xs text-slate-400 font-mono pt-2 border-t border-white/10">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00C2FF]"></span> Patent</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#5B7CFA]"></span> Assignee</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7B61FF]"></span> Inventor</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Classification</span>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => setZoomLevel(z => Math.min(z + 0.2, 1.8))} className="p-1.5 hover:bg-white/10 rounded"><ZoomIn className="w-4 h-4" /></button>
              <button onClick={() => setZoomLevel(z => Math.max(z - 0.2, 0.6))} className="p-1.5 hover:bg-white/10 rounded"><ZoomOut className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Selected Entity Details Panel */}
        <div className="wrangler-card p-6 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-[#00C2FF]" />
              Entity Details Inspector
            </h3>

            {selectedNode ? (
              <div className="space-y-4 fade-in">
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#00C2FF]/15 text-[#00C2FF] border border-[#00C2FF]/30">
                      {selectedNode.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{selectedNode.date || 'Active Entity'}</span>
                  </div>
                  <h4 className="text-base font-bold text-white font-heading">{selectedNode.label}</h4>
                  <p className="text-xs text-slate-300">{selectedNode.title}</p>
                </div>

                <div className="space-y-2 text-xs font-sans text-slate-300">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400 font-mono">Assignee:</span>
                    <span className="font-medium text-white">{selectedNode.assignee || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400 font-mono">Connected Links:</span>
                    <span className="font-mono text-[#00C2FF]">
                      {links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).length} edges
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400 font-mono">Centrality Rank:</span>
                    <span className="font-mono text-emerald-400">Top 4%</span>
                  </div>
                </div>

                {selectedNode.type === 'patent' && (
                  <button
                    onClick={() => onSelectPatent && onSelectPatent(selectedNode.label)}
                    className="w-full py-2.5 btn-theme text-xs font-semibold rounded-xl flex items-center justify-center gap-2 mt-4"
                  >
                    <span>View Full Patent Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="py-16 text-center space-y-3 text-slate-400">
                <Network className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                <p className="text-xs">Click any node on the graph canvas to inspect its citations and entity links.</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-[11px] text-slate-400 space-y-1 font-mono">
            <span className="text-[#00C2FF] font-bold block">Graph Status:</span>
            <p>1,420 Nodes • 8,910 Edges Indexed in ChromaDB Vector Mesh</p>
          </div>
        </div>
      </div>
    </div>
  );
}
