import React, { useState } from 'react';
import { KeyRound, Plus, Copy, Trash2, CheckCircle2, Shield, Code, Terminal, Sparkles } from 'lucide-react';

export default function ApiKeysView() {
  const [keys, setKeys] = useState([
    { name: 'Production RAG Ingestion Key', key: 'pm_live_94f8a...3b21', created: '2026-01-15', lastUsed: '2 mins ago' },
    { name: 'Developer Staging Key', key: 'pm_test_12c4d...8e90', created: '2026-02-01', lastUsed: 'Yesterday' }
  ]);
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, idx) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(idx);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B7CFA]/10 border border-[#5B7CFA]/30 text-[#00C2FF] text-xs font-mono uppercase tracking-wider mb-2">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Developer Credentials & Endpoint Access</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            API Keys Management
          </h1>
          <p className="text-sm text-slate-300 font-sans mt-1">
            Generate and manage secret keys to query vector search endpoints and PDF extraction engines programmatically.
          </p>
        </div>

        <button 
          onClick={() => {
            const newK = { name: `API Key #${keys.length + 1}`, key: `pm_live_${Math.random().toString(36).substring(2, 10)}`, created: 'Just now', lastUsed: 'Never' };
            setKeys([...keys, newK]);
          }}
          className="btn-theme px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Create Secret Key</span>
        </button>
      </div>

      {/* Keys Table */}
      <div className="wrangler-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white font-heading">Active API Secret Keys</h3>
        <div className="divide-y divide-white/5 font-mono text-xs">
          {keys.map((k, idx) => (
            <div key={idx} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-white font-sans">{k.name}</h4>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-[#00C2FF] bg-[#5B7CFA]/15 px-2 py-0.5 rounded border border-[#5B7CFA]/30">{k.key}</span>
                  <span>Created: {k.created}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => copyToClipboard(k.key, idx)}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-[#00C2FF]/40 rounded-lg text-slate-300 hover:text-white flex items-center gap-1.5 transition-all text-xs"
                >
                  {copiedKey === idx ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#00C2FF]" />}
                  <span>{copiedKey === idx ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Snippet Box */}
      <div className="wrangler-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00C2FF]" />
          Python Integration Snippet
        </h3>

        <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-[#00C2FF] overflow-x-auto leading-relaxed">
{`import requests

url = "https://patentmind-ai.vercel.app/api/v1/search"
headers = {
    "Authorization": "Bearer pm_live_94f8a...3b21",
    "Content-Type": "application/json"
}
payload = {
    "query": "Neural vector search system for PDF patent documents",
    "top_k": 5
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`}
        </pre>
      </div>
    </div>
  );
}
