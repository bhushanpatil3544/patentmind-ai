import React from 'react';
import { Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyView() {
  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B7CFA]/10 border border-[#5B7CFA]/30 text-[#00C2FF] text-xs font-mono uppercase tracking-wider mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>Enterprise Data Protection Standards</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
          Privacy & Security Policy
        </h1>
        <p className="text-xs font-mono text-slate-400 mt-1">Last Updated: February 2026 • Enterprise Compliance Grade</p>
      </div>

      <div className="wrangler-card p-6 md:p-8 space-y-6 text-xs text-slate-300 font-sans leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#00C2FF]" />
            1. Zero Third-Party Model Training Guarantee
          </h2>
          <p>
            PatentMind AI operates strictly isolated vector database environments. Uploaded PDF patent documents, text chunks, and embedding vectors processed via PaddleOCR and ChromaDB are never submitted to public LLM training sets or third-party datasets.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-white/10">
          <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            2. End-to-End Encryption (AES-256)
          </h2>
          <p>
            All vector embeddings, database indices, and transmission logs are encrypted at rest using AES-256 encryption standards and in transit via TLS 1.3 encryption.
          </p>
        </section>
      </div>
    </div>
  );
}
