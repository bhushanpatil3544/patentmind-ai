import React, { useState } from 'react';
import { FolderOpen, Plus, CheckCircle2, Clock, Users, ArrowRight, Sparkles } from 'lucide-react';

export default function ProjectsView() {
  const [projects] = useState([
    { id: 1, name: 'Project Alpha: Quantum Battery Prior Art', progress: 85, patentsCount: 14, status: 'In Review', lead: 'Dr. Aris Thorne', updated: '2 hours ago' },
    { id: 2, name: 'Project Beta: Neural OCR Vector Indexing', progress: 100, patentsCount: 28, status: 'Completed', lead: 'Elena Rostova', updated: 'Yesterday' },
    { id: 3, name: 'Project Gamma: Solid State Electrolytes FTO', progress: 40, patentsCount: 9, status: 'Active Research', lead: 'Marcus Vance', updated: '3 days ago' }
  ]);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B7CFA]/10 border border-[#5B7CFA]/30 text-[#00C2FF] text-xs font-mono uppercase tracking-wider mb-2">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>IP Dossiers & Search Projects</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            Research Projects
          </h1>
          <p className="text-sm text-slate-300 font-sans mt-1">
            Organize freedom-to-operate (FTO) studies, prior-art clearance reviews, and team patent dossiers.
          </p>
        </div>

        <button className="btn-theme px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg">
          <Plus className="w-4 h-4" />
          <span>New Research Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map(p => (
          <div key={p.id} className="wrangler-card p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                  p.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                  p.status === 'In Review' ? 'bg-[#00C2FF]/15 text-[#00C2FF] border-[#00C2FF]/30' :
                  'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  {p.status}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{p.updated}</span>
              </div>

              <h3 className="text-base font-bold text-white font-heading">{p.name}</h3>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Progress Gauge</span>
                  <span className="text-white font-bold">{p.progress}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#5B7CFA] to-[#00C2FF]" style={{ width: `${p.progress}%` }}></div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#00C2FF]" /> {p.lead}</span>
              <span className="text-white font-bold">{p.patentsCount} Patents</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
