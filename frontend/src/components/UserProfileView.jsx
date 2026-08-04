import React from 'react';
import { User, Mail, Shield, Building2, Tag, Calendar, Sparkles } from 'lucide-react';

export default function UserProfileView({ username }) {
  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B7CFA]/10 border border-[#5B7CFA]/30 text-[#00C2FF] text-xs font-mono uppercase tracking-wider mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Account & Professional Credentials</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            User Profile
          </h1>
          <p className="text-sm text-slate-300 font-sans mt-1">
            Manage your personal researcher identity, organization affiliation, and domain focus.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="wrangler-card p-6 text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#5B7CFA] via-[#7B61FF] to-[#00C2FF] p-[2px] mx-auto shadow-[0_0_30px_rgba(0,194,255,0.4)]">
            <div className="w-full h-full bg-[#050816] rounded-full flex items-center justify-center text-[#00C2FF] font-bold text-3xl font-mono">
              {(username || 'P')[0].toUpperCase()}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">{username || 'Bhushan Patil'}</h2>
            <span className="text-xs font-mono text-[#00C2FF]">Senior Patent Strategy Advisor</span>
          </div>
          <div className="pt-3 border-t border-white/10 text-xs text-slate-400 font-mono space-y-1">
            <div>Organization: <span className="text-white font-medium">PatentMind AI R&D</span></div>
            <div>Member Since: <span className="text-white font-medium">2025-08-01</span></div>
          </div>
        </div>

        <div className="lg:col-span-2 wrangler-card p-6 space-y-6">
          <h3 className="text-sm font-bold text-white font-heading">Research Domain Focus</h3>
          <div className="flex flex-wrap gap-2">
            {['G06F 16/90 (Vector Search)', 'G06V 30/10 (OCR Text Extraction)', 'G06N 20/00 (Deep Learning RAG)', 'H01M 10/052 (Solid-State Batteries)'].map((domain, i) => (
              <span key={i} className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                {domain}
              </span>
            ))}
          </div>

          <h3 className="text-sm font-bold text-white font-heading pt-4 border-t border-white/10">Activity Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center font-mono text-xs">
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-[#00C2FF] font-bold text-lg block">482</span>
              <span className="text-slate-400 text-[10px]">SEARCHES RUN</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-emerald-400 font-bold text-lg block">34</span>
              <span className="text-slate-400 text-[10px]">PATENTS SAVED</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-[#7B61FF] font-bold text-lg block">12</span>
              <span className="text-slate-400 text-[10px]">PDFS INGESTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
