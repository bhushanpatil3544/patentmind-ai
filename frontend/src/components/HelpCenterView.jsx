import React, { useState } from 'react';
import { HelpCircle, Search, FileText, CheckCircle2, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

export default function HelpCenterView() {
  const [query, setQuery] = useState('');

  const articles = [
    { title: 'How PaddleOCR Text Extraction Operates on Patent PDFs', category: 'PDF Ingestion', time: '4 min read' },
    { title: 'Configuring ChromaDB Vector Similarity Metrics (Cosine vs ANN)', category: 'Vector Search', time: '6 min read' },
    { title: 'Interpreting Knowledge Graph Citation Nodes & Clusters', category: 'Analytics', time: '3 min read' },
    { title: 'Setting Up Competitor Prior-Art Radar Notifications', category: 'Alerts', time: '5 min read' }
  ];

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B7CFA]/10 border border-[#5B7CFA]/30 text-[#00C2FF] text-xs font-mono uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Documentation & Knowledge Base</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            Help Center & Guides
          </h1>
          <p className="text-sm text-slate-300 font-sans mt-1">
            Learn how to leverage AI semantic search, prior-art analysis, and RAG chat assistants.
          </p>
        </div>

        {/* System Status Pill */}
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ALL SYSTEMS OPERATIONAL (99.98% UPTIME)</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="wrangler-card p-8 text-center space-y-4 max-w-3xl mx-auto">
        <h3 className="text-xl font-bold text-white font-heading">How can we assist your research today?</h3>
        <div className="relative max-w-xl mx-auto">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides, API docs, vector search tips..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#00C2FF]/50"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((art, idx) => (
          <div key={idx} className="wrangler-card p-6 space-y-3 hover:border-[#00C2FF]/40 transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#00C2FF] bg-[#5B7CFA]/15 px-2.5 py-0.5 rounded border border-[#5B7CFA]/30">
                {art.category}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{art.time}</span>
            </div>
            <h4 className="text-base font-bold text-white font-heading">{art.title}</h4>
            <div className="flex items-center gap-1 text-xs text-[#00C2FF] font-medium pt-2">
              <span>Read Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
