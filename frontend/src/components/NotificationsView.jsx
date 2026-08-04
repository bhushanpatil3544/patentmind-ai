import React from 'react';
import { Bell, Sparkles, AlertTriangle, ShieldAlert, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

export default function NotificationsView() {
  const notifications = [
    { type: 'alert', title: 'Prior-Art Monitor Alert: US10922485B2', desc: 'A new USPTO patent filing (US2026001289) matches 91.4% with your monitored vector embedding index.', time: '10 minutes ago', priority: 'HIGH' },
    { type: 'system', title: 'PaddleOCR Ingestion Pipeline Completed', desc: 'Batch ingestion of 45 patent PDFs finished with 100% OCR text extraction precision.', time: '1 hour ago', priority: 'NORMAL' },
    { type: 'team', title: 'New Team Member Joined Workspace', desc: 'Dr. Aris Thorne accepted your invitation to Project Alpha: Quantum Battery.', time: '3 hours ago', priority: 'NORMAL' }
  ];

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B7CFA]/10 border border-[#5B7CFA]/30 text-[#00C2FF] text-xs font-mono uppercase tracking-wider mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Prior-Art Radar & System Updates</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            Notifications Center
          </h1>
          <p className="text-sm text-slate-300 font-sans mt-1">
            Real-time alerts on competitor filings, prior-art monitor matches, and team activity.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((n, idx) => (
          <div key={idx} className="wrangler-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                n.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/30'
              }`}>
                {n.type === 'alert' ? '' : ''}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-white font-heading">{n.title}</h3>
                  <span className="text-[9px] font-mono text-slate-400">{n.time}</span>
                </div>
                <p className="text-xs text-slate-300 font-sans">{n.desc}</p>
              </div>
            </div>

            <button className="px-4 py-2 bg-white/5 border border-white/10 hover:border-[#00C2FF]/40 rounded-full text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5 whitespace-nowrap">
              <span>View Alert</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
