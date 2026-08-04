import React from 'react';
import { CreditCard, CheckCircle2, Download, Sparkles, Zap, Shield } from 'lucide-react';

export default function BillingView() {
  const plans = [
    { name: 'Starter', price: '$49', period: '/month', features: ['500 OCR PDF Ingestions/mo', '1,000 Vector Searches', 'Basic RAG Chatbot'], current: false },
    { name: 'Professional', price: '$149', period: '/month', features: ['5,000 OCR PDF Ingestions/mo', '25,000 Vector Searches', 'Prior-Art Radar Alerts', 'Knowledge Graph'], current: false },
    { name: 'Enterprise SaaS', price: '$499', period: '/month', features: ['50,000 OCR PDF Ingestions/mo', '100,000 Vector Searches', 'Dedicated ChromaDB Cluster', '24/7 Priority SLA Support', '10 Team Member Seats'], current: true }
  ];

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B7CFA]/10 border border-[#5B7CFA]/30 text-[#00C2FF] text-xs font-mono uppercase tracking-wider mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Subscription & Usage Quotas</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            Billing & Usage
          </h1>
          <p className="text-sm text-slate-300 font-sans mt-1">
            Manage your organization plan tier, inspect OCR vector query quotas, and download invoices.
          </p>
        </div>
      </div>

      {/* Quota Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="wrangler-card p-6 space-y-3">
          <div className="flex justify-between text-xs font-mono text-slate-300">
            <span>OCR PDF Ingestion Quota</span>
            <span className="text-[#00C2FF] font-bold">14,250 / 50,000 Pages (28.5%)</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#5B7CFA] to-[#00C2FF]" style={{ width: '28.5%' }}></div>
          </div>
        </div>

        <div className="wrangler-card p-6 space-y-3">
          <div className="flex justify-between text-xs font-mono text-slate-300">
            <span>Vector Search Query Quota</span>
            <span className="text-[#7B61FF] font-bold">8,420 / 100,000 Queries (8.4%)</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#7B61FF] to-[#00C2FF]" style={{ width: '8.4%' }}></div>
          </div>
        </div>
      </div>

      {/* Pricing Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p, idx) => (
          <div key={idx} className={`wrangler-card p-6 space-y-6 flex flex-col justify-between ${
            p.current ? 'border-2 border-[#00C2FF] shadow-[0_0_30px_rgba(0,194,255,0.2)]' : ''
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white font-heading">{p.name}</h3>
                {p.current && (
                  <span className="text-[10px] font-mono font-bold text-[#00C2FF] bg-[#5B7CFA]/15 px-2.5 py-0.5 rounded-full border border-[#5B7CFA]/30">
                    ACTIVE PLAN
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 font-heading">
                <span className="text-4xl font-extrabold text-white">{p.price}</span>
                <span className="text-xs text-slate-400 font-mono">{p.period}</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300 font-sans border-t border-white/10 pt-4">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00C2FF]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button className={`w-full py-2.5 rounded-xl text-xs font-semibold ${
              p.current ? 'bg-white/10 text-white cursor-default' : 'btn-theme text-white'
            }`}>
              {p.current ? 'Current Subscription' : 'Upgrade Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
