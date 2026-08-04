import React from 'react';
import { FileText, Shield, CheckCircle2 } from 'lucide-react';

export default function TermsOfServiceView() {
  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B7CFA]/10 border border-[#5B7CFA]/30 text-[#00C2FF] text-xs font-mono uppercase tracking-wider mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>Enterprise License Agreement</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs font-mono text-slate-400 mt-1">Effective Date: February 2026</p>
      </div>

      <div className="wrangler-card p-6 md:p-8 space-y-6 text-xs text-slate-300 font-sans leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white font-heading">1. Intellectual Property & Confidentiality</h2>
          <p>
            All patent research queries, extracted vector representations, and generated summary reports remain the sole intellectual property of the subscribing organization. PatentMind AI claims zero ownership rights over uploaded documents.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-white/10">
          <h2 className="text-base font-bold text-white font-heading">2. Service Level Agreement (SLA) & Uptime</h2>
          <p>
            Enterprise Tier subscriptions include a 99.9% uptime SLA guarantee for search endpoints, ChromaDB vector queries, and API key token authentication.
          </p>
        </section>
      </div>
    </div>
  );
}
