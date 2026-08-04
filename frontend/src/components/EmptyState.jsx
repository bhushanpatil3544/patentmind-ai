import React from 'react';
import { Search, FolderOpen, Bell, UploadCloud, FileText } from 'lucide-react';

export default function EmptyState({ title, description, icon: Icon = Search, actionLabel, onAction }) {
  return (
    <div className="wrangler-card p-12 text-center space-y-4 max-w-md mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-[#38BDF8] flex items-center justify-center mx-auto">
        <Icon className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-white font-heading">{title || 'No Items Found'}</h3>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          {description || 'There are no active records in this view right now.'}
        </p>
      </div>

      {actionLabel && (
        <button
          onClick={onAction}
          className="btn-theme px-6 py-2.5 rounded-xl text-xs font-medium inline-flex items-center gap-2 mt-2"
        >
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
