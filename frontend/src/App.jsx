import React, { useState } from 'react';
import { 
  MessageSquare, UploadCloud, Search, Download, FileText, Settings, ShieldCheck, Sparkles, 
  ArrowUp, Volume2, User, Lightbulb, Zap, CheckCircle2, ChevronDown, LogOut 
} from 'lucide-react';

export default function App() {
  const [token, setToken] = useState('demo_token');
  const [username, setUsername] = useState('Bhushan');
  const [userRole, setUserRole] = useState('admin');
  const [activeTab, setActiveTab] = useState('chat');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState('');
  const [isProUnlocked, setIsProUnlocked] = useState(false);

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `PatentMind AI Analysis for "${userMsg}":\n\n1. **Prior Art Context**: Evaluated USPTO & EPO patent databases for overlapping claims.\n2. **Strategy Suggestion**: Differentiate key claims by specifying novelty in the embedded architecture.\n3. **Recommended Action**: Study Patent US10922485B2 for structural comparisons.`
        }
      ]);
      setChatLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-white flex flex-row font-sans relative overflow-x-hidden selection:bg-[#00F2FE] selection:text-black">
      
      {/* Ambient Liquid Backdrops */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#00F2FE]/10 blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[20%] w-[450px] h-[450px] rounded-full bg-[#38BDF8]/10 blur-[130px]"></div>
      </div>

      {/* ULTRA-COMPACT ICON SIDEBAR (72px) */}
      <aside className="w-[72px] bg-[#050609] border-r border-white/10 h-screen flex flex-col justify-between items-center py-6 flex-shrink-0 z-40 sticky top-0 left-0">
        <div className="flex flex-col items-center gap-6">
          <div 
            onClick={() => setActiveTab('chat')}
            className="w-10 h-10 rounded-xl overflow-hidden bg-[#12141C] border border-[#00F2FE]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.3)] cursor-pointer hover:scale-105 transition-transform p-1"
            title="PatentMind AI Workspace"
          >
            <img src="/logo.jpg" alt="PatentMind Logo" className="w-full h-full object-cover rounded-lg" />
          </div>

          <nav className="flex flex-col items-center gap-4">
            <button
              onClick={() => setActiveTab('chat')}
              className={`p-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              title="AI Chat"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`p-3 rounded-xl transition-all ${activeTab === 'search' ? 'bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              title="Semantic Patent Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`p-3 rounded-xl transition-all ${activeTab === 'upload' ? 'bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              title="Upload & Compare"
            >
              <UploadCloud className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`p-3 rounded-xl transition-all ${activeTab === 'docs' ? 'bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              title="My Documents"
            >
              <FileText className="w-5 h-5" />
            </button>

            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`p-3 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title="Admin Control Panel"
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
            )}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={() => setActiveTab('settings')}
            className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* MAIN MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10 overflow-y-auto">
        
        {/* TOP HEADER BAR */}
        <header className="sticky top-0 z-30 bg-[#08090D]/90 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 border border-white/10 p-0.5">
              <img src="/logo.jpg" alt="PatentMind Logo" className="w-full h-full object-cover rounded" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">PatentMind AI</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-xs font-medium text-white flex items-center gap-1.5 transition-all shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00F2FE]" />
              <span>{isProUnlocked ? 'PRO UNLOCKED' : '✨ Upgrade'}</span>
            </button>

            <div 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-[#12141C] border border-white/10 rounded-full cursor-pointer hover:border-white/20 transition-all"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-[#00F2FE]/40">
                <img src="/logo.jpg" alt="User" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-medium text-slate-200">{username || 'Bhushan'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 flex flex-col justify-between">
          
          {/* TAB 1: AI CHAT (AETHER AI TEMPLATE) */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col space-y-6 justify-between min-h-[75vh]">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-4 space-y-6 my-auto">
                  
                  {/* Centered Logo Badge */}
                  <div className="w-16 h-16 rounded-2xl bg-[#12141C] border border-white/10 p-2 shadow-2xl flex items-center justify-center">
                    <img src="/logo.jpg" alt="PatentMind Logo" className="w-full h-full object-cover rounded-xl" />
                  </div>

                  {/* Greeting Text */}
                  <div className="space-y-1 text-center">
                    <h1 className="text-3xl md:text-4xl font-normal tracking-tight text-slate-200">
                      Good to See You!
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white">
                      How Can I be an Assistance?
                    </h2>
                    <p className="text-xs text-slate-400 pt-1">
                      I'm available 24/7 for you, ask me anything.
                    </p>
                  </div>

                  {/* Floating Prompt Box Container */}
                  <div className="w-full max-w-xl bg-[#12141D] border border-white/10 rounded-2xl p-4 shadow-2xl text-left space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-white/5">
                      <button onClick={() => setShowUpgradeModal(true)} className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Unlock more features with the Pro plan.</span>
                      </button>
                      <div className="flex items-center gap-1.5 text-emerald-400 text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Active extensions</span>
                      </div>
                    </div>

                    <form onSubmit={handleChatSubmit} className="flex items-center gap-3 bg-black/30 border border-white/5 rounded-xl px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className="text-slate-400 hover:text-white text-lg font-light px-1"
                        title="Attach PDF Document"
                      >
                        +
                      </button>
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask anything..."
                        className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none py-1"
                      />
                      <button
                        type="button"
                        className="text-slate-400 hover:text-[#00F2FE] p-1"
                        title="Voice Input"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        type="submit"
                        disabled={!chatInput.trim() || chatLoading}
                        className="w-8 h-8 rounded-lg bg-[#00F2FE] text-[#050609] flex items-center justify-center font-bold hover:scale-105 transition-transform disabled:opacity-40"
                      >
                        <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </form>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setChatInput("Search for recent AI prior-art patents in USPTO database")}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-[11px] text-slate-300 flex items-center gap-1.5 transition-all"
                      >
                        <User className="w-3 h-3 text-[#00F2FE]" />
                        <span>Any advice for me?</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-[11px] text-slate-300 flex items-center gap-1.5 transition-all"
                      >
                        <FileText className="w-3 h-3 text-[#38BDF8]" />
                        <span>Upload & compare PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setChatInput("Explain freedom to operate patent strategy")}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-[11px] text-slate-300 flex items-center gap-1.5 transition-all"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>Patent strategy lessons</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 pt-2">
                    Unlock new era with PatentMind AI. <button onClick={() => setShowUpgradeModal(true)} className="underline text-slate-400 hover:text-white">share us</button>
                  </p>
                </div>
              ) : (
                <div className="space-y-4 flex-1 overflow-y-auto">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-[#00F2FE]/10 text-white border border-[#00F2FE]/30 ml-auto' : 'bg-[#12141D] text-slate-200 border border-white/10'}`}>
                      <div className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                        {msg.role === 'user' ? 'You' : 'PatentMind AI Bot'}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="p-4 bg-[#12141D] rounded-2xl border border-white/10 text-xs text-[#00F2FE] animate-pulse">
                      Analyzing patent vectors and generating RAG response...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: SEMANTIC PATENT SEARCH */}
          {activeTab === 'search' && (
            <div className="space-y-6 max-w-4xl mx-auto w-full py-4">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Semantic Patent Vector Search</h2>
                <p className="text-xs text-slate-400">Search over 10M+ USPTO and global patent documents using natural language embeddings.</p>
              </div>

              <div className="flex gap-2 bg-[#12141D] border border-white/10 rounded-2xl p-2 shadow-xl">
                <input
                  type="text"
                  placeholder="Describe your invention concept (e.g. neural network hardware accelerator with low power)..."
                  className="flex-1 bg-transparent px-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => alert("Searching USPTO vector store...")}
                  className="px-6 py-2.5 bg-[#00F2FE] text-[#050609] font-bold text-xs rounded-xl hover:bg-[#38BDF8] transition-all flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search DB</span>
                </button>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Featured Patent Matches</h3>
                
                <div className="bg-[#12141D] border border-white/10 rounded-2xl p-6 space-y-3 hover:border-[#00F2FE]/40 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-[#00F2FE] font-bold">US10922485B2</span>
                      <h4 className="text-base font-semibold text-white mt-1">Neural Hardware Accelerator for AI Inference</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Assignee: PatentMind Systems Inc • Granted: 2024-03-12</p>
                    </div>
                    <span className="px-3 py-1 bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30 rounded-full text-xs font-mono">
                      94% Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    An integrated circuit architecture configured for high-throughput vector computations with reduced latency and power consumption.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => alert("Downloading Patent Specification PDF...")}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-200 flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-[#00F2FE]" />
                      <span>Download Patent PDF</span>
                    </button>
                  </div>
                </div>

                <div className="bg-[#12141D] border border-white/10 rounded-2xl p-6 space-y-3 hover:border-[#00F2FE]/40 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-[#00F2FE] font-bold">US11450291B1</span>
                      <h4 className="text-base font-semibold text-white mt-1">Real-Time Vector Similarity Search Engine</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Assignee: Deepmind Technologies • Granted: 2023-11-05</p>
                    </div>
                    <span className="px-3 py-1 bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30 rounded-full text-xs font-mono">
                      88% Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Method and apparatus for indexing high-dimensional patent embeddings in distributed memory stores for prior-art discovery.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => alert("Downloading Patent Specification PDF...")}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-200 flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-[#00F2FE]" />
                      <span>Download Patent PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD & COMPARE */}
          {activeTab === 'upload' && (
            <div className="space-y-6 max-w-2xl mx-auto w-full py-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Compare Document with Patent DB</h2>
                <p className="text-xs text-slate-400">Upload your PDF research paper or technical disclosure to compare against existing patents.</p>
              </div>

              <div className="border-2 border-dashed border-white/20 rounded-3xl p-12 text-center bg-[#12141D] hover:border-[#00F2FE]/50 transition-all cursor-pointer">
                <UploadCloud className="w-12 h-12 text-[#00F2FE] mx-auto mb-4" />
                <h3 className="text-sm font-semibold text-white">Drop your PDF document here</h3>
                <p className="text-xs text-slate-400 mt-1">Supports PDF files up to 50MB</p>
                <button className="mt-4 px-6 py-2.5 bg-[#00F2FE] text-[#050609] font-bold text-xs rounded-xl hover:bg-[#38BDF8] transition-all">
                  Select File
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MY DOCUMENTS */}
          {activeTab === 'docs' && (
            <div className="space-y-6 max-w-4xl mx-auto w-full py-8">
              <h2 className="text-2xl font-bold text-white">My Patent Documents</h2>
              <div className="bg-[#12141D] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/5 text-xs text-slate-400">
                  <span>Document Name</span>
                  <span>Uploaded Date</span>
                  <span>Action</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-200">
                  <span className="font-medium">AI_Neural_Architecture_Patent.pdf</span>
                  <span className="text-slate-500">2026-08-08</span>
                  <button className="text-[#00F2FE] hover:underline">Chat with PDF</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN CONTROL PANEL */}
          {activeTab === 'admin' && (
            <div className="space-y-6 max-w-5xl mx-auto w-full py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
                  <p className="text-xs text-slate-400">System user management and usage analytics</p>
                </div>
                <div className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/40 rounded-full text-xs font-mono">
                  ADMIN LOGGED IN: BHUSHAN
                </div>
              </div>

              <div className="bg-[#12141D] border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Registered Users Directory</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="text-[10px] uppercase bg-white/5 text-slate-400 border-b border-white/10">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Username</th>
                        <th className="p-3">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="p-3 font-mono">1</td>
                        <td className="p-3">Bhushan Shelke</td>
                        <td className="p-3 font-mono text-[#00F2FE]">BHUSHAN</td>
                        <td className="p-3"><span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[10px]">ADMIN</span></td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="p-3 font-mono">2</td>
                        <td className="p-3">Demo Researcher</td>
                        <td className="p-3 font-mono">researcher1</td>
                        <td className="p-3"><span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px]">USER</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* UPGRADE PRO MODAL WITH PROMO CODE 'BHUSHAN' */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141D] border border-white/10 p-6 md:p-8 max-w-md w-full space-y-6 rounded-3xl shadow-2xl relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-sm"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE] mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Upgrade to PatentMind Pro</h3>
              <p className="text-xs text-slate-400">
                Unlock unlimited AI patent vector search, multi-PDF comparison, and priority RAG reasoning.
              </p>
            </div>

            {/* Promo Code Section */}
            <div className="space-y-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Have a Promo Code?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  placeholder="Enter code (e.g. bhushan)"
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F2FE]/50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (promoCodeInput.trim().toLowerCase() === 'bhushan') {
                      setIsProUnlocked(true);
                      setUserRole('admin');
                      setPromoSuccessMsg('🎉 PROMO CODE "BHUSHAN" APPLIED! LIFETIME PRO & ADMIN UNLOCKED!');
                    } else {
                      setPromoSuccessMsg('❌ Invalid promo code. Try "bhushan".');
                    }
                  }}
                  className="px-4 py-2 bg-[#00F2FE] text-[#050609] font-bold rounded-xl text-xs hover:bg-[#38BDF8] transition-all"
                >
                  Apply
                </button>
              </div>
              {promoSuccessMsg && (
                <p className={`text-[11px] font-mono text-center pt-1 ${promoSuccessMsg.includes('APPLIED') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {promoSuccessMsg}
                </p>
              )}
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00F2FE]" />
                <span>Unlimited Semantic Patent Searches</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00F2FE]" />
                <span>Multi-PDF Document Claim Comparison</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00F2FE]" />
                <span>Full Knowledge Graph & Citation Explorer</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsProUnlocked(true);
                setShowUpgradeModal(false);
              }}
              className="w-full py-3 bg-[#00F2FE] text-[#050609] font-bold text-xs rounded-xl hover:bg-[#38BDF8] transition-all shadow-lg"
            >
              {isProUnlocked ? 'Close' : 'Activate Pro Membership'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
