import React, { useState } from 'react';
import { Mail, Phone, Send, CheckCircle2, Building2, Sparkles } from 'lucide-react';

export default function ContactView() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', org: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B7CFA]/10 border border-[#5B7CFA]/30 text-[#00C2FF] text-xs font-mono uppercase tracking-wider mb-2">
            <Mail className="w-3.5 h-3.5" />
            <span>Enterprise Support & Priority Sales</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            Contact PatentMind AI
          </h1>
          <p className="text-sm text-slate-300 font-sans mt-1">
            Reach out to our IP engineering specialists for custom deployment, SLA support, or sales inquiries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="wrangler-card p-6 space-y-6">
          <h3 className="text-base font-bold text-white font-heading">Enterprise Support Office</h3>
          <div className="space-y-4 text-xs font-sans text-slate-300">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#00C2FF] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-semibold block">Email Support</span>
                <span className="font-mono text-slate-400">enterprise@patentmind.ai</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-[#00C2FF] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-semibold block">Headquarters</span>
                <span className="font-mono text-slate-400">Silicon Valley • Mountain View, CA</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#5B7CFA]/10 border border-[#5B7CFA]/30 rounded-xl text-xs space-y-1 font-mono text-slate-300">
            <span className="text-[#00C2FF] font-bold block uppercase">Priority SLA Guarantee:</span>
            <p>Enterprise Tier requests receive guaranteed responses in under 2 hours.</p>
          </div>
        </div>

        <div className="lg:col-span-2 wrangler-card p-6 md:p-8 space-y-6">
          {submitted ? (
            <div className="py-16 text-center space-y-4 fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white font-heading">Message Dispatched Successfully</h3>
              <p className="text-xs text-slate-300 font-sans max-w-md mx-auto">
                Thank you for reaching out. An IP Strategy Engineer will contact your organization shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-mono block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00C2FF]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-mono block mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jane@company.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00C2FF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-mono block mb-1">Organization Name</label>
                <input
                  type="text"
                  value={form.org}
                  onChange={(e) => setForm({ ...form, org: e.target.value })}
                  placeholder="Acme Legal IP Corp"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00C2FF]"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono block mb-1">Inquiry Details</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your research requirements or SLA support needs..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00C2FF] resize-none"
                />
              </div>

              <button type="submit" className="w-full py-3.5 btn-theme font-semibold text-xs rounded-xl flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
