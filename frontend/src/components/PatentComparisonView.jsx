import React, { useState } from 'react';
import { 
  BarChart2, 
  ArrowLeftRight, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Building2, 
  FileText,
  Layers,
  Search,
  Scale
} from 'lucide-react';

export default function PatentComparisonView({ defaultPatentA, defaultPatentB }) {
  const [patentA, setPatentA] = useState(defaultPatentA || 'US10922485B2');
  const [patentB, setPatentB] = useState(defaultPatentB || 'US11450291B1');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const comparisonData = {
    similarityScore: 84.6,
    overlapRisk: 'MODERATE OVERLAP',
    patentA: {
      number: patentA,
      title: 'Neural Network Vector Search Architecture for Intellectual Property Datasets',
      assignee: 'Google LLC',
      cpc: 'G06F 16/9035',
      ocrEngine: 'PaddleOCR GPU Engine',
      vectorStore: 'ChromaDB ANN Graph',
      embeddingDim: '1536-dimensional',
      claimsCount: 18
    },
    patentB: {
      number: patentB,
      title: 'Transformer Embedding Extraction Engine for Large Legal Text Sets',
      assignee: 'OpenAI Inc',
      cpc: 'G06F 16/3000',
      ocrEngine: 'Tesseract OCR Pipeline',
      vectorStore: 'Faiss Flat Index',
      embeddingDim: '768-dimensional',
      claimsCount: 22
    },
    claimMatrix: [
      { feature: 'PDF Document Text Parsing', pA: 'High-speed PaddleOCR with GPU memory caching', pB: 'CPU-based Tesseract multi-threading', status: 'Differentiated' },
      { feature: 'Vector Embedding Dimension', pA: '1536-dimensional dense vector embeddings', pB: '768-dimensional transformer embeddings', status: 'Differentiated' },
      { feature: 'Vector Storage Indexing', pA: 'ChromaDB ANN graph with cosine distance', pB: 'Faiss L2 Euclidean distance index', status: 'Overlap' },
      { feature: 'RAG Citation System', pA: 'Line-number metadata reference extraction', pB: 'Page-level citation anchoring', status: 'Novel' }
    ]
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B7CFA]/10 border border-[#5B7CFA]/30 text-[#00C2FF] text-xs font-mono uppercase tracking-wider mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Side-by-Side Claim & Feature Analysis</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            Patent Comparison Matrix
          </h1>
          <p className="text-sm text-slate-300 font-sans mt-1">
            Compare claims, technical specifications, and infringement risk scores between two target patents.
          </p>
        </div>

        <button
          onClick={() => setIsAnalyzing(true)}
          className="btn-theme px-6 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Re-Run AI Comparison</span>
        </button>
      </div>

      {/* Patent Selector Cards Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patent A Card */}
        <div className="wrangler-card p-6 space-y-4 border-l-4 border-[#00C2FF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#00C2FF] uppercase">PATENT A (PRIMARY)</span>
            <input
              type="text"
              value={patentA}
              onChange={(e) => setPatentA(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs font-mono text-white text-right focus:outline-none focus:border-[#00C2FF]"
            />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">{comparisonData.patentA.title}</h3>
          <div className="text-xs text-slate-400 font-mono space-y-1">
            <div>Assignee: <span className="text-white font-medium">{comparisonData.patentA.assignee}</span></div>
            <div>CPC Code: <span className="text-[#00C2FF]">{comparisonData.patentA.cpc}</span></div>
          </div>
        </div>

        {/* Patent B Card */}
        <div className="wrangler-card p-6 space-y-4 border-l-4 border-[#7B61FF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#7B61FF] uppercase">PATENT B (REFERENCE)</span>
            <input
              type="text"
              value={patentB}
              onChange={(e) => setPatentB(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs font-mono text-white text-right focus:outline-none focus:border-[#7B61FF]"
            />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">{comparisonData.patentB.title}</h3>
          <div className="text-xs text-slate-400 font-mono space-y-1">
            <div>Assignee: <span className="text-white font-medium">{comparisonData.patentB.assignee}</span></div>
            <div>CPC Code: <span className="text-[#7B61FF]">{comparisonData.patentB.cpc}</span></div>
          </div>
        </div>
      </div>

      {/* Similarity Score Indicator Bar */}
      <div className="wrangler-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-[#5B7CFA]/10 via-[#7B61FF]/10 to-[#00C2FF]/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-[#00C2FF] bg-[#00C2FF]/10 flex items-center justify-center font-mono font-bold text-[#00C2FF] text-xl">
            {comparisonData.similarityScore}%
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-heading">Calculated Feature Overlap</h4>
            <p className="text-xs text-slate-300">
              84.6% claim similarity index detected across vector indexing structures.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
          ⚠️ {comparisonData.overlapRisk}
        </span>
      </div>

      {/* Side-by-Side Claim Feature Table */}
      <div className="wrangler-card p-6 space-y-4 overflow-x-auto">
        <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00C2FF]" />
          Technical Feature Comparison Breakdown
        </h3>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[10px]">
              <th className="py-3 px-4">Feature Element</th>
              <th className="py-3 px-4 text-[#00C2FF]">{patentA}</th>
              <th className="py-3 px-4 text-[#7B61FF]">{patentB}</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans">
            {comparisonData.claimMatrix.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-white">{row.feature}</td>
                <td className="py-3.5 px-4 text-slate-300 font-mono">{row.pA}</td>
                <td className="py-3.5 px-4 text-slate-300 font-mono">{row.pB}</td>
                <td className="py-3.5 px-4 text-right">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    row.status === 'Novel' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    row.status === 'Differentiated' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
