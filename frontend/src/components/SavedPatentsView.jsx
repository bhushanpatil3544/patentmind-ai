import React, { useState } from 'react';
import { Bookmark, FolderOpen, Tag, Trash2, ArrowRight, Download, Search, Sparkles } from 'lucide-react';

export default function SavedPatentsView({ onSelectPatent }) {
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const savedPatents = [
    { number: 'US10922485B2', title: 'Neural Vector Search System for Patent Vectors', folder: 'AI Chips 2026', date: 'Saved Feb 2, 2026', assignee: 'Google LLC' },
    { number: 'US11450291B1', title: 'Transformer Embedding Extraction Engine', folder: 'AI Chips 2026', date: 'Saved Jan 28, 2026', assignee: 'OpenAI Inc' },
    { number: 'EP3894012A1', title: 'PaddleOCR High-Speed PDF Document Parser', folder: 'OCR Engines', date: 'Saved Jan 15, 2026', assignee: 'Baidu Tech' },
    { number: 'WO2024019283', title: 'Quantum Circuit Embedding Pipeline', folder: 'Quantum Computing', date: 'Saved Jan 10, 2026', assignee: 'IBM Corp' }
  ];

  const folders = [
    { id: 'all', label: 'All Bookmarks', count: 4 },
    { id: 'AI Chips 2026', label: 'AI Chips 2026', count: 2 },
    { id: 'OCR Engines', label: 'OCR Engines', count: 1 },
    { id: 'Quantum Computing', label: 'Quantum Computing', count: 1 }
  ];

  const filtered = savedPatents.filter(p => {
    if (selectedFolder !== 'all' && p.folder !== selectedFolder) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.number.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B7CFA]/10 border border-[#5B7CFA]/30 text-[#00C2FF] text-xs font-mono uppercase tracking-wider mb-2">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Portfolio Collections</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            Saved Patents
          </h1>
          <p className="text-sm text-slate-300 font-sans mt-1">
            Access bookmarked patents, organize research dossiers into folders, and export technical briefs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved patents..."
              className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#00C2FF]/50 w-48 md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Main Folder + Patent List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Folders */}
        <div className="wrangler-card p-4 space-y-2 h-fit">
          <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block px-3 py-1">Research Folders</span>
          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFolder(f.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                selectedFolder === f.id
                  ? 'bg-gradient-to-r from-[#5B7CFA] to-[#00C2FF] text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#00C2FF]" />
                <span>{f.label}</span>
              </div>
              <span className="font-mono text-[10px] opacity-75">{f.count}</span>
            </button>
          ))}
        </div>

        {/* Patents Grid */}
        <div className="lg:col-span-3 space-y-4">
          {filtered.map((patent, idx) => (
            <div key={idx} className="wrangler-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[#00C2FF] px-2.5 py-0.5 rounded bg-[#5B7CFA]/15 border border-[#5B7CFA]/30">
                    {patent.number}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {patent.folder}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-heading">{patent.title}</h3>
                <span className="text-xs text-slate-400 font-mono">{patent.assignee} • {patent.date}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectPatent && onSelectPatent(patent.number)}
                  className="btn-theme px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
