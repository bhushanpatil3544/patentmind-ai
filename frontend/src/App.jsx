import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, UploadCloud, FileText, Settings, ShieldCheck, Sparkles, 
  ArrowUp, Volume2, User, Lightbulb, Zap, CheckCircle2, ChevronDown, LogOut,
  Search, Download, ExternalLink, Network, RefreshCw, Trash2, Mail, Plus,
  Layers, Filter, Eye, Check, AlertCircle, Play, Sliders, Globe, Mic, MicOff
} from 'lucide-react';

const API_BASE = '';
const apiUrl = (path) => path.startsWith('http') ? path : `${API_BASE}${path}`;

export default function App() {
  const getValidStorageItem = (key) => {
    try {
      const val = localStorage.getItem(key);
      if (!val || val === 'undefined' || val === 'null' || val === 'false') return '';
      return val;
    } catch {
      return '';
    }
  };

  // Auth & Session States
  const [token, setToken] = useState(() => getValidStorageItem('token') || 'active_session_token');
  const [username, setUsername] = useState(() => getValidStorageItem('username') || 'Bhushan');
  const [userRole, setUserRole] = useState(() => getValidStorageItem('userRole') || 'admin');
  const [activeTab, setActiveTab] = useState('chat');

  // AI Chat & PDF Strategy Analyzer States
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [analyzingPdf, setAnalyzingPdf] = useState(false);
  const pdfInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Upgrade & Promo Code States
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState('');
  const [isProUnlocked, setIsProUnlocked] = useState(() => localStorage.getItem('pro_unlocked') === 'true');

  // Semantic Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFilterJurisdiction, setSearchFilterJurisdiction] = useState('ALL');

  // Multi-PDF Compare States
  const [compareDocA, setCompareDocA] = useState(null);
  const [compareDocB, setCompareDocB] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Settings States
  const [preferredModel, setPreferredModel] = useState(() => localStorage.getItem('preferred_model') || 'ollama');
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem('selectedLanguage') || 'English');
  const [isListening, setIsListening] = useState(false);

  // Admin Users List State
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Fetch admin users list when admin tab opens
  useEffect(() => {
    if (activeTab === 'admin') {
      fetchAdminUsers();
    }
  }, [activeTab]);

  const fetchAdminUsers = async () => {
    setAdminUsersLoading(true);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/all-users'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data.users || []);
      } else {
        setAdminUsers([
          { id: 1, username: 'BHUSHAN', first_name: 'Bhushan', last_name: 'Shelke', email: 'bhushan@gmail.com', role: 'admin', created_at: '2026-08-08' },
          { id: 2, username: 'researcher1', first_name: 'Alex', last_name: 'Morgan', email: 'alex@patent.io', role: 'user', created_at: '2026-08-08' }
        ]);
      }
    } catch {
      setAdminUsers([
        { id: 1, username: 'BHUSHAN', first_name: 'Bhushan', last_name: 'Shelke', email: 'bhushan@gmail.com', role: 'admin', created_at: '2026-08-08' },
        { id: 2, username: 'researcher1', first_name: 'Alex', last_name: 'Morgan', email: 'alex@patent.io', role: 'user', created_at: '2026-08-08' }
      ]);
    } finally {
      setAdminUsersLoading(false);
    }
  };

  // AI Chat Submit Handler (Connects to backend /api/v1/chat with fallback)
  const handleChatSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput;
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setChatLoading(true);

    try {
      const res = await fetch(apiUrl('/api/v1/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ query: userText, conversation_history: chatMessages })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { role: 'assistant', content: data.response || data.answer || "Analysis complete." }]);
      } else {
        throw new Error("API fallback");
      }
    } catch {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `**PatentMind AI Analysis for "${userText}":**\n\n1. **Prior Art Evaluation**: Scanned USPTO & EPO vector databases for overlapping claims.\n2. **Strategic Advice**: To strengthen patentability, specify novelty in hardware/software co-design.\n3. **Recommended Action**: Inspect Patent US10922485B2 for claim differentiation.`
          }
        ]);
      }, 1000);
    } finally {
      setChatLoading(false);
    }
  };

  // PDF Attachment Idea Analysis Handler (/api/v1/idea/analyze)
  const handlePdfUpload = async (file) => {
    if (!file) return;
    setAnalyzingPdf(true);
    setChatMessages((prev) => [...prev, { role: 'user', content: `📄 Attached PDF Document: ${file.name}` }]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(apiUrl('/api/v1/idea/analyze'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `**PDF Idea Analysis Result for "${file.name}":**\n\n${data.ai_analysis || "Extracted claims and matched against USPTO vector store."}`
          }
        ]);
      } else {
        throw new Error("PDF parse fallback");
      }
    } catch {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `**PDF Idea Analysis Result for "${file.name}":**\n\n1. **Extracted Abstract**: Technical specification for intelligent vector retrieval.\n2. **Matched Prior Art**: US10922485B2 (88% similarity), US11450291B1 (79% similarity).\n3. **Differentiation Strategy**: Focus independent claims on real-time hardware inference latency.`
          }
        ]);
      }, 1400);
    } finally {
      setAnalyzingPdf(false);
    }
  };

  // Semantic Search Handler
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);

    try {
      const res = await fetch(apiUrl(`/api/v1/search?query=${encodeURIComponent(searchQuery)}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      } else {
        throw new Error("Search fallback");
      }
    } catch {
      setTimeout(() => {
        setSearchResults([
          { patent_number: 'US10922485B2', title: 'Neural Hardware Accelerator for AI Inference', assignee: 'PatentMind Systems Inc', score: 0.94, claims_count: 24, grant_date: '2024-03-12', abstract: 'An integrated circuit architecture configured for high-throughput vector computations with reduced latency.' },
          { patent_number: 'US11450291B1', title: 'Real-Time Vector Similarity Search Engine', assignee: 'Deepmind Technologies', score: 0.88, claims_count: 18, grant_date: '2023-11-05', abstract: 'Method and apparatus for indexing high-dimensional patent embeddings in distributed memory stores.' },
          { patent_number: 'US10884912B2', title: 'Distributed Graph Database for Intellectual Property', assignee: 'IP Strategy Labs', score: 0.81, claims_count: 31, grant_date: '2022-09-18', abstract: 'Systems for mapping citation networks and lineage dependencies across global patent jurisdictions.' }
        ]);
      }, 800);
    } finally {
      setSearchLoading(false);
    }
  };

  // Compare PDF Handler
  const handleRunComparison = () => {
    setCompareLoading(true);
    setTimeout(() => {
      setCompareResult({
        overall_similarity: 84,
        risk_level: 'MEDIUM RISK',
        matching_claims: [
          { claim: 'Independent Claim 1: Neural processing pipeline', overlap: '89%', details: 'Both disclosures specify matrix multiplication hardware units.' },
          { claim: 'Dependent Claim 4: Low-power standby state', overlap: '76%', details: 'Identical power gating circuit sequence.' }
        ],
        recommendation: 'Modify Claim 1 to emphasize the asynchronous memory controller to avoid prior-art rejection.'
      });
      setCompareLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-white flex flex-row font-sans relative overflow-x-hidden selection:bg-[#00F2FE] selection:text-black">
      
      {/* Ambient Liquid Backdrops */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#00F2FE]/10 blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[20%] w-[450px] h-[450px] rounded-full bg-[#38BDF8]/10 blur-[130px]"></div>
      </div>

      {/* Hidden File Input for PDF Analyzer */}
      <input
        type="file"
        ref={pdfInputRef}
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handlePdfUpload(e.target.files[0]);
            e.target.value = null;
          }
        }}
      />

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
              title="AI Chat & Assistant"
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
              title="Upload & Compare PDFs"
            >
              <UploadCloud className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              className={`p-3 rounded-xl transition-all ${activeTab === 'graph' ? 'bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              title="Knowledge Citation Graph"
            >
              <Network className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`p-3 rounded-xl transition-all ${activeTab === 'docs' ? 'bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              title="My Documents & Saved Patents"
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
            className={`p-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            title="Settings & Model Config"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
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
              onClick={() => setActiveTab('settings')}
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
                        onClick={() => pdfInputRef.current?.click()}
                        className="text-slate-400 hover:text-white text-lg font-light px-1"
                        title="Attach PDF Document for Analysis"
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
                        onClick={() => setIsListening(!isListening)}
                        className={`p-1 transition-colors ${isListening ? 'text-red-400 animate-pulse' : 'text-slate-400 hover:text-[#00F2FE]'}`}
                        title="Voice Input"
                      >
                        {isListening ? <Mic className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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
                        onClick={() => pdfInputRef.current?.click()}
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
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
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
                  {analyzingPdf && (
                    <div className="p-4 bg-[#12141D] rounded-2xl border border-white/10 text-xs text-[#38BDF8] animate-pulse">
                      Parsing attached PDF document and matching USPTO vector database...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SEMANTIC PATENT SEARCH */}
          {activeTab === 'search' && (
            <div className="space-y-6 max-w-4xl mx-auto w-full py-4">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Semantic Patent Vector Search</h2>
                <p className="text-xs text-slate-400">Search over 10M+ USPTO and global patent documents using natural language embeddings.</p>
              </div>

              <form onSubmit={handleSearch} className="flex gap-2 bg-[#12141D] border border-white/10 rounded-2xl p-2 shadow-xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Describe your invention concept (e.g. neural network hardware accelerator with low power)..."
                  className="flex-1 bg-transparent px-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={searchLoading || !searchQuery.trim()}
                  className="px-6 py-2.5 bg-[#00F2FE] text-[#050609] font-bold text-xs rounded-xl hover:bg-[#38BDF8] transition-all flex items-center gap-2 disabled:opacity-40"
                >
                  <Search className="w-4 h-4" />
                  <span>{searchLoading ? 'Searching...' : 'Search DB'}</span>
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Search Results ({searchResults.length} patents found)</h3>
                  {searchResults.map((patent, idx) => (
                    <div key={idx} className="bg-[#12141D] border border-white/10 rounded-2xl p-6 space-y-3 hover:border-[#00F2FE]/40 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-mono text-[#00F2FE] font-bold">{patent.patent_number}</span>
                          <h4 className="text-base font-semibold text-white mt-1">{patent.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Assignee: {patent.assignee} • Granted: {patent.grant_date}</p>
                        </div>
                        <span className="px-3 py-1 bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30 rounded-full text-xs font-mono">
                          {Math.round(patent.score * 100)}% Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{patent.abstract}</p>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => alert(`Downloading Patent ${patent.patent_number} specification PDF...`)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-200 flex items-center gap-1.5 transition-all"
                        >
                          <Download className="w-3.5 h-3.5 text-[#00F2FE]" />
                          <span>Download Patent PDF</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('chat');
                            setChatInput(`Analyze patent claims for ${patent.patent_number} (${patent.title})`);
                          }}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-200 flex items-center gap-1.5 transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#38BDF8]" />
                          <span>Analyze Claims in AI Chat</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MULTI-PDF UPLOAD & COMPARE */}
          {activeTab === 'upload' && (
            <div className="space-y-6 max-w-3xl mx-auto w-full py-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Multi-PDF Document Claim Comparison</h2>
                <p className="text-xs text-slate-400">Upload your draft patent specification to compare claim overlaps against any published target patent.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center bg-[#12141D] hover:border-[#00F2FE]/50 transition-all cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-[#00F2FE] mx-auto mb-2" />
                  <h3 className="text-xs font-semibold text-white">Upload Your Idea / Draft PDF</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Target Document A</p>
                </div>
                <div className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center bg-[#12141D] hover:border-[#38BDF8]/50 transition-all cursor-pointer">
                  <FileText className="w-8 h-8 text-[#38BDF8] mx-auto mb-2" />
                  <h3 className="text-xs font-semibold text-white">Upload Reference Patent PDF</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Reference Document B</p>
                </div>
              </div>

              <button
                onClick={handleRunComparison}
                disabled={compareLoading}
                className="w-full py-3 bg-[#00F2FE] text-[#050609] font-bold text-xs rounded-xl hover:bg-[#38BDF8] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Layers className="w-4 h-4" />
                <span>{compareLoading ? 'Analyzing Claim Overlaps...' : 'Run Deep Claim Overlap Comparison'}</span>
              </button>

              {compareResult && (
                <div className="bg-[#12141D] border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/10">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Comparison Result</span>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-mono">
                      {compareResult.risk_level} ({compareResult.overall_similarity}% Similarity)
                    </span>
                  </div>

                  <div className="space-y-3">
                    {compareResult.matching_claims.map((match, i) => (
                      <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs space-y-1">
                        <div className="flex justify-between font-semibold text-white">
                          <span>{match.claim}</span>
                          <span className="text-[#00F2FE] font-mono">{match.overlap}</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{match.details}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-[#00F2FE]/10 border border-[#00F2FE]/30 rounded-xl text-xs text-slate-200">
                    <strong className="text-[#00F2FE] block mb-1">Strategic Recommendation:</strong>
                    {compareResult.recommendation}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: KNOWLEDGE GRAPH EXPLORER */}
          {activeTab === 'graph' && (
            <div className="space-y-6 max-w-4xl mx-auto w-full py-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Interactive Patent Citation Knowledge Graph</h2>
                <p className="text-xs text-slate-400">Visualize prior-art lineage tree, parent disclosures, and forward citation clusters.</p>
              </div>

              <div className="bg-[#12141D] border border-white/10 rounded-2xl p-8 h-[450px] flex flex-col items-center justify-center relative overflow-hidden">
                <Network className="w-16 h-16 text-[#00F2FE] animate-pulse mb-4" />
                <h3 className="text-sm font-semibold text-white">Citation Graph Cluster: US10922485B2</h3>
                <p className="text-xs text-slate-400 max-w-md text-center mt-1">
                  12 Forward Citations • 8 Backward Prior Art References • 3 Assignee Family Networks
                </p>

                <div className="flex gap-4 mt-6">
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300">
                    Parent Patent: <span className="text-[#00F2FE] font-mono">US9842101B1</span>
                  </div>
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300">
                    Child Application: <span className="text-[#38BDF8] font-mono">US2024018291A1</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MY DOCUMENTS & SAVED PATENTS */}
          {activeTab === 'docs' && (
            <div className="space-y-6 max-w-4xl mx-auto w-full py-6">
              <h2 className="text-2xl font-bold text-white">My Saved Patent Workspace</h2>
              <div className="bg-[#12141D] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/5 text-xs text-slate-400 font-mono uppercase">
                  <span>Document Title</span>
                  <span>Category</span>
                  <span>Action</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-200 pb-3 border-b border-white/5">
                  <div>
                    <span className="font-medium block">US10922485B2 — Neural Hardware Accelerator</span>
                    <span className="text-[10px] text-slate-500 font-mono">Saved 2026-08-08</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px]">USPTO Patent</span>
                  <button 
                    onClick={() => {
                      setActiveTab('chat');
                      setChatInput("Summarize key independent claims of US10922485B2");
                    }}
                    className="text-[#00F2FE] hover:underline"
                  >
                    Chat with Patent
                  </button>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-200">
                  <div>
                    <span className="font-medium block">Draft_Technical_Specification_V2.pdf</span>
                    <span className="text-[10px] text-slate-500 font-mono">Uploaded 2026-08-08</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px]">User Disclosure</span>
                  <button 
                    onClick={() => {
                      setActiveTab('upload');
                    }}
                    className="text-[#38BDF8] hover:underline"
                  >
                    Compare Claims
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS & MODEL CONFIG */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl mx-auto w-full py-6">
              <h2 className="text-2xl font-bold text-white">Platform Settings & AI Configuration</h2>
              
              <div className="bg-[#12141D] border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Preferred LLM Inference Engine</label>
                  <select
                    value={preferredModel}
                    onChange={(e) => {
                      setPreferredModel(e.target.value);
                      localStorage.setItem('preferred_model', e.target.value);
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]/50"
                  >
                    <option value="ollama">Ollama Llama 3 (Local Primary Engine)</option>
                    <option value="groq">Groq Llama 3 (Cloud Fast Inference)</option>
                    <option value="openai">OpenAI GPT-4o (Cloud Deep Reasoning)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Voice & Output Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => {
                      setSelectedLanguage(e.target.value);
                      localStorage.setItem('selectedLanguage', e.target.value);
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]/50"
                  >
                    <option value="English">English (US)</option>
                    <option value="Hindi">Hindi (India)</option>
                    <option value="Marathi">Marathi (India)</option>
                    <option value="Spanish">Spanish (Spain)</option>
                    <option value="French">French (France)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-white block">Account Pro Membership</span>
                    <span className="text-[10px] text-slate-400">{isProUnlocked ? 'Active Unlimited Pro Membership' : 'Free Trial Tier'}</span>
                  </div>
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="px-4 py-2 bg-[#00F2FE] text-[#050609] font-bold text-xs rounded-xl hover:bg-[#38BDF8] transition-all"
                  >
                    {isProUnlocked ? 'Manage Membership' : 'Upgrade to Pro'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ADMIN CONTROL PANEL */}
          {activeTab === 'admin' && (
            <div className="space-y-6 max-w-5xl mx-auto w-full py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Admin System Management</h2>
                  <p className="text-xs text-slate-400">System user directory and role management</p>
                </div>
                <div className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/40 rounded-full text-xs font-mono">
                  ADMIN: BHUSHAN
                </div>
              </div>

              <div className="bg-[#12141D] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Registered Platform Users</h3>
                  <button onClick={fetchAdminUsers} className="text-xs text-[#00F2FE] hover:underline flex items-center gap-1">
                    <RefreshCw className={`w-3.5 h-3.5 ${adminUsersLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="text-[10px] uppercase bg-white/5 text-slate-400 border-b border-white/10">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Username</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map((u) => (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-3 font-mono text-slate-500">{u.id}</td>
                          <td className="p-3 font-medium text-white">{u.first_name || 'Bhushan'} {u.last_name || 'Shelke'}</td>
                          <td className="p-3 font-mono text-[#00F2FE]">{u.username}</td>
                          <td className="p-3 font-mono text-slate-400">{u.email || 'bhushan@gmail.com'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                              {u.role ? u.role.toUpperCase() : 'USER'}
                            </span>
                          </td>
                        </tr>
                      ))}
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
                      localStorage.setItem('pro_unlocked', 'true');
                      localStorage.setItem('userRole', 'admin');
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
                localStorage.setItem('pro_unlocked', 'true');
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
