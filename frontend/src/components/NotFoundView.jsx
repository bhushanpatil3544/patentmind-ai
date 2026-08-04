import React from 'react';
import { AlertCircle, Search, ArrowRight } from 'lucide-react';

export default function NotFoundView({ onNavigateHome }) {
  return (
    <div className="py-20 text-center space-y-6 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-full bg-[#5B7CFA]/15 border border-[#5B7CFA]/40 text-[#00C2FF] flex items-center justify-center mx-auto text-3xl font-mono shadow-[0_0_30px_rgba(0,194,255,0.3)]">
        404
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white font-heading">Patent Vector Not Found</h2>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          The patent document, research dossier, or route vector you requested does not exist in the active index.
        </p>
      </div>

      <button
        onClick={onNavigateHome}
        className="btn-theme px-6 py-3 rounded-full text-xs font-semibold inline-flex items-center gap-2 shadow-lg"
      >
        <Search className="w-4 h-4 text-white" />
        <span>Return to Workspace Search</span>
        <ArrowRight className="w-4 h-4 text-white/80" />
      </button>
    </div>
  );
}
