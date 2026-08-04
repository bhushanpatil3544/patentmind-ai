import KnowledgeGraphView from './components/KnowledgeGraphView';
import PatentDetailsView from './components/PatentDetailsView';
import PatentComparisonView from './components/PatentComparisonView';
import SavedPatentsView from './components/SavedPatentsView';
import ProjectsView from './components/ProjectsView';
import TeamWorkspaceView from './components/TeamWorkspaceView';
import NotificationsView from './components/NotificationsView';
import UserProfileView from './components/UserProfileView';
import ApiKeysView from './components/ApiKeysView';
import BillingView from './components/BillingView';
import HelpCenterView from './components/HelpCenterView';
import ContactView from './components/ContactView';
import PrivacyPolicyView from './components/PrivacyPolicyView';
import TermsOfServiceView from './components/TermsOfServiceView';
import NotFoundView from './components/NotFoundView';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Database, 
  Cpu, 
  Layers, 
  UploadCloud, 
  BarChart3, 
  Network, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  UserCheck,
  Tag,
  LogOut,
  User,
  KeyRound,
  FileCode,
  Palette,
  Phone,
  Smartphone,
  ShieldAlert,
  Send,
  MessageSquare,
  Trash2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Lightbulb,
  FileText,
  Zap,
  ArrowLeft,
  Mail,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Globe,
  HelpCircle,
  Settings,
  Sliders,
  Activity,
  Paperclip,
  ArrowUp,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Loader2,
  Download,
  Instagram,
  Linkedin,
  Twitter,
  Heart
} from 'lucide-react';

// Definitions for Theme switcher: Normal (Paperpillar Light) & Dark (Paperpillar Dark)
const themesList = [
  { id: 'theme-normal', name: 'NORMAL THEME', dotClass: 'bg-[#4D5D44] border-stone-300' },
  { id: 'theme-dark', name: 'DARK THEME', dotClass: 'bg-[#1A2018] border-[#4D5D44]' }
];

// API base URL: always empty — on Vercel the Python serverless function runs on same domain,
// on localhost the Vite proxy forwards to the local backend (v1.0.5 cache-bust)
const API_BASE = '';

const apiUrl = (path) => path.startsWith('http') ? path : `${API_BASE}${path}`;

function App() {
  const getValidStorageItem = (key) => {
    try {
      const val = localStorage.getItem(key);
      if (!val || val === 'undefined' || val === 'null' || val === 'false') return '';
      return val;
    } catch {
      return '';
    }
  };

  // Session & Auth state
  const [token, setToken] = useState(() => getValidStorageItem('token'));
  const [username, setUsername] = useState(() => getValidStorageItem('username'));
  const [authMode, setAuthMode] = useState('login'); // login / register
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authRole, setAuthRole] = useState(() => getValidStorageItem('authRole') || 'client'); // client / admin

  const isAdminUser = () => {
    const u = (username || '').toLowerCase().trim();
    return true; // Admin Control tab enabled for system administration
  };

  // Gmail OTP Registration states
  const [gmailOtpSent, setGmailOtpSent] = useState(false);
  const [gmailOtpCode, setGmailOtpCode] = useState('');
  const [gmailOtpDebug, setGmailOtpDebug] = useState('');

  // Forgot Password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);

  // Forgot Username states
  const [forgotUserEmail, setForgotUserEmail] = useState('');
  const [forgotUserOtpCode, setForgotUserOtpCode] = useState('');
  const [forgotUserOtpSent, setForgotUserOtpSent] = useState(false);
  const [recoveredUsernameResult, setRecoveredUsernameResult] = useState('');

  // Change Password Modal state (for logged in user)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({ old_password: '', new_password: '' });
  const [changePasswordMsg, setChangePasswordMsg] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingSlide, setOnboardingSlide] = useState(0);
  const [showWelcome, setShowWelcome] = useState(() => !getValidStorageItem('token'));
  const [welcomeLayout, setWelcomeLayout] = useState('claymation'); // claymation / brutalist / cyber / aurora

  // Voice Assistance & Multi-Language & Platform Settings states
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem('selectedLanguage') || 'English');
  const [preferredModel, setPreferredModel] = useState(() => localStorage.getItem('preferred_model') || 'ollama');
  const [latencyMode, setLatencyMode] = useState(() => localStorage.getItem('latency_mode') || 'fast');
  const [maxContextChunks, setMaxContextChunks] = useState(() => Number(localStorage.getItem('max_context_chunks')) || 3);
  const [autoReadResponses, setAutoReadResponses] = useState(() => localStorage.getItem('auto_read') === 'true');
  const [autoTranslate, setAutoTranslate] = useState(() => localStorage.getItem('auto_translate') !== 'false');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  const [isListening, setIsListening] = useState(false);
  const [activeListeningField, setActiveListeningField] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState('');

  const languageCodes = {
    'English': 'en-US',
    'Hindi': 'hi-IN',
    'Marathi': 'mr-IN',
    'Spanish': 'es-ES',
    'French': 'fr-FR',
    'German': 'de-DE',
    'Japanese': 'ja-JP',
    'Chinese': 'zh-CN'
  };

  useEffect(() => {
    localStorage.setItem('selectedLanguage', selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    localStorage.setItem('preferred_model', preferredModel);
  }, [preferredModel]);

  useEffect(() => {
    localStorage.setItem('latency_mode', latencyMode);
  }, [latencyMode]);

  useEffect(() => {
    localStorage.setItem('max_context_chunks', maxContextChunks);
  }, [maxContextChunks]);

  useEffect(() => {
    localStorage.setItem('auto_read', autoReadResponses);
  }, [autoReadResponses]);

  useEffect(() => {
    localStorage.setItem('auto_translate', autoTranslate);
  }, [autoTranslate]);

  // Speech Recognition (Speech to Text)
  const handleVoiceInput = (fieldSetter, fieldName) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    
    if (isListening && activeListeningField === fieldName) {
      setIsListening(false);
      setActiveListeningField(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langCode = languageCodes[selectedLanguage] || 'en-US';
      recognition.lang = langCode;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setActiveListeningField(fieldName);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        fieldSetter(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
        setActiveListeningField(null);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setActiveListeningField(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        setActiveListeningField(null);
      };

      recognition.start();
    } catch (err) {
      console.error("Voice input error:", err);
      setIsListening(false);
      setActiveListeningField(null);
    }
  };

  // Speech Synthesis (Text to Speech Narration)
  const handleSpeakText = (text) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech narration is not supported in your browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingText('');
      return;
    }

    if (!text) return;

    try {
      const cleanText = text.replace(/[*#_`~]/g, ''); // strip markdown formatting
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const langCode = languageCodes[selectedLanguage] || 'en-US';
      utterance.lang = langCode;
      utterance.rate = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingText(cleanText);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingText('');
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingText('');
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Voice narration error:", err);
      setIsSpeaking(false);
      setSpeakingText('');
    }
  };

  // OTP Login states
  const [loginMethod, setLoginMethod] = useState('password'); // password / otp
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLocalDebug, setOtpLocalDebug] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  // Animation Toggle settings
  const [enableBubbles, setEnableBubbles] = useState(() => localStorage.getItem('enable_bubbles') !== 'false');
  const [enableSparks, setEnableSparks] = useState(() => localStorage.getItem('enable_sparks') !== 'false');

  // Theme selection state (Default: theme-normal)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'theme-normal');

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('search');
  const [selectedPatentNumber, setSelectedPatentNumber] = useState('US10922485B2');
  const [comparePatentB, setComparePatentB] = useState('US11450291B1');

  
  // Search state
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Ingest state
  const [ingestQuery, setIngestQuery] = useState('');
  const [ingestLimit, setIngestLimit] = useState(3);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);

  // PDF Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    patent_number: '',
    title: '',
    abstract: '',
    document_date: '',
    source: 'USPTO',
    ipc_cpc_codes: '',
    inventors: ''
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Dataset batch state
  const [datasetFile, setDatasetFile] = useState(null);
  const [datasetLoading, setDatasetLoading] = useState(false);
  const [datasetResult, setDatasetResult] = useState(null);
  const [datasetError, setDatasetError] = useState(null);

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Administrative Control states
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersDetailed, setAdminUsersDetailed] = useState([]);
  const [adminFeedback, setAdminFeedback] = useState([]);
  const [adminDiagnostics, setAdminDiagnostics] = useState(null);
  const [resetForm, setResetForm] = useState({ target_username: '', new_password: '' });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [resetError, setResetError] = useState(null);

  const [bulkResetForm, setBulkResetForm] = useState({ new_password: '', send_email: false });
  const [bulkResetLoading, setBulkResetLoading] = useState(false);
  const [customEmailForm, setCustomEmailForm] = useState({ target_username: '', subject: '', body: '' });
  const [customEmailLoading, setCustomEmailLoading] = useState(false);

  // Chatbot states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSourceFilter, setChatSourceFilter] = useState('');
  const [chatSectionFilter, setChatSectionFilter] = useState('');
  const [expandedCitationIndex, setExpandedCitationIndex] = useState(null);
  
  // ChatGPT-style PDF & Toggle states
  const [attachedPdfFile, setAttachedPdfFile] = useState(null);
  const [attachedPdfName, setAttachedPdfName] = useState('');
  const [chatModeDeepSearch, setChatModeDeepSearch] = useState(true);
  const [chatModeReasoning, setChatModeReasoning] = useState(false);
  const [pdfAnalyzingLoading, setPdfAnalyzingLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarNavMode, setIsSidebarNavMode] = useState(() => localStorage.getItem('sidebar_nav_mode') !== 'false');

  // Google Patents Fetch states
  const [googleFetchQuery, setGoogleFetchQuery] = useState('');
  const [googleFetchLimit, setGoogleFetchLimit] = useState(5);
  const [googleFetchLoading, setGoogleFetchLoading] = useState(false);
  const [googleFetchResult, setGoogleFetchResult] = useState(null);
  const [googleFetchError, setGoogleFetchError] = useState(null);
  const [datasetActiveTab, setDatasetActiveTab] = useState('google'); // 'google' | 'file'
  
  const chatEndRef = useRef(null);
  const pdfInputRef = useRef(null);

  // Idea Analyzer states
  const [ideaFile, setIdeaFile] = useState(null);
  const [ideaText, setIdeaText] = useState('');
  const [ideaAnalysis, setIdeaAnalysis] = useState(null);
  const [ideaMatchedPatents, setIdeaMatchedPatents] = useState([]);
  const [ideaLoading, setIdeaLoading] = useState(false);
  const [ideaError, setIdeaError] = useState(null);
  const [ideaStep, setIdeaStep] = useState('upload'); // upload / results / chat
  const [ideaChatMessages, setIdeaChatMessages] = useState([]);
  const [ideaChatInput, setIdeaChatInput] = useState('');
  const [ideaChatLoading, setIdeaChatLoading] = useState(false);
  const [ideaPatentsContext, setIdeaPatentsContext] = useState('');
  const ideaChatEndRef = useRef(null);

  // Feedback & Help states
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [feedbackError, setFeedbackError] = useState(null);

  // Persistence of theme
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // OTP resend countdown timer
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Persistence of animation settings
  useEffect(() => {
    localStorage.setItem('enable_bubbles', enableBubbles ? 'true' : 'false');
  }, [enableBubbles]);

  useEffect(() => {
    localStorage.setItem('enable_sparks', enableSparks ? 'true' : 'false');
  }, [enableSparks]);

  // Interactive mouse bubble generator
  useEffect(() => {
    if (!enableBubbles) return;

    let lastSpawn = 0;
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastSpawn < 5) return; 
      lastSpawn = now;

      for (let i = 0; i < 8; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'mouse-bubble';
        
        const size = Math.random() * 12 + 4;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        const rx = (Math.random() - 0.5) * 24;
        const ry = (Math.random() - 0.5) * 24;
        bubble.style.left = `${e.clientX - size/2 + rx}px`;
        bubble.style.top = `${e.clientY - size/2 + ry}px`;

        // Set border color matching the accent of the active theme
        let bubbleColor = 'rgba(139, 92, 246, 0.55)'; // default purple-aurora
        if (theme === 'theme-brusterna') {
          bubbleColor = 'rgba(166, 124, 82, 0.65)';
        } else if (theme === 'theme-cyber') {
          bubbleColor = 'rgba(16, 185, 129, 0.65)';
        } else if (theme === 'theme-crimson') {
          bubbleColor = 'rgba(239, 68, 68, 0.65)';
        }
        bubble.style.borderColor = bubbleColor;

        const tx = (Math.random() - 0.5) * 80;
        bubble.style.setProperty('--tx', `${tx}px`);

        document.body.appendChild(bubble);
        
        setTimeout(() => {
          bubble.remove();
        }, 1000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableBubbles, theme]);

  // Helper typing spark particle trigger
  const handleTypingKeydown = (e) => {
    if (!enableSparks) return;

    const rect = e.target.getBoundingClientRect();
    const spawnX = rect.left + rect.width / 2 + (Math.random() - 0.5) * 80;
    const spawnY = rect.top + rect.height / 2;

    for (let i = 0; i < 4; i++) {
      const spark = document.createElement('div');
      spark.className = 'typing-spark';
      
      const size = Math.random() * 4 + 2;
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      spark.style.left = `${spawnX}px`;
      spark.style.top = `${spawnY}px`;

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 60 + 20;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed - 15;
      
      spark.style.setProperty('--dx', `${dx}px`);
      spark.style.setProperty('--dy', `${dy}px`);

      let sparkColor = '#F59E0B'; // default amber/gold
      if (theme === 'theme-brusterna') {
        sparkColor = '#A67C52';
      } else if (theme === 'theme-cyber') {
        sparkColor = '#10B981';
      } else if (theme === 'theme-crimson') {
        sparkColor = '#EF4444';
      }
      spark.style.color = sparkColor;
      spark.style.backgroundColor = sparkColor;

      document.body.appendChild(spark);

      setTimeout(() => {
        spark.remove();
      }, 600);
    }
  };

  const mainContentRef = useRef(null);

  // Auto-scroll main viewport to top whenever activeTab changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Scroll to bottom on chat messages update
  useEffect(() => {
    if (chatEndRef.current && chatMessages.length > 0) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [chatMessages, chatLoading]);

  // Helper fetch wrapper to inject Bearer tokens and catch 401s
  const authenticatedFetch = async (url, options = {}) => {
    if (!token) return;
    
    const headers = options.headers ? { ...options.headers } : {};
    headers['Authorization'] = `Bearer ${token}`;
    headers['Bypass-Tunnel-Remainder'] = 'true';
    headers['ngrok-skip-browser-warning'] = 'true';
    const newOptions = { ...options, headers };

    try {
      const response = await fetch(apiUrl(url), newOptions);
      return response;
    } catch (err) {
      console.warn("API request warning:", err);
      return null;
    }
  };

  const fetchAnalytics = async () => {
    if (!token) return;
    setAnalyticsLoading(true);
    try {
      const response = await authenticatedFetch('/api/v1/analytics');
      if (response && response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    if (!isAdminUser()) return;
    try {
      const response = await authenticatedFetch('/api/v1/auth/admin/users');
      if (response && response.ok) {
        const data = await response.json();
        setAdminUsers(Array.isArray(data?.users) ? data.users : []);
        if (Array.isArray(data?.users_detailed)) {
          setAdminUsersDetailed(data.users_detailed);
        }
      }
    } catch (err) {
      console.error("Failed to list user accounts:", err);
    }
  };

  const fetchAdminDiagnostics = async () => {
    if (!isAdminUser()) return;
    try {
      const response = await authenticatedFetch('/api/v1/admin/diagnostics');
      if (response && response.ok) {
        const data = await response.json();
        setAdminDiagnostics(data?.telemetry || null);
      }
    } catch (err) {
      console.error("Failed to list system telemetry stats:", err);
    }
  };

  const fetchAdminFeedback = async () => {
    if (!isAdminUser()) return;
    try {
      const response = await authenticatedFetch('/api/v1/admin/feedback');
      if (response && response.ok) {
        const data = await response.json();
        setAdminFeedback(Array.isArray(data?.feedback) ? data.feedback : []);
      }
    } catch (err) {
      console.error("Failed to fetch user feedback:", err);
    }
  };

  const handleUserDelete = async (targetUsername) => {
    if (targetUsername.toLowerCase() === 'bhushan' || targetUsername.toLowerCase() === 'admin') return;
    if (!window.confirm(`Are you sure you want to permanently delete user account "${targetUsername.toUpperCase()}"?`)) {
      return;
    }
    try {
      const response = await authenticatedFetch(`/api/v1/auth/admin/users/${targetUsername}`, {
        method: 'DELETE'
      });
      if (response && response.ok) {
        fetchAdminUsers();
        fetchAdminDiagnostics();
      } else {
        const data = await response.json();
        alert(`Failed to delete user: ${data.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  const handleBulkResetSubmit = async (e) => {
    e.preventDefault();
    if (!bulkResetForm.new_password) return;
    if (!window.confirm(`Are you sure you want to reset passwords for ALL non-admin users to "${bulkResetForm.new_password}" in one click?`)) {
      return;
    }
    setBulkResetLoading(true);
    try {
      const response = await authenticatedFetch('/api/v1/auth/admin/reset-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkResetForm)
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Bulk Reset Success! ${data.message} ${data.emails_dispatched ? `Sent ${data.emails_dispatched} Gmail notification(s).` : ''}`);
        setBulkResetForm({ new_password: '', send_email: false });
        fetchAdminUsers();
      } else {
        alert(`Bulk reset failed: ${data.detail || 'Error'}`);
      }
    } catch (err) {
      console.error("Bulk reset error:", err);
      alert("Failed to execute bulk password reset.");
    } finally {
      setBulkResetLoading(false);
    }
  };

  const handleCustomEmailSubmit = async (e) => {
    e.preventDefault();
    if (!customEmailForm.target_username || !customEmailForm.subject || !customEmailForm.body) return;
    setCustomEmailLoading(true);
    try {
      const response = await authenticatedFetch('/api/v1/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customEmailForm)
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setCustomEmailForm({ target_username: '', subject: '', body: '' });
      } else {
        alert(`Failed to send email: ${data.detail || 'Error'}`);
      }
    } catch (err) {
      console.error("Custom email dispatch error:", err);
      alert("Failed to send Gmail message.");
    } finally {
      setCustomEmailLoading(false);
    }
  };

  const handleSendCredentialsEmail = async (targetUsername) => {
    const rawPw = prompt(`Enter password to send to user "${targetUsername.toUpperCase()}" via Gmail:`, "password123");
    if (!rawPw) return;
    try {
      const response = await authenticatedFetch('/api/v1/admin/send-credentials-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_username: targetUsername, new_password: rawPw })
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
      } else {
        alert(`Failed to send credentials: ${data.detail || 'Error'}`);
      }
    } catch (err) {
      console.error("Send credentials error:", err);
      alert("Failed to send credentials via Gmail.");
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [activeTab, token]);

  useEffect(() => {
    if (token && isAdminUser() && activeTab === 'admin') {
      fetchAdminUsers();
      fetchAdminDiagnostics();
      fetchAdminFeedback();
    }
  }, [activeTab, token, username, authRole]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('onboarding_done');
    setToken('');
    setUsername('');
    setSearchResults(null);
    setAnalytics(null);
    setIngestResult(null);
    setUploadResult(null);
    setDatasetResult(null);
    setChatMessages([]);
    setAdminUsers([]);
    setActiveTab('search');
    setShowOnboarding(true);
    setOnboardingSlide(0);
    setShowLogoutModal(false);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!authForm.username.trim() || !authForm.password.trim()) return;

    setAuthLoading(true);
    setAuthError('');

    const cleanUsername = authForm.username.trim().toLowerCase();
    const url = authMode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';

    try {
      const response = await fetch(apiUrl(url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          password: authForm.password,
          email: authForm.email ? authForm.email.trim() : undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (authMode === 'login') {
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('username', data.username);
          localStorage.setItem('onboarding_done', 'true');
          setToken(data.access_token);
          setUsername(data.username);
          setShowWelcome(false);
          setShowOnboarding(false);
          setAuthForm({ username: '', password: '', email: '' });
        } else {
          setAuthMode('login');
          setAuthError(data.message || 'Registration complete! Username & password sent to your email.');
          setAuthForm({ username: authForm.username, password: '', email: '' });
        }
      } else {
        setAuthError(data.detail || 'Authentication operation failed.');
      }
    } catch (err) {
      setAuthError(`Connection notice: ${err.message || 'Unable to reach backend server'}. Please refresh or tap login again.`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!otpPhone.trim()) {
      setAuthError('Please enter a valid phone number.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    setOtpLocalDebug('');
    try {
      const response = await fetch(apiUrl('/api/v1/auth/otp/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: otpPhone })
      });
      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setOtpLocalDebug(data.otp);
        setOtpTimer(60);
      } else {
        setAuthError(data.detail || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      setAuthError('Failed to connect to authentication server.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpPhone.trim() || !otpCode.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const response = await fetch(apiUrl('/api/v1/auth/otp/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: otpPhone,
          otp_code: otpCode,
          role: authRole
        })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('username', data.username);
        setToken(data.access_token);
        setUsername(data.username);
        setOtpPhone('');
        setOtpCode('');
        setOtpSent(false);
        setOtpLocalDebug('');
        setOtpTimer(0);
      } else {
        setAuthError(data.detail || 'Verification code invalid or expired.');
      }
    } catch (err) {
      setAuthError('Failed to connect to authentication server.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Gmail OTP Registration handlers
  const handleRequestGmailOTP = async (e) => {
    e.preventDefault();
    if (!authForm.username.trim() || !authForm.email.trim()) {
      setAuthError('Please enter both your Username and Gmail Address.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const response = await fetch(apiUrl('/api/v1/auth/gmail-otp/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email, username: authForm.username })
      });
      const data = await response.json();
      if (response.ok) {
        setGmailOtpSent(true);
        if (data.otp_debug) setGmailOtpDebug(data.otp_debug);
      } else {
        setAuthError(data.detail || 'Failed to dispatch Gmail verification code.');
      }
    } catch (err) {
      setAuthError('Failed to connect to authentication server.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyGmailOTPAndRegister = async (e) => {
    e.preventDefault();
    if (!gmailOtpCode.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const response = await fetch(apiUrl('/api/v1/auth/gmail-otp/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authForm.email,
          username: authForm.username,
          otp_code: gmailOtpCode,
          password: authForm.password || null
        })
      });
      const data = await response.json();
      if (response.ok) {
        setAuthMode('login');
        setLoginMethod('password');
        setAuthError(data.message || `OTP Verified! Account created. Login details sent to ${data.email}.`);
        setAuthForm({ username: data.username, password: '', email: '' });
        setGmailOtpSent(false);
        setGmailOtpCode('');
        setGmailOtpDebug('');
      } else {
        setAuthError(data.detail || 'Gmail verification failed.');
      }
    } catch (err) {
      setAuthError('Connection error during Gmail OTP verification.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Forgot Password handlers
  const handleRequestForgotOTP = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const response = await fetch('/api/v1/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setForgotOtpSent(true);
      } else {
        setAuthError(data.detail || 'Failed to request reset OTP.');
      }
    } catch (err) {
      setAuthError('Failed to connect to server.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotOtpCode.trim() || !forgotNewPassword.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const response = await fetch('/api/v1/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          otp_code: forgotOtpCode,
          new_password: forgotNewPassword
        })
      });
      const data = await response.json();
      if (response.ok) {
        setAuthMode('login');
        setLoginMethod('password');
        setAuthError(data.message || 'Password reset successfully! Please log in with your new password.');
        setForgotEmail('');
        setForgotOtpCode('');
        setForgotNewPassword('');
        setForgotOtpSent(false);
      } else {
        setAuthError(data.detail || 'Password reset failed.');
      }
    } catch (err) {
      setAuthError('Failed to connect to server.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Forgot Username Handlers
  const handleRequestForgotUserOTP = async (e) => {
    e.preventDefault();
    if (!forgotUserEmail.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    setRecoveredUsernameResult('');
    try {
      const response = await fetch('/api/v1/auth/forgot-username/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotUserEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setForgotUserOtpSent(true);
      } else {
        setAuthError(data.detail || 'Failed to send username recovery OTP.');
      }
    } catch (err) {
      setAuthError('Failed to connect to server.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyForgotUserOTP = async (e) => {
    e.preventDefault();
    if (!forgotUserOtpCode.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const response = await fetch('/api/v1/auth/forgot-username/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotUserEmail,
          otp_code: forgotUserOtpCode
        })
      });
      const data = await response.json();
      if (response.ok) {
        setRecoveredUsernameResult(data.username);
        setAuthError(data.message || `Your registered username is '${data.username}'.`);
      } else {
        setAuthError(data.detail || 'Recovery verification failed.');
      }
    } catch (err) {
      setAuthError('Failed to connect to server.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Change Password Handler (Logged in user)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!changePasswordForm.old_password || !changePasswordForm.new_password) return;
    setChangePasswordLoading(true);
    setChangePasswordMsg('');
    try {
      const response = await authenticatedFetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changePasswordForm)
      });
      if (response) {
        const data = await response.json();
        if (response.ok) {
          setChangePasswordMsg('SUCCESS: Password updated successfully!');
          setChangePasswordForm({ old_password: '', new_password: '' });
          setTimeout(() => setShowChangePasswordModal(false), 2000);
        } else {
          setChangePasswordMsg(`ERROR: ${data.detail || 'Failed to update password'}`);
        }
      }
    } catch (err) {
      setChangePasswordMsg(`ERROR: ${err.message || 'Failed to update password'}`);
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      const response = await authenticatedFetch('/api/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          source_filter: sourceFilter || null,
          section_filter: sectionFilter || null,
          limit: 5,
          target_language: selectedLanguage
        })
      });

      if (!response) return;
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || `Error: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setSearchError(err.message || 'Failed to complete semantic query.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const messagesHistory = [...chatMessages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await authenticatedFetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesHistory,
          source_filter: chatSourceFilter || null,
          section_filter: chatSectionFilter || null,
          limit: 5,
          target_language: selectedLanguage
        })
      });

      if (!response) return;

      const data = await response.json();
      if (response.ok) {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: data.answer,
          citations: data.retrieved_chunks || [],
          latency: data.latency_sec,
          active_llm: data.active_llm,
          active_db: data.active_db
        }]);
      } else {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: ` Error: ${data.detail || 'Failed to generate chat response.'}`,
          citations: []
        }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: ` Connection Error: ${err.message || 'Could not communicate with backend.'}`,
        citations: []
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatPdfUpload = async (file) => {
    if (!file) return;
    setAttachedPdfFile(file);
    setAttachedPdfName(file.name);
    setChatLoading(true);

    const userMsg = { role: 'user', content: ` Attached PDF Document: ${file.name} [Extracting Text & Analyzing...]` };
    setChatMessages(prev => [...prev, userMsg]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await authenticatedFetch('/api/v1/idea/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response) return;
      const data = await response.json();
      if (response.ok) {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `📊 **PDF Specification Analysis Complete** for **${file.name}**:\n\n${data.ai_analysis}`,
          citations: data.matched_patents ? data.matched_patents.map(p => ({
            metadata: { patent_number: p.patent_number, title: p.title, section: p.sections ? p.sections.join(', ') : 'Patent Match' },
            score: p.avg_score,
            text: p.excerpt
          })) : [],
          latency: data.latency_sec,
          active_llm: data.active_llm,
          active_db: 'Vector Store'
        }]);
      } else {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: ` PDF Analysis Error: ${data.detail || 'Failed to extract text from PDF.'}`,
          citations: []
        }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: ` Error uploading PDF: ${err.message || 'Connection error'}`,
        citations: []
      }]);
    } finally {
      setChatLoading(false);
      setAttachedPdfFile(null);
      setAttachedPdfName('');
    }
  };

  // Idea Analyzer: upload and analyze
  const handleIdeaAnalyze = async (e) => {
    e.preventDefault();
    if (!ideaFile) return;

    setIdeaLoading(true);
    setIdeaError(null);
    setIdeaAnalysis(null);
    setIdeaMatchedPatents([]);

    const formData = new FormData();
    formData.append('file', ideaFile);

    try {
      const response = await authenticatedFetch('/api/v1/idea/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response) return;

      const data = await response.json();
      if (response.ok) {
        setIdeaText(data.idea_text);
        setIdeaMatchedPatents(data.matched_patents || []);
        setIdeaAnalysis(data);
        // Build context string for chat
        const ctx = (data.matched_patents || []).map(p =>
          `Patent: ${p.patent_number} | Title: ${p.title} | Score: ${p.avg_score} | Excerpt: ${p.excerpt}`
        ).join('\n');
        setIdeaPatentsContext(ctx);
        setIdeaStep('results');
      } else {
        setIdeaError(data.detail || 'Failed to analyze idea.');
      }
    } catch (err) {
      setIdeaError(err.message || 'Connection error during idea analysis.');
    } finally {
      setIdeaLoading(false);
    }
  };

  // Idea Analyzer: chat follow-up
  const handleIdeaChatSend = async (e) => {
    e.preventDefault();
    if (!ideaChatInput.trim() || ideaChatLoading) return;

    const userMessage = { role: 'user', content: ideaChatInput };
    setIdeaChatMessages(prev => [...prev, userMessage]);
    setIdeaChatInput('');
    setIdeaChatLoading(true);

    try {
      const messagesHistory = [...ideaChatMessages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await authenticatedFetch('/api/v1/idea/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea_text: ideaText,
          matched_patents_context: ideaPatentsContext,
          messages: messagesHistory,
          target_language: selectedLanguage
        })
      });

      if (!response) return;

      const data = await response.json();
      if (response.ok) {
        setIdeaChatMessages(prev => [...prev, {
          role: 'assistant',
          content: data.answer,
          latency: data.latency_sec,
          active_llm: data.active_llm
        }]);
      } else {
        setIdeaChatMessages(prev => [...prev, {
          role: 'assistant',
          content: ` Error: ${data.detail || 'Failed to generate response.'}`
        }]);
      }
    } catch (err) {
      setIdeaChatMessages(prev => [...prev, {
        role: 'assistant',
        content: ` Connection Error: ${err.message || 'Could not communicate with backend.'}`
      }]);
    } finally {
      setIdeaChatLoading(false);
    }
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackComments.trim()) return;

    setFeedbackLoading(true);
    setFeedbackResult(null);
    setFeedbackError(null);

    try {
      const response = await authenticatedFetch('/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: feedbackRating,
          comments: feedbackComments
        })
      });

      if (!response) return;

      const data = await response.json();
      if (response.ok) {
        setFeedbackResult(data.message || 'Thank you! Your feedback has been submitted successfully.');
        setFeedbackComments('');
      } else {
        setFeedbackError(data.detail || 'Failed to submit feedback.');
      }
    } catch (err) {
      setFeedbackError(err.message || 'Network error.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleGooglePatentsFetch = async (e, customQuery = null) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery || googleFetchQuery;
    if (!queryToUse.trim()) return;

    setGoogleFetchLoading(true);
    setGoogleFetchError(null);
    setGoogleFetchResult(null);

    try {
      const response = await authenticatedFetch('/api/v1/dataset/fetch-google-patents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToUse,
          limit: Number(googleFetchLimit)
        })
      });

      if (!response) return;
      const data = await response.json();
      if (response.ok) {
        setGoogleFetchResult(data);
        fetchAnalytics();
      } else {
        setGoogleFetchError(data.detail || 'Failed to fetch patents from Google Patents.');
      }
    } catch (err) {
      setGoogleFetchError(err.message || 'Error connecting to Google Patents engine.');
    } finally {
      setGoogleFetchLoading(false);
    }
  };

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!ingestQuery.trim()) return;

    setIngestLoading(true);
    setIngestResult(null);

    try {
      const response = await authenticatedFetch('/api/v1/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: ingestQuery,
          limit: Number(ingestLimit)
        })
      });

      if (!response) return;

      const data = await response.json();
      if (response.ok) {
        setIngestResult({ success: true, data });
        setIngestQuery('');
        fetchAnalytics();
      } else {
        setIngestResult({ success: false, message: data.detail || 'Ingestion failed.' });
      }
    } catch (err) {
      setIngestResult({ success: false, message: err.message || 'Server unreachable.' });
    } finally {
      setIngestLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please select a physical PDF document to upload.");
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('patent_number', uploadForm.patent_number);
    formData.append('title', uploadForm.title);
    formData.append('abstract', uploadForm.abstract);
    formData.append('document_date', uploadForm.document_date);
    formData.append('source', uploadForm.source);
    formData.append('ipc_cpc_codes', uploadForm.ipc_cpc_codes);
    formData.append('inventors', uploadForm.inventors);

    try {
      const response = await authenticatedFetch('/api/v1/upload', {
        method: 'POST',
        body: formData
      });

      if (!response) return;

      const data = await response.json();
      if (response.ok) {
        setUploadResult(data);
        setUploadForm({
          patent_number: '',
          title: '',
          abstract: '',
          document_date: '',
          source: 'USPTO',
          ipc_cpc_codes: '',
          inventors: ''
        });
        setUploadFile(null);
        fetchAnalytics();
      } else {
        setUploadError(data.detail || 'Failed to index custom document.');
      }
    } catch (err) {
      setUploadError(err.message || 'Connection error during upload.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDatasetSubmit = async (e) => {
    e.preventDefault();
    if (!datasetFile) {
      setDatasetError("Please select a valid dataset file (CSV/JSON).");
      return;
    }

    setDatasetLoading(true);
    setDatasetError(null);
    setDatasetResult(null);

    const formData = new FormData();
    formData.append('file', datasetFile);

    try {
      const response = await authenticatedFetch('/api/v1/dataset/ingest', {
        method: 'POST',
        body: formData
      });

      if (!response) return;

      const data = await response.json();
      if (response.ok) {
        setDatasetResult(data);
        setDatasetFile(null);
        fetchAnalytics();
      } else {
        setDatasetError(data.detail || 'Failed to process dataset file.');
      }
    } catch (err) {
      setDatasetError(err.message || 'Connection error during dataset batch upload.');
    } finally {
      setDatasetLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetForm.target_username.trim() || !resetForm.new_password.trim()) return;

    setResetLoading(true);
    setResetError(null);
    setResetResult(null);

    try {
      const response = await authenticatedFetch('/api/v1/auth/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetForm)
      });

      if (!response) return;

      const data = await response.json();
      if (response.ok) {
        setResetResult(data);
        setResetForm({ target_username: '', new_password: '' });
        fetchAdminUsers();
      } else {
        setResetError(data.detail || 'Reset operation failed.');
      }
    } catch (err) {
      setResetError(err.message || 'Connection error during password reset.');
    } finally {
      setResetLoading(false);
    }
  };

  // RENDER ENTERPRISE LANDING PAGE ON FIRST LOAD
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-[#070913] text-white font-sans overflow-x-hidden selection:bg-[#2563EB] selection:text-white">
        {/* Header Dock */}
        <header className="sticky top-0 z-50 bg-[#070913]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold font-heading text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              
            </div>
            <span className="font-heading font-extrabold text-lg tracking-tight text-white">
              PatentMind <span className="text-xs font-mono text-[#38BDF8] ml-1 font-semibold">AI SaaS</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#preview" className="hover:text-white transition-colors">Interactive Previews</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#pricing" className="hover:text-white transition-colors">Enterprise Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowWelcome(false); setActiveTab('search'); }}
              className="btn-theme px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-6 max-w-6xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-[#38BDF8] text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Enterprise IP Intelligence</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-heading font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
            AI-Powered Patent Intelligence
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Transform complex patent research into actionable engineering decisions. Powered by high-speed PaddleOCR text extraction, ChromaDB vector search, and custom Retrieval-Augmented Generation (RAG).
          </p>

          {/* AI Search & Action Bar */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative p-2 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center gap-2 shadow-2xl">
              <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by natural language, patent number, inventor, or technical keywords..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setQuery(e.target.value);
                    setShowWelcome(false);
                    setActiveTab('search');
                  }
                }}
                className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none py-2 font-sans"
              />
              <button
                onClick={() => { setShowWelcome(false); setActiveTab('search'); }}
                className="btn-theme px-6 rounded-xl font-medium text-xs flex-shrink-0 flex items-center gap-2"
              >
                <span>Search Patents</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs font-medium">
              <button
                onClick={() => { setShowWelcome(false); setActiveTab('upload'); }}
                className="btn-secondary-outline px-6 flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4 text-[#38BDF8]" />
                <span>Upload Patent PDF</span>
              </button>
              <button
                onClick={() => { setShowWelcome(false); setActiveTab('chat'); }}
                className="btn-secondary-outline px-6 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />
                <span>Ask AI Assistant</span>
              </button>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto border-t border-white/10 text-center font-mono">
            <div className="p-4 wrangler-card">
              <span className="text-3xl font-extrabold text-white block font-heading">50M+</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Patents Indexed</span>
            </div>
            <div className="p-4 wrangler-card">
              <span className="text-3xl font-extrabold text-[#38BDF8] block font-heading">120+</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Countries Covered</span>
            </div>
            <div className="p-4 wrangler-card">
              <span className="text-3xl font-extrabold text-[#8B5CF6] block font-heading">Millions</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">AI Queries Run</span>
            </div>
            <div className="p-4 wrangler-card">
              <span className="text-3xl font-extrabold text-emerald-400 block font-heading">98%</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Semantic Precision</span>
            </div>
          </div>
        </section>

        {/* Interactive Previews Section */}
        <section id="preview" className="py-16 px-6 max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-heading font-extrabold text-white">Enterprise Workspace Modules</h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Explore four powerful AI modules built for legal attorneys, patent analysts, and R&D engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { id: 'dashboard', title: 'Stripe-Style Dashboard', icon: BarChart3, desc: 'Filing trends, inventor rankings, company insights, and live activity feeds.' },
              { id: 'knowledge-graph', title: 'Interactive Graph', icon: Network, desc: 'SVG network nodes linking patents, assignees, inventors, and CPC classes.' },
              { id: 'chat', title: 'Perplexity AI Assistant', icon: MessageSquare, desc: 'Cited sources 3-column card deck with match scores and line-level excerpts.' },
              { id: 'analytics', title: 'Patent Analytics', icon: Layers, desc: 'Global country heatmaps, technology velocity charts, and competitor rankings.' }
            ].map(mod => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  onClick={() => { setShowWelcome(false); setActiveTab(mod.id); }}
                  className="wrangler-card p-6 space-y-3 cursor-pointer hover:border-blue-500/40 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-[#38BDF8] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white font-heading group-hover:text-[#38BDF8] transition-colors">{mod.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{mod.desc}</p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-blue-400 pt-2">
                    <span>Open Module</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Corporate Footer */}
        <footer className="border-t border-white/10 py-12 px-6 bg-[#050711] text-xs text-slate-400 font-sans">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs font-heading"></div>
              <span className="font-heading font-bold text-white text-sm">PatentMind AI Corporation</span>
            </div>

            <div className="flex items-center gap-6 font-mono">
              <button onClick={() => { setShowWelcome(false); setActiveTab('privacy'); }} className="hover:text-white">Privacy Policy</button>
              <button onClick={() => { setShowWelcome(false); setActiveTab('terms'); }} className="hover:text-white">Terms of Service</button>
              <button onClick={() => { setShowWelcome(false); setActiveTab('contact'); }} className="hover:text-white">Contact Sales</button>
              <button onClick={() => { setShowWelcome(false); setActiveTab('help'); }} className="hover:text-white">Help Center</button>
            </div>

            <span className="font-mono text-[11px] text-slate-500">© 2026 PatentMind AI Inc. All rights reserved.</span>
          </div>
        </footer>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={`app-wrapper kelly-auth-page bg-[#050816] ${theme} flex items-center justify-center p-6 min-h-screen relative overflow-hidden font-sans`}>
        
        {/* Wrangler Enterprise SaaS Atmospheric Ambient Blurs (Zero Gridlines) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <div className="absolute top-[-10%] left-[15%] w-[650px] h-[650px] rounded-full bg-[#5B7CFA]/15 blur-[160px] animate-pulse duration-[9000ms]" />
          <div className="absolute bottom-[-10%] right-[15%] w-[600px] h-[600px] rounded-full bg-[#00C2FF]/15 blur-[150px] animate-pulse duration-[7000ms]" />
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#7B61FF]/12 blur-[140px]" />
        </div>

        {/* Top-Right Theme Selector */}
        <div className="absolute top-6 right-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 border border-white/5 rounded-full z-20">
          <Palette className="w-3.5 h-3.5 text-zinc-500" />
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            className="bg-transparent text-[10px] font-mono border-none focus:outline-none text-main uppercase cursor-pointer"
          >
            {themesList.map((t) => (
              <option key={t.id} value={t.id} className="bg-zinc-950 text-zinc-400">
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`kelly-auth-card w-full max-w-sm bg-[#111111]/85 backdrop-blur-xl p-8 space-y-7 rounded-2xl shadow-2xl border ${
            authRole === 'admin' 
              ? 'border-red-950/60 shadow-[0_0_50px_rgba(239,68,68,0.06)]' 
              : 'border-white/5 shadow-[0_0_50px_rgba(124,58,237,0.05)]'
          } relative z-10`}
        >
          <div className="text-center space-y-2">
            {theme === 'theme-brusterna' ? (
              <>
                <h1 className="font-outfit font-bold text-3xl tracking-widest text-[#3C2218] flex items-center justify-center gap-0.5">
                  BR
                  <span className="relative inline-block">
                    Ü
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-80 animate-pulse">
                      <svg className="w-3.5 h-3.5 text-[#3C2218]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M9 10c1-2-1-4 1-6" />
                        <path d="M14 10c1-2-1-4 1-6" />
                      </svg>
                    </span>
                  </span>
                  STERNA
                </h1>
                <p className="text-[10px] font-mono tracking-widest text-[#6E5B53] font-medium uppercase">
                  Brew Bold. Live Sharp.
                </p>
              </>
            ) : (
              <>
                <h1 className={`font-outfit font-light text-2xl tracking-wider leading-none transition-colors duration-300 ${
                  authRole === 'admin' ? 'text-red-500 font-mono font-semibold' : 'text-main'
                }`}>
                  {authRole === 'admin' ? 'SECURE ADMIN KERNEL' : 'PATENTMIND CLIENT'}
                </h1>
                <p className={`text-[9px] font-mono tracking-widest uppercase transition-colors duration-300 ${
                  authRole === 'admin' ? 'text-red-650' : 'text-muted'
                }`}>
                  {authRole === 'admin' ? 'RESTRICTED OPERATOR INTERFACE' : 'KNOWLEDGE ARCHITECTURE GATEWAY'}
                </p>
              </>
            )}
          </div>

          {theme === 'theme-brusterna' && (
            <div className="w-full h-24 flex items-center justify-center opacity-85 border-t border-b border-[#D5C8C0]/40 py-2">
              <svg className="w-full h-full text-[#3C2218]" viewBox="0 0 200 80" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                {/* Table line */}
                <line x1="10" y1="65" x2="190" y2="65" strokeWidth="2" />
                
                {/* Person 1 (Left - holding cup) */}
                <path d="M30 65 L30 50 C30 45 35 42 40 42 C45 42 45 48 45 50" />
                <circle cx="37" cy="35" r="5" />
                <path d="M35 45 C35 50 25 52 25 55" /> 
                <rect x="22" y="55" width="6" height="7" rx="1" fill="#3C2218" /> 
                
                {/* Person 2 (Middle - using laptop) */}
                <path d="M90 65 L90 48 C90 42 95 40 100 40 C105 40 110 42 110 48 M110 48 L110 65" />
                <circle cx="100" cy="33" r="5.5" />
                <path d="M95 45 L85 52 L95 56" /> 
                <path d="M105 45 L115 52 L105 56" /> 
                <path d="M85 57 L115 57 L110 50 Z" /> 
                
                {/* Person 3 (Right - writing on notepad) */}
                <path d="M150 65 L150 48 C150 43 155 42 160 42 C165 42 170 43 170 48 M170 48 L170 65" />
                <circle cx="160" cy="35" r="5" />
                <path d="M153 45 L143 55 L150 58" /> 
                <rect x="138" y="56" width="10" height="7" rx="0.5" /> 
                
                {/* Small coffee cups on the table */}
                <path d="M60 65 L60 61 L64 61 L64 65 Z" fill="currentColor" />
                <path d="M130 65 L130 61 L134 61 L134 65 Z" fill="currentColor" />
              </svg>
            </div>
          )}

          {/* Client vs Admin Segment Control */}
          <div className={`grid grid-cols-2 gap-1.5 p-1 bg-black/30 border rounded-full text-[9px] font-mono tracking-wider transition-colors ${
            authRole === 'admin' ? 'border-red-950/50' : 'border-theme'
          }`}>
            <button
              type="button"
              onClick={() => {
                setAuthRole('client');
                setTheme('theme-aurora'); // Standard smooth theme
                setAuthForm(prev => ({ ...prev, username: prev.username === 'admin' ? 'client' : prev.username }));
                setAuthError('');
              }}
              className={`py-1.5 rounded-full transition-all duration-150 uppercase ${
                authRole === 'client'
                  ? 'bg-zinc-900 border border-theme text-main font-semibold'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              CLIENT ACCESS
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthRole('admin');
                setTheme('theme-cyber'); // Green/Red command prompt hacker theme
                setAuthForm(prev => ({ ...prev, username: prev.username === 'client' ? 'admin' : prev.username }));
                setAuthError('');
              }}
              className={`py-1.5 rounded-full transition-all duration-150 uppercase ${
                authRole === 'admin'
                  ? 'bg-red-950/40 border border-red-900/60 text-red-400 font-semibold'
                  : 'text-zinc-650 hover:text-zinc-450'
              }`}
            >
              ADMIN PORTAL
            </button>
          </div>

          {/* Dynamic Banner Notification */}
          {authRole === 'admin' ? (
            <div className="p-3 border border-red-950/70 bg-red-950/10 text-[9px] font-mono text-red-400 tracking-wider flex items-start gap-2.5 leading-relaxed uppercase">
              <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Restricted Gateway</strong>
                <p className="mt-1 text-[8px] text-red-600 font-light">Unauthorized access attempts are prohibited and logged under system audit registries.</p>
              </div>
            </div>
          ) : (
            <div className="p-3 border border-theme/60 bg-black/15 text-[9px] font-mono text-zinc-400 tracking-wider flex items-start gap-2.5 leading-relaxed uppercase">
              <Sparkles className="w-4 h-4 text-zinc-450 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Client Workspace</strong>
                <p className="mt-1 text-[8px] text-zinc-550 font-light">Access your dedicated patent search engine, RAG dialogue chatbot, and crawler analytics.</p>
              </div>
            </div>
          )}

          {/* Login Method Tab Controller */}
          {authMode === 'login' && (
            <div className={`grid grid-cols-3 gap-1 p-1 bg-black/20 border rounded-full text-[9px] font-mono tracking-wider transition-colors ${
              authRole === 'admin' ? 'border-red-950/40' : 'border-theme'
            }`}>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password');
                  setAuthError('');
                }}
                className={`py-1 rounded-full transition-all duration-150 uppercase ${
                  loginMethod === 'password'
                    ? 'bg-zinc-800 text-main font-semibold'
                    : 'text-zinc-550 hover:text-zinc-400'
                }`}
              >
                SECURE KEY
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('forgot_password');
                  setAuthError('');
                }}
                className={`py-1 rounded-full transition-all duration-150 uppercase ${
                  loginMethod === 'forgot_password'
                    ? 'bg-zinc-800 text-main font-semibold'
                    : 'text-zinc-550 hover:text-zinc-400'
                }`}
              >
                FORGOT PW
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('forgot_username');
                  setAuthError('');
                  setRecoveredUsernameResult('');
                }}
                className={`py-1 rounded-full transition-all duration-150 uppercase ${
                  loginMethod === 'forgot_username'
                    ? 'bg-zinc-800 text-main font-semibold'
                    : 'text-zinc-550 hover:text-zinc-400'
                }`}
              >
                FORGOT USER
              </button>
            </div>
          )}

          {/* REGISTER MODE (GMAIL OTP VERIFICATION) */}
          {authMode === 'register' ? (
            <div className="space-y-5">
              {!gmailOtpSent ? (
                <div className="space-y-4">
                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1 flex items-center gap-2.5">
                    <User className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={authForm.username}
                      onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                      onKeyDown={handleTypingKeydown}
                      placeholder="DESIRED USERNAME"
                      required
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-655 text-main uppercase"
                    />
                  </div>

                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1 flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <input
                      type="email"
                      value={authForm.email || ''}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      onKeyDown={handleTypingKeydown}
                      placeholder="YOUR GMAIL ADDRESS"
                      required
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-655 text-main uppercase"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleRequestGmailOTP}
                    disabled={authLoading || !authForm.username.trim() || !authForm.email.trim()}
                    className="w-full py-3 rounded-full text-xs font-mono tracking-widest uppercase btn-theme disabled:opacity-40 transition-all duration-200"
                  >
                    {authLoading ? 'SENDING GMAIL OTP...' : 'SEND VERIFICATION OTP TO GMAIL'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyGmailOTPAndRegister} className="space-y-4">
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 rounded text-[9.5px] font-mono text-emerald-400 space-y-1">
                    <strong className="block uppercase tracking-wider">OTP Dispatched to {authForm.email}</strong>
                    <p className="text-[8.5px] text-zinc-400 font-light">Enter the 6-digit verification code below and set your account password.</p>
                  </div>

                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1 flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={gmailOtpCode}
                      onChange={(e) => setGmailOtpCode(e.target.value)}
                      onKeyDown={handleTypingKeydown}
                      placeholder="6-DIGIT GMAIL OTP CODE"
                      required
                      maxLength={6}
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-655 text-main uppercase tracking-widest text-center"
                    />
                  </div>

                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1 flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <input
                      type="password"
                      value={authForm.password || ''}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      onKeyDown={handleTypingKeydown}
                      placeholder="SET YOUR PASSWORD"
                      required
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-655 text-main"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading || !gmailOtpCode.trim() || !authForm.password.trim()}
                    className="w-full py-3 rounded-full text-xs font-mono tracking-widest uppercase btn-theme disabled:opacity-40 transition-all duration-200"
                  >
                    {authLoading ? 'VERIFYING...' : 'VERIFY OTP & CREATE ACCOUNT'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setGmailOtpSent(false)}
                    className="w-full text-[9px] font-mono text-zinc-500 hover:text-zinc-300 uppercase tracking-wider text-center block pt-1"
                  >
                    Change Email or Resend OTP
                  </button>
                </form>
              )}
            </div>
          ) : loginMethod === 'forgot_password' ? (
            <div className="space-y-5">
              {!forgotOtpSent ? (
                <form onSubmit={handleRequestForgotOTP} className="space-y-4">
                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1 flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      onKeyDown={handleTypingKeydown}
                      placeholder="REGISTERED GMAIL ADDRESS"
                      required
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-655 text-main uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading || !forgotEmail.trim()}
                    className="w-full py-3 rounded-full text-xs font-mono tracking-widest uppercase btn-theme disabled:opacity-40 transition-all duration-200"
                  >
                    {authLoading ? 'DISPATCHING...' : 'SEND RESET OTP TO GMAIL'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetForgotPassword} className="space-y-4">
                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1 flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={forgotOtpCode}
                      onChange={(e) => setForgotOtpCode(e.target.value)}
                      onKeyDown={handleTypingKeydown}
                      placeholder="6-DIGIT RESET OTP CODE"
                      required
                      maxLength={6}
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-655 text-main uppercase tracking-widest text-center"
                    />
                  </div>

                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1 flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <input
                      type="password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      onKeyDown={handleTypingKeydown}
                      placeholder="ENTER NEW PASSWORD"
                      required
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-655 text-main"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading || !forgotOtpCode.trim() || !forgotNewPassword.trim()}
                    className="w-full py-3 rounded-full text-xs font-mono tracking-widest uppercase btn-theme disabled:opacity-40 transition-all duration-200"
                  >
                    {authLoading ? 'RESETTING...' : 'RESET PASSWORD NOW'}
                  </button>
                </form>
              )}
            </div>
          ) : loginMethod === 'forgot_username' ? (
            <div className="space-y-5">
              {!forgotUserOtpSent ? (
                <form onSubmit={handleRequestForgotUserOTP} className="space-y-4">
                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1 flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <input
                      type="email"
                      value={forgotUserEmail}
                      onChange={(e) => setForgotUserEmail(e.target.value)}
                      onKeyDown={handleTypingKeydown}
                      placeholder="REGISTERED GMAIL ADDRESS"
                      required
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-655 text-main uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading || !forgotUserEmail.trim()}
                    className="w-full py-3 rounded-full text-xs font-mono tracking-widest uppercase btn-theme disabled:opacity-40 transition-all duration-200"
                  >
                    {authLoading ? 'SENDING OTP...' : 'SEND RECOVERY OTP TO GMAIL'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyForgotUserOTP} className="space-y-4">
                  {recoveredUsernameResult && (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-900/60 rounded text-[10px] font-mono text-emerald-400 text-center space-y-1">
                      <span className="block text-[8.5px] uppercase tracking-wider text-zinc-400">Account Username Recovered</span>
                      <strong className="text-sm tracking-widest block text-white">{recoveredUsernameResult}</strong>
                    </div>
                  )}

                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1 flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={forgotUserOtpCode}
                      onChange={(e) => setForgotUserOtpCode(e.target.value)}
                      onKeyDown={handleTypingKeydown}
                      placeholder="6-DIGIT GMAIL OTP CODE"
                      required
                      maxLength={6}
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-655 text-main uppercase tracking-widest text-center"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading || !forgotUserOtpCode.trim()}
                    className="w-full py-3 rounded-full text-xs font-mono tracking-widest uppercase btn-theme disabled:opacity-40 transition-all duration-200"
                  >
                    {authLoading ? 'VERIFYING...' : 'RECOVER USERNAME NOW'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-5">


              <div className={`border-b focus-within:border-zinc-500 transition-colors py-1 flex items-center gap-2.5 ${
                authRole === 'admin' ? 'border-red-950/80 focus-within:border-red-550' : 'border-theme'
              }`}>
                <User className={`w-4 h-4 flex-shrink-0 ${authRole === 'admin' ? 'text-red-650' : 'text-zinc-500'}`} />
                <input
                  type="text"
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  onKeyDown={handleTypingKeydown}
                  placeholder="USERNAME"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className={`w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-655 ${
                    authRole === 'admin' ? 'text-red-400' : 'text-main'
                  }`}
                />
              </div>

              <div className={`border-b focus-within:border-zinc-500 transition-colors py-1 flex items-center gap-2.5 ${
                authRole === 'admin' ? 'border-red-950/80 focus-within:border-red-555' : 'border-theme'
              }`}>
                <KeyRound className={`w-4 h-4 flex-shrink-0 ${authRole === 'admin' ? 'text-red-655' : 'text-zinc-500'}`} />
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  onKeyDown={handleTypingKeydown}
                  placeholder="PASSWORD"
                  required
                  className={`w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-655 ${
                    authRole === 'admin' ? 'text-red-400' : 'text-main'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className={`w-full py-3 rounded-full text-xs font-mono tracking-widest uppercase disabled:opacity-40 transition-all duration-200 ${
                  authRole === 'admin'
                    ? 'bg-red-950/20 border border-red-900 text-red-400 hover:bg-red-900/30 hover:text-red-300'
                    : 'btn-theme'
                }`}
              >
                {authLoading ? 'AUTHORIZING...' : 'ESTABLISH SESSION'}
              </button>
            </form>
          )}

          <div className="text-center pt-2 space-y-3">
            {/* Quick Demo Admin Auto-Login Button */}
            <button
              type="button"
              onClick={() => {
                setAuthForm({ username: 'BHUSHAN', password: '3544', email: 'bhushan3544@gmail.com' });
                setTimeout(() => {
                  const fakeEvent = { preventDefault: () => {} };
                  handleAuthSubmit(fakeEvent);
                }, 50);
              }}
              className="kelly-auth-demo w-full py-2.5 bg-gradient-to-r from-[#0D9488]/30 to-[#22D3EE]/20 hover:from-[#0D9488]/50 hover:to-[#22D3EE]/40 border border-[#22D3EE]/40 rounded-full text-[11px] font-semibold font-sans text-[#22D3EE] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>QUICK ENTER AS BHUSHAN (ADMIN )</span>
            </button>

            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthError('');
              }}
              className={`text-[10px] font-mono uppercase tracking-wider transition-colors ${
                authRole === 'admin' ? 'text-red-650 hover:text-red-400' : 'text-zinc-450 hover:text-white'
              }`}
            >
              {authMode === 'login' ? 'Need an account? Register' : 'Already registered? Login'}
            </button>
          </div>

          {/* Interactive Animations Settings Toggles */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-theme/20 text-[9px] font-mono text-zinc-500">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-300 transition-colors">
              <input
                type="checkbox"
                checked={enableBubbles}
                onChange={(e) => setEnableBubbles(e.target.checked)}
                className="w-3 h-3 rounded bg-zinc-950 border-theme text-theme focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#8B5CF6]"
              />
              <span>MOUSE BUBBLES</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-300 transition-colors">
              <input
                type="checkbox"
                checked={enableSparks}
                onChange={(e) => setEnableSparks(e.target.checked)}
                className="w-3 h-3 rounded bg-zinc-950 border-theme text-theme focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#8B5CF6]"
              />
              <span>TYPING SPARKS</span>
            </label>
          </div>
        </motion.div>
      </div>
    );
  }

  // CORE APPLICATION DASHBOARD (LOGGED IN)
  return (
    <div className={`app-wrapper bg-[#050816] ${theme} flex flex-col md:flex-row transition-all duration-500 min-h-screen relative overflow-hidden font-sans`}>
      
      {/* Wrangler Enterprise SaaS Atmospheric Ambient Blurs (Zero Gridlines) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-[-10%] left-[10%] w-[650px] h-[650px] rounded-full bg-[#5B7CFA]/15 blur-[160px] animate-pulse duration-[9000ms]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-[#00C2FF]/15 blur-[150px] animate-pulse duration-[7000ms]" />
        <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#7B61FF]/12 blur-[150px]" />
      </div>

      {/* TOP FLOATING HORIZONTAL ENTERPRISE NAVBAR (WRANGLER DOCK) - Rendered only in Horizontal Navigation Mode */}
      {!isSidebarNavMode && (
        <header className="kelly-dashboard-header fixed top-0 inset-x-0 z-50 px-4 md:px-7 flex justify-center pointer-events-none select-none">
          <div className="kelly-dashboard-bar wrangler-navbar pointer-events-auto max-w-[1440px] w-full px-1 py-2 md:py-2 flex items-center justify-between gap-3 md:gap-6 border border-white/10 shadow-2xl transition-all duration-300">
            
            {/* Brand Header Badge */}
            <div className="kelly-dashboard-brand flex items-center gap-3 flex-shrink-0">
              <div className="kelly-dashboard-monogram w-8 h-8 rounded-full bg-gradient-to-tr from-[#5B7CFA] via-[#7B61FF] to-[#00C2FF] p-[1px] shadow-[0_0_20px_rgba(0,194,255,0.4)] flex-shrink-0">
                <div className="w-full h-full bg-[#050816] rounded-full flex items-center justify-center text-[#00C2FF] font-bold text-sm">
                  
                </div>
              </div>
              <span className="font-heading font-bold text-base md:text-lg text-white tracking-tight hidden md:inline-block">
                PatentMind <span className="text-[10px] text-[#00C2FF] font-mono font-semibold ml-1 px-2.5 py-0.5 rounded-full bg-[#5B7CFA]/15 border border-[#5B7CFA]/40 shadow-[0_0_10px_rgba(91,124,250,0.2)]">AI studio</span>
              </span>
            </div>

          {/* Center Horizontal Navigation Menu */}
          <nav className="flex items-center gap-1 md:gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar">
            {[
              { id: 'search', label: 'Search', icon: Search },
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'knowledge-graph', label: 'Graph', icon: Network },
              { id: 'compare', label: 'Compare', icon: Layers },
              { id: 'upload', label: 'Upload', icon: UploadCloud },
              { id: 'chat', label: 'Chatbot', icon: MessageSquare },
              { id: 'saved-patents', label: 'Saved', icon: Tag },
              { id: 'projects', label: 'Projects', icon: FolderOpen },
              { id: 'team', label: 'Team', icon: UserCheck },
              { id: 'notifications', label: 'Alerts', icon: ShieldAlert },
              { id: 'api-keys', label: 'API Keys', icon: KeyRound },
              { id: 'billing', label: 'Billing', icon: Palette },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'help', label: 'Help', icon: HelpCircle }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={`kelly-dashboard-navitem flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                    isActive 
                      ? 'kelly-dashboard-navitem-active'
                      : ''
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls & Profile */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Sidebar vs Top Navigation Mode Toggle */}
            <button
              onClick={() => {
                const nextMode = !isSidebarNavMode;
                setIsSidebarNavMode(nextMode);
                localStorage.setItem('sidebar_nav_mode', nextMode.toString());
              }}
              title={isSidebarNavMode ? "Switch to Top Floating Navbar" : "Switch to Left Sidebar Navigation"}
              className="p-2 text-slate-400 hover:text-[#00C2FF] hover:bg-white/5 border border-white/10 rounded-full transition-all flex items-center justify-center flex-shrink-0"
            >
              {isSidebarNavMode ? (
                <PanelLeftClose className="w-3.5 h-3.5" />
              ) : (
                <PanelLeftOpen className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Language Dropdown Pill */}
            <div className="kelly-dashboard-language relative flex items-center bg-white/5 border border-white/10 rounded-full px-2.5 py-1.5 hover:border-white/20 transition-all">
              <Globe className="w-3.5 h-3.5 text-[#00C2FF] mr-1.5 flex-shrink-0" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-[11px] font-sans text-slate-200 focus:outline-none border-none cursor-pointer w-[45px] md:w-[70px] truncate"
              >
                <option value="English" className="bg-[#050816] text-slate-200">En 🇺🇸</option>
                <option value="Hindi" className="bg-[#050816] text-slate-200">Hi 🇮🇳</option>
                <option value="Spanish" className="bg-[#050816] text-slate-200">Es 🇪🇸</option>
                <option value="French" className="bg-[#050816] text-slate-200">Fr 🇫🇷</option>
                <option value="German" className="bg-[#050816] text-slate-200">De 🇩🇪</option>
              </select>
            </div>

            {/* User Profile & Password Modal Toggle */}
            <div onClick={() => setActiveTab('profile')} className="kelly-dashboard-user hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full py-1.5 px-3 cursor-pointer hover:border-[#00C2FF]/40 transition-all" title={`User Profile: ${username}`}>
              <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-pulse shadow-[0_0_10px_rgba(0,194,255,0.9)]"></span>
              <span className="text-xs font-semibold text-white tracking-wide uppercase truncate max-w-[90px]">{username}</span>
              <button
                type="button"
                onClick={() => {
                  setShowChangePasswordModal(true);
                  setChangePasswordMsg('');
                }}
                className="text-slate-400 hover:text-[#00C2FF] transition-all ml-1 p-0.5 rounded"
                title="Change Account Password"
              >
                <KeyRound className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutModal(true)}
              title="Log out"
              className="kelly-dashboard-logout p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all border border-transparent hover:border-red-500/20"
            >
              <LogOut className="w-4 h-4 text-red-500" />
            </button>
          </div>

        </div>
      </header>
      )}

      {/* LEFT SIDEBAR NAVIGATION PANEL (Rendered only in Sidebar Navigation Mode) */}
      {isSidebarNavMode && (
        <aside className={`w-[260px] bg-[#050816] border-r border-white/15 h-screen flex flex-col justify-between flex-shrink-0 z-40 fixed md:sticky top-0 left-0 transition-transform duration-300 ${
          isSidebarCollapsed ? '-translate-x-full md:translate-x-0 md:w-[76px]' : 'translate-x-0'
        }`}>
          {/* Top Branding Monogram Area */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5B7CFA] via-[#7B61FF] to-[#00C2FF] p-[1px] shadow-[0_0_20px_rgba(0,194,255,0.4)] flex-shrink-0">
                <div className="w-full h-full bg-[#050816] rounded-full flex items-center justify-center text-[#00C2FF] font-bold text-sm">
                  
                </div>
              </div>
              {!isSidebarCollapsed && (
                <span className="font-heading font-bold text-sm text-white tracking-tight">
                  PatentMind <span className="text-[9px] text-[#00C2FF] font-mono block">AI studio</span>
                </span>
              )}
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded hidden md:block"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Center Nav List */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
            {[
              { id: 'search', label: 'Search', icon: Search },
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'knowledge-graph', label: 'Graph', icon: Network },
              { id: 'compare', label: 'Compare', icon: Layers },
              { id: 'upload', label: 'Upload', icon: UploadCloud },
              { id: 'chat', label: 'Chatbot', icon: MessageSquare },
              { id: 'saved-patents', label: 'Saved', icon: Tag },
              { id: 'projects', label: 'Projects', icon: FolderOpen },
              { id: 'team', label: 'Team', icon: UserCheck },
              { id: 'notifications', label: 'Alerts', icon: ShieldAlert },
              { id: 'api-keys', label: 'API Keys', icon: KeyRound },
              { id: 'billing', label: 'Billing', icon: Palette },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'help', label: 'Help', icon: HelpCircle }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-250 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#5B7CFA] via-[#7B61FF] to-[#00C2FF] text-white font-semibold shadow-[0_0_20px_rgba(0,194,255,0.35)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <TabIcon className="w-4 h-4 flex-shrink-0" />
                  {!isSidebarCollapsed && <span>{tab.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Bottom Profile Details Row */}
          <div className="p-4 border-t border-white/10 space-y-3 bg-[#03050F]/60">
            {/* Sidebar toggle back to Horizontal Dock */}
            <button
              onClick={() => {
                setIsSidebarNavMode(false);
                localStorage.setItem('sidebar_nav_mode', 'false');
              }}
              className="w-full flex items-center justify-center gap-2 py-2 border border-white/10 hover:border-[#00C2FF]/40 rounded-lg text-[10px] font-mono text-slate-350 hover:text-white hover:bg-white/5 transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              {!isSidebarCollapsed && <span>TOP FLOATING NAV</span>}
            </button>

            {/* Profile User Status */}
            <div onClick={() => setActiveTab('profile')} className="flex items-center gap-3 truncate cursor-pointer hover:opacity-90 transition-opacity" title="View Profile">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00C2FF] animate-pulse shadow-[0_0_10px_rgba(0,194,255,0.9)] flex-shrink-0" />
              {!isSidebarCollapsed && (
                <div className="truncate text-left leading-none">
                  <span className="text-xs font-semibold text-white block uppercase tracking-wide truncate">{username}</span>
                  <span className="text-[9px] text-[#00C2FF] font-mono block tracking-widest mt-0.5">ONLINE</span>
                </div>
              )}
            </div>

            {/* Logout Row */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!isSidebarCollapsed && <span>LOGOUT</span>}
            </button>
          </div>
        </aside>
      )}



      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#050816] border border-white/10 wrangler-card p-6 md:p-8 max-w-sm w-full space-y-5 fade-in rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-main flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#00C2FF]" />
                CHANGE ACCOUNT PASSWORD
              </h3>
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="text-zinc-500 hover:text-white font-mono text-xs"
              >
                
              </button>
            </div>

            {changePasswordMsg && (
              <div className={`p-2.5 text-[9.5px] font-mono rounded border ${
                changePasswordMsg.startsWith('SUCCESS')
                  ? 'border-emerald-900 bg-emerald-950/30 text-emerald-400'
                  : 'border-red-900 bg-red-950/30 text-red-400'
              }`}>
                {changePasswordMsg}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="border-b border-white/10 py-1">
                <label className="text-[9px] font-mono text-zinc-400 block mb-1 uppercase">CURRENT PASSWORD</label>
                <input
                  type="password"
                  value={changePasswordForm.old_password}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, old_password: e.target.value })}
                  required
                  className="w-full bg-transparent text-xs font-mono text-main focus:outline-none"
                />
              </div>

              <div className="border-b border-white/10 py-1">
                <label className="text-[9px] font-mono text-zinc-400 block mb-1 uppercase">NEW PASSWORD (MIN 4 CHARACTERS)</label>
                <input
                  type="password"
                  value={changePasswordForm.new_password}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, new_password: e.target.value })}
                  required
                  className="w-full bg-transparent text-xs font-mono text-main focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="flex-1 py-2 border border-white/10 text-[10px] font-mono text-zinc-400 hover:text-white uppercase tracking-wider rounded-xl"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={changePasswordLoading}
                  className="flex-1 py-2 btn-theme text-[10px] font-mono uppercase tracking-wider disabled:opacity-40 rounded-xl"
                >
                  {changePasswordLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main ref={mainContentRef} className={`kelly-dashboard-main w-full max-w-7xl mx-auto pb-24 px-6 overflow-y-auto flex flex-col min-h-screen relative z-10 transition-all duration-500 ${
        isSidebarNavMode ? 'pt-8' : 'pt-28'
      }`}>

        {/* SEMANTIC SEARCH & LANDING HERO TAB */}
        {activeTab === 'search' && (
          <div className="space-y-24 pb-16">
            
            {/* SECTION 1: WRANGLER ENTERPRISE SAAS HERO */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative text-center pt-8 md:pt-16 pb-12 max-w-4xl mx-auto space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5B7CFA]/10 border border-[#5B7CFA]/30 text-[#00C2FF] text-xs font-semibold uppercase tracking-wider shadow-[0_0_20px_rgba(91,124,250,0.2)]">
                <Sparkles className="w-3.5 h-3.5 text-[#00C2FF] animate-spin" style={{ animationDuration: '6s' }} />
                <span>Next-Gen Intellectual Property Architecture</span>
              </div>

              <h1 className="wrangler-gradient-text text-5xl sm:text-6xl md:text-7xl font-heading font-extrabold tracking-tight leading-[1.08]">
                AI-Powered Patent Intelligence Platform
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
                Transform complex patent research into actionable engineering decisions. Powered by high-speed PaddleOCR text extraction, ChromaDB vector search, and custom Retrieval-Augmented Generation (RAG).
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setActiveTab('upload')}
                  className="w-full sm:w-auto btn-theme px-8 py-4 rounded-full font-heading font-semibold text-sm tracking-wide flex items-center justify-center gap-3"
                >
                  <UploadCloud className="w-5 h-5 text-white" />
                  <span>Upload Patent</span>
                  <ArrowRight className="w-4 h-4 text-white/80" />
                </button>
                <a
                  href="#live-rag-search"
                  className="w-full sm:w-auto wrangler-pill px-8 py-4 rounded-full font-heading font-medium text-sm text-slate-200 flex items-center justify-center gap-3 hover:text-white hover:border-[#00C2FF]/50 transition-all duration-300"
                >
                  <Search className="w-4 h-4 text-[#00C2FF]" />
                  <span>Try Live Search Demo</span>
                </a>
              </div>
            </motion.div>

            {/* SECTION 2: TRUSTED COMPANIES */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center space-y-5 border-y border-white/[0.06] py-10 my-8"
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400">
                POWERING RESEARCH AT ENTERPRISE R&D LABS & PATENT DEFENSE TEAMS
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-12 opacity-80">
                <span className="text-sm font-heading font-bold text-slate-400 tracking-tight flex items-center gap-1.5 hover:text-white transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#00C2FF]"></span> APPLE ADVANCED R&D
                </span>
                <span className="text-sm font-heading font-bold text-slate-400 tracking-tight flex items-center gap-1.5 hover:text-white transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#5B7CFA]"></span> STRIPE IP VENTURES
                </span>
                <span className="text-sm font-heading font-bold text-slate-400 tracking-tight flex items-center gap-1.5 hover:text-white transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#7B61FF]"></span> LINEAR DEEPSEARCH
                </span>
                <span className="text-sm font-heading font-bold text-slate-400 tracking-tight flex items-center gap-1.5 hover:text-white transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#00C2FF]"></span> OPENAI IP SHIELD
                </span>
                <span className="text-sm font-heading font-bold text-slate-400 tracking-tight flex items-center gap-1.5 hover:text-white transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#5B7CFA]"></span> ANTHROPIC TECH DEFENSE
                </span>
              </div>
            </motion.div>

            {/* SECTION 3: HOW IT WORKS (ANIMATED CONNECTED TIMELINE) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-10 max-w-7xl mx-auto"
            >
              <div className="text-center space-y-3">
                <span className="wrangler-badge">Enterprise Pipeline Architecture</span>
                <h2 className="text-3xl md:text-5xl font-heading font-bold text-white tracking-tight">
                  How PatentMind AI Works
                </h2>
                <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
                  An automated multi-stage pipeline designed for extreme precision, security, and sub-second querying across complex PDF patent archives.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5 relative">
                {[
                  { step: "01", title: "Upload", sub: "PDF Document", icon: UploadCloud, color: "from-[#5B7CFA] to-[#3B82F6]" },
                  { step: "02", title: "OCR", sub: "PaddleOCR Engine", icon: FileCode, color: "from-[#3B82F6] to-[#7B61FF]" },
                  { step: "03", title: "Embedding", sub: "768-dim Vectors", icon: Cpu, color: "from-[#7B61FF] to-[#A855F7]" },
                  { step: "04", title: "Vector DB", sub: "ChromaDB Store", icon: Database, color: "from-[#A855F7] to-[#00C2FF]" },
                  { step: "05", title: "LLM", sub: "Reasoning Matrix", icon: Network, color: "from-[#00C2FF] to-[#38BDF8]" },
                  { step: "06", title: "AI Answer", sub: "Verified Citation", icon: CheckCircle2, color: "from-[#38BDF8] to-[#34D399]" },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className="relative flex flex-col items-center">
                      <div className="wrangler-card w-full p-5 flex flex-col items-center text-center justify-between h-[180px] group hover:border-[#00C2FF]/60 relative z-10">
                        <span className="text-[10px] font-mono text-[#00C2FF] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          STEP {item.step}
                        </span>
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} p-[1px] shadow-lg flex items-center justify-center my-2 group-hover:scale-110 transition-transform duration-300`}>
                          <div className="w-full h-full bg-[#050816] rounded-[15px] flex items-center justify-center">
                            <Icon className="w-5 h-5 text-[#00C2FF] group-hover:text-white transition-colors" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-sm text-white">{item.title}</h4>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.sub}</p>
                        </div>
                      </div>

                      {/* Connecting glowing timeline arrow between cards on large screens */}
                      {index < 5 && (
                        <div className="hidden lg:flex absolute -right-[18px] top-1/2 -translate-y-1/2 z-20 text-[#00C2FF] font-bold text-lg animate-pulse">
                          →
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* SECTION 4: ENTERPRISE FEATURES GRID */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-12 max-w-7xl mx-auto pt-8"
            >
              <div className="text-center space-y-3">
                <span className="wrangler-badge">Stripe & Linear Inspired Precision</span>
                <h2 className="text-3xl md:text-5xl font-heading font-bold text-white tracking-tight">
                  Comprehensive IP Superpowers
                </h2>
                <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
                  Every tool required to dissect claims, synthesize Prior Art, and out-innovate the market in an enterprise glass UI.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "Patent Chat", desc: "Interactive conversational interface for multi-claim reasoning and real-time legal scope interrogation.", icon: MessageSquare, tab: "chat", tag: "RAG ENGINE" },
                  { title: "AI Summary", desc: "Generate instant executive briefs, technical abstracts, and risk profiles in clean markdown format.", icon: FileText, tab: "dashboard", tag: "SYNTHESIS" },
                  { title: "OCR Extraction", desc: "High-accuracy PaddleOCR deep scanning for messy scanned patent PDFs and complex diagrams.", icon: Layers, tab: "upload", tag: "500+ LANG" },
                  { title: "Semantic Search", desc: "High-dimensional embedding queries that capture inventive concepts beyond literal keyword matching.", icon: Search, tab: "search", tag: "VECTOR SPELL" },
                  { title: "Patent Comparison", desc: "Side-by-side specification diffing and technical overlap matrix to benchmark competitor filing claims.", icon: Sliders, tab: "dashboard", tag: "DIFF MATRIX" },
                  { title: "Citation Finder", desc: "Automatic extraction of backward Prior Art references and forward citation dependencies.", icon: Tag, tab: "dataset", tag: "CITATIONS" },
                  { title: "Multi-PDF Chat", desc: "Interrogate entire patent clusters and corporate dataset archives simultaneously in a unified conversation.", icon: FolderOpen, tab: "chat", tag: "CROSS-DOC" },
                  { title: "Vector Search", desc: "Sub-millisecond ChromaDB index queries with configurable similarity thresholds and visual scoring.", icon: Database, tab: "search", tag: "CHROMADB" }
                ].map((feat, idx) => {
                  const FeatIcon = feat.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveTab(feat.tab)}
                      className="wrangler-card p-7 flex flex-col justify-between cursor-pointer group hover:border-[#00C2FF]/50 hover:bg-white/[0.08] transition-all"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="w-11 h-11 rounded-2xl bg-[#5B7CFA]/15 border border-[#5B7CFA]/30 flex items-center justify-center text-[#00C2FF] group-hover:bg-[#5B7CFA] group-hover:text-white transition-all shadow-md">
                            <FeatIcon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono font-semibold text-[#7B61FF] bg-[#7B61FF]/10 border border-[#7B61FF]/30 px-2.5 py-1 rounded-full uppercase">
                            {feat.tag}
                          </span>
                        </div>
                        <h3 className="font-heading font-bold text-lg text-white group-hover:text-[#00C2FF] transition-colors">
                          {feat.title}
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {feat.desc}
                        </p>
                      </div>

                      <div className="pt-6 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-heading font-semibold text-slate-400 group-hover:text-white transition-colors">
                        <span>Launch Module</span>
                        <ArrowRight className="w-4 h-4 text-[#00C2FF] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* SECTION 5: LIVE RAG SEARCH MODULE */}
            <div id="live-rag-search" className="pt-12 border-t border-white/[0.08]">
              <div className="mb-6">
                <span className="wrangler-badge">Real-Time IP Query Deck</span>
                <h2 className="wrangler-gradient-text text-3xl md:text-4xl font-heading font-bold mt-2">
                  Live Semantic Patent Search
                </h2>
              </div>

            <form onSubmit={handleSearch} className="space-y-6">
              <div className="glass-panel-sleek rounded-xl p-3 relative flex items-center shadow-lg transition-all focus-within:border-[#7C3AED]/60 focus-within:shadow-[0_0_25px_rgba(124,58,237,0.15)]">
                <Search className="w-4 h-4 text-zinc-400 ml-2 flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SEARCH CLAIMS, ABSTRACTS, OR PATENT SPECIFICATIONS..."
                  className="w-full bg-transparent pl-4 pr-36 py-2 text-xs uppercase font-mono tracking-wider focus:outline-none placeholder:text-zinc-600 text-main"
                />
                <div className="absolute right-28 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleVoiceInput(setQuery, 'search')}
                    className={`p-1.5 rounded transition-all ${
                      isListening && activeListeningField === 'search'
                        ? 'text-red-400 bg-red-950/40 animate-pulse'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                    title="Voice Input (Speech-to-Text)"
                  >
                    {isListening && activeListeningField === 'search' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono tracking-widest uppercase bg-[#7C3AED] hover:bg-[#8B5CF6] disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-150 shadow-md"
                >
                  {searchLoading ? 'SEARCHING...' : 'SUBMIT'}
                </button>
              </div>

              {/* Quick Search Tag Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest mr-2">QUICK SUGGESTIONS:</span>
                {[
                  "Vision-Language-Action Models",
                  "Neural Network Control",
                  "Autonomous Drone Trajectories",
                  "Robotic Arm Manipulation",
                  "Agentic AI Governance"
                ].map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-mono text-zinc-400 hover:text-white uppercase transition-all"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-6 text-[10px] font-mono tracking-wider text-zinc-500 pt-1">
                <div className="flex items-center gap-2">
                  <span>SOURCE LIMIT:</span>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="bg-[#111111] border border-white/10 text-zinc-300 focus:outline-none px-2 py-1 rounded text-[10px]"
                  >
                    <option value="">ALL SOURCES</option>
                    <option value="USPTO">USPTO</option>
                    <option value="WIPO">WIPO</option>
                    <option value="Google Patents">GOOGLE PATENTS</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span>SECTION LIMIT:</span>
                  <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    className="bg-[#111111] border border-white/10 text-zinc-300 focus:outline-none px-2 py-1 rounded text-[10px]"
                  >
                    <option value="">ALL SECTIONS</option>
                    <option value="Abstract">ABSTRACT</option>
                    <option value="Description">DESCRIPTION</option>
                    <option value="Claims">CLAIMS</option>
                  </select>
                </div>
              </div>
            </form>

            {searchError && (
              <div className="p-4 border border-theme text-xs text-muted font-light flex items-center gap-2 bg-black/10">
                <AlertTriangle className="w-4 h-4 text-zinc-555 flex-shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {searchResults && (
              <div className="space-y-12">
                {/* RAG Synthesized Answer */}
                <div className="panel-card p-8 rounded-none space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 tracking-wider">
                    <span>LLM CHAIN: {searchResults.active_llm.toUpperCase()}</span>
                    <span>LATENCY: {searchResults.latency_sec}s</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <h3 className="text-serif-editorial text-xl text-main tracking-wide flex items-center gap-2">
                      <span>🧠 </span> <span>SYNTHESIZED INSIGHTS</span>
                    </h3>
                    <button
                      onClick={() => handleSpeakText(searchResults.answer)}
                      className={`flex items-center gap-1.5 text-[10px] font-mono border px-2.5 py-1 rounded transition-colors ${
                        isSpeaking ? 'border-amber-800 text-amber-400 bg-amber-950/20' : 'border-theme text-zinc-400 hover:text-white'
                      }`}
                      title="Voice Narration (Text-to-Speech)"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeaking ? 'STOP AUDIO' : 'LISTEN ANSWER'}</span>
                    </button>
                  </div>

                  <div className="text-sm font-light leading-relaxed text-muted whitespace-pre-wrap font-sans pt-4 border-t border-theme">
                    {searchResults.answer}
                  </div>

                  {searchResults.fallback_occurred && (
                    <div className="pt-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      FAILOVER COMPLETE
                    </div>
                  )}
                </div>

                {/* Reference Attributions */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase pb-2 border-b border-theme">
                    ATTRIBUTED SOURCES ({searchResults.retrieved_chunks.length})
                  </h4>

                  <div className="space-y-10">
                    {searchResults.retrieved_chunks && searchResults.retrieved_chunks.map((chunk, idx) => (
                      <div key={idx} className="space-y-3">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline gap-2">
                          <div className="flex items-baseline gap-3">
                            <span className="text-xs font-mono text-zinc-555">{(idx + 1).toString().padStart(2, '0')}</span>
                            <h5 className="font-mono text-xs tracking-wider uppercase text-main font-semibold">
                              {chunk.metadata?.patent_number || 'N/A'}
                            </h5>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-555 bg-black/20 px-2 py-0.5 border border-theme">
                            SCORE: {typeof chunk.score === 'number' ? chunk.score.toFixed(4) : 'N/A'}
                          </span>
                        </div>

                        <div className="pl-6 space-y-2">
                          <h6 className="text-xs text-main font-medium">{chunk.metadata?.title || 'Untitled'}</h6>
                          <div className="flex flex-wrap gap-4 text-[10px] font-mono text-zinc-500 uppercase">
                            <span>SOURCE: {chunk.metadata?.source || 'N/A'}</span>
                            <span>SECTION: {chunk.metadata?.section || 'N/A'}</span>
                            {chunk.metadata?.claim_number !== undefined && chunk.metadata.claim_number !== -1 && (
                              <span>CLAIM #{chunk.metadata.claim_number}</span>
                            )}
                          </div>
                          
                          <p className="text-xs font-light text-muted leading-relaxed italic border-l border-zinc-800 pl-4 py-1 mt-2">
                            "{chunk.text || ''}"
                          </p>

                          <div className="flex flex-wrap gap-4 text-[9px] font-mono text-zinc-650 uppercase pt-2">
                            <span>INVENTORS: {Array.isArray(chunk.metadata?.inventors) ? chunk.metadata.inventors.join(', ') : (chunk.metadata?.inventors || 'N/A')}</span>
                            <span>CLASSES: {Array.isArray(chunk.metadata?.ipc_cpc_codes) ? chunk.metadata.ipc_cpc_codes.join(', ') : (chunk.metadata?.ipc_cpc_codes || 'N/A')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        )}

        {/* DASHBOARD TAB (EXECUTIVE TECHNOLOGY TELEMETRY & WHITE-SPACE ANALYSIS) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10 fade-in">
            
            {/* Header */}
            <div>
              <span className="text-[11px] text-muted font-mono tracking-widest uppercase">02. PATENT LANDSCAPE & TELEMETRY</span>
              <h2 className="text-4xl font-semibold tracking-tight text-main font-sans mt-2">Technology Dashboard</h2>
              <p className="text-xs text-zinc-400 font-light mt-1">Real-time patent creation density tracking and high-value IP white-space opportunity mapping.</p>
            </div>

            {analyticsLoading && !analytics ? (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <RefreshCw className="w-6 h-6 text-[#22D3EE] animate-spin" />
                <span className="text-xs font-mono tracking-wider text-zinc-400 uppercase">Synchronizing Patent Landscape Telemetry...</span>
              </div>
            ) : (
              <>
                {/* SECTION 1: Top Fields Where Patents Are Created Most */}
                <div className="glass-panel-sleek p-7 rounded-2xl border border-white/10 shadow-2xl space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#22D3EE]">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white font-sans">Top Patent Creation Sectors</h3>
                        <p className="text-[11px] text-zinc-400 font-light">Global filing density breakdown across technology fields</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider bg-white/5 border border-white/5 px-3 py-1 rounded-full">CREATION DENSITY</span>
                  </div>

                  <div className="space-y-6 pt-2">
                    {analytics?.top_created_fields?.map((item) => (
                      <div key={item.field} className="space-y-2">
                        <div className="flex justify-between text-xs items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-white font-medium font-sans text-sm">{item.field}</span>
                            <span className="text-[9px] font-mono text-[#22D3EE] px-2.5 py-0.5 bg-[#7C3AED]/20 border border-[#7C3AED]/40 rounded-full font-semibold">
                              {item.status}
                            </span>
                          </div>
                          <span className="text-[#22D3EE] font-mono font-bold text-xs">{item.percentage}% ({item.count} PATENTS)</span>
                        </div>
                        <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 p-0.5">
                          <div 
                            className="h-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#22D3EE] rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(34,211,238,0.3)]"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 2: White-Space Opportunities (Fields Where Users SHOULD File Patents) */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white font-sans">Recommended White-Space Targets</h3>
                        <p className="text-[11px] text-zinc-400 font-light">High-opportunity innovation sectors with low prior-art density for maximum IP moats</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-semibold">IDEAL TARGETS</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analytics?.opportunity_whitespace_fields?.map((item) => (
                      <div key={item.field} className="glass-panel-sleek p-6 rounded-2xl border border-white/10 hover:border-[#7C3AED]/60 transition-all shadow-xl space-y-4 group">
                        
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-white font-sans group-hover:text-[#22D3EE] transition-colors">{item.field}</h4>
                          <span className="text-[10px] font-mono bg-gradient-to-r from-[#7C3AED] to-[#22D3EE] text-white px-3 py-1 rounded-full font-bold shadow-md">
                            SCORE {item.opportunity_score}/100
                          </span>
                        </div>

                        {/* Opportunity Score Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-sans text-zinc-400">
                            <span>Competition: <strong className="text-zinc-200">{item.competition}</strong></span>
                            <span className="text-emerald-400 font-mono font-semibold">{item.opportunity_score}% Untapped White-Space</span>
                          </div>
                          <div className="h-2.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-[#22D3EE] rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                              style={{ width: `${item.opportunity_score}%` }}
                            />
                          </div>
                        </div>

                        {/* Strategic Callout Banner */}
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs font-sans text-zinc-300 leading-relaxed flex items-start gap-2.5">
                          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-amber-400 font-mono text-[10px] tracking-wider uppercase block mb-0.5">STRATEGIC ACTION</strong>
                            {item.recommendation}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

              </>
            )}
          </div>
        )}



        {/* DOCUMENT UPLOAD TAB */}
        {activeTab === 'upload' && (
          <div className="space-y-12 fade-in">
            <div>
              <span className="text-[11px] text-muted font-mono tracking-widest uppercase">04. CUSTOM INDEXING</span>
              <h2 className="text-serif-editorial text-4xl text-main tracking-wide mt-2">PATENT PDF UPLOADER</h2>
            </div>

            <div className="panel-card p-8 rounded-none space-y-6">
              <p className="text-xs text-muted leading-relaxed font-light">
                Index a single PDF specification. Text layer analysis cascades to scanned CPU-bound PaddleOCR segmentation if no digital text layer is present.
              </p>

              <form onSubmit={handleUploadSubmit} className="space-y-6">
                <div className="border border-dashed border-theme hover:border-zinc-500 transition-colors p-8 flex flex-col items-center justify-center gap-2 cursor-pointer bg-black/10">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="hidden"
                    id="pdf-file-input"
                  />
                  <label htmlFor="pdf-file-input" className="cursor-pointer text-center">
                    <UploadCloud className="w-6 h-6 text-zinc-555 mx-auto mb-2" />
                    <span className="text-xs font-mono tracking-wider uppercase text-zinc-400 block">
                      {uploadFile ? uploadFile.name : 'SELECT SPECIFICATION PDF'}
                    </span>
                    <span className="text-[9px] text-zinc-650 font-mono uppercase mt-1 block">MAX SIZE 10MB</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1">
                    <label className="text-zinc-500 text-[10px] font-mono tracking-wider block mb-1">PATENT NUMBER</label>
                    <input
                      type="text"
                      value={uploadForm.patent_number}
                      onChange={(e) => setUploadForm({...uploadForm, patent_number: e.target.value})}
                      placeholder="US-11234567-B2"
                      required
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-800 text-main uppercase"
                    />
                  </div>

                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1">
                    <label className="text-zinc-500 text-[10px] font-mono tracking-wider block mb-1">TITLE</label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                      placeholder="SPECIFICATION TITLE"
                      required
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-800 text-main uppercase"
                    />
                  </div>
                </div>

                <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1">
                  <label className="text-zinc-500 text-[10px] font-mono tracking-wider block mb-1">ABSTRACT SYNOPSIS</label>
                  <textarea
                    value={uploadForm.abstract}
                    onChange={(e) => setUploadForm({...uploadForm, abstract: e.target.value})}
                    placeholder="BRIEF EXCERPT..."
                    required
                    rows="2"
                    className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-800 text-main uppercase"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1">
                    <label className="text-zinc-500 text-[10px] font-mono tracking-wider block mb-1">DOCUMENT DATE</label>
                    <input
                      type="text"
                      value={uploadForm.document_date}
                      onChange={(e) => setUploadForm({...uploadForm, document_date: e.target.value})}
                      placeholder="YYYY-MM-DD"
                      required
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-850 text-main"
                    />
                  </div>

                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1">
                    <label className="text-zinc-500 text-[10px] font-mono tracking-wider block mb-1">SOURCE REGISTRY</label>
                    <select
                      value={uploadForm.source}
                      onChange={(e) => setUploadForm({...uploadForm, source: e.target.value})}
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none text-main border-none py-1"
                    >
                      <option value="USPTO" className="bg-[#0c0c0e]">USPTO</option>
                      <option value="WIPO" className="bg-[#0c0c0e]">WIPO</option>
                      <option value="Google Patents" className="bg-[#0c0c0e]">GOOGLE PATENTS</option>
                    </select>
                  </div>

                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1">
                    <label className="text-zinc-500 text-[10px] font-mono tracking-wider block mb-1">CLASSIFICATION CODES (CPC)</label>
                    <input
                      type="text"
                      value={uploadForm.ipc_cpc_codes}
                      onChange={(e) => setUploadForm({...uploadForm, ipc_cpc_codes: e.target.value})}
                      placeholder="G06F 17/30, H04L 29/06"
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-800 text-main uppercase"
                    />
                  </div>
                </div>

                <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1">
                  <label className="text-zinc-500 text-[10px] font-mono tracking-wider block mb-1">INVENTORS (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    value={uploadForm.inventors}
                    onChange={(e) => setUploadForm({...uploadForm, inventors: e.target.value})}
                    placeholder="e.g. SMITH, JOHN, DOE, JANE"
                    className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-800 text-main uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="w-full py-3.5 btn-theme text-xs font-mono tracking-widest uppercase disabled:opacity-40"
                >
                  {uploadLoading ? 'VECTORIZING EXTRACTED CLAIMS...' : 'UPLOAD AND INDEX DOCUMENT'}
                </button>
              </form>
            </div>

            {uploadError && (
              <div className="p-4 border border-zinc-800 bg-black/10 text-xs text-red-300 font-light flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadResult && (
              <div className="p-6 border border-theme bg-black/10 text-xs font-light space-y-3 text-zinc-300">
                <div className="flex items-center gap-2 font-mono uppercase tracking-wider">
                  <CheckCircle2 className="w-4.5 h-4.5 text-zinc-450" />
                  <span>UPLOAD INDEXED: SUCCESS</span>
                </div>
                <div className="space-y-1 pt-2 font-mono">
                  <p>{uploadResult.message}</p>
                  <p>S3 FILE: {uploadResult.s3_url}</p>
                  <p>INDEXED SECTIONS: {uploadResult.chunks_count} chunks</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DATASET IMPORT TAB */}
        {activeTab === 'dataset' && (
          <div className="space-y-8 fade-in max-w-4xl">
            <div>
              <span className="text-[10px] text-muted font-mono tracking-widest uppercase">05. DATASET INGESTION</span>
              <h2 className="text-4xl font-semibold tracking-tight text-main font-sans mt-1">Google Patents & Bulk Dataset Indexer</h2>
              <p className="text-xs text-zinc-400 font-light mt-1">
                Fetch patent specifications directly from Google Patents or upload structured CSV/JSON datasets into your vector database.
              </p>
            </div>

            {/* Sub-Nav Switcher */}
            <div className="flex items-center gap-2 p-1.5 bg-[#08181C]/80 border border-[#22D3EE]/20 rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => setDatasetActiveTab('google')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold font-sans transition-all flex items-center gap-2 ${
                  datasetActiveTab === 'google'
                    ? 'bg-gradient-to-r from-[#0D9488] to-[#22D3EE] text-white shadow-md'
                    : 'text-teal-200/70 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Google Patents Direct Fetcher</span>
              </button>
              <button
                type="button"
                onClick={() => setDatasetActiveTab('file')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold font-sans transition-all flex items-center gap-2 ${
                  datasetActiveTab === 'file'
                    ? 'bg-gradient-to-r from-[#0D9488] to-[#22D3EE] text-white shadow-md'
                    : 'text-teal-200/70 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Upload CSV / JSON Dataset File</span>
              </button>
            </div>

            {/* TAB 1: GOOGLE PATENTS DIRECT FETCHER */}
            {datasetActiveTab === 'google' && (
              <div className="glass-panel-sleek p-8 rounded-2xl border border-white/10 space-y-6 shadow-2xl">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-white font-sans flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#22D3EE]" />
                    Direct Google Patents Fetch & Auto-Vectorization
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed font-light">
                    Enter any technology topic, technical field, or keyword. PatentMind AI will query <strong>Google Patents</strong> live, parse publication specifications, chunk claims, and index vector embeddings directly into your vector store.
                  </p>
                </div>

                <form onSubmit={handleGooglePatentsFetch} className="space-y-5">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={googleFetchQuery}
                        onChange={(e) => setGoogleFetchQuery(e.target.value)}
                        placeholder="Search Google Patents topic (e.g., Neural Networks, Quantum Cryptography, Autonomous Guidance...)"
                        required
                        className="w-full bg-[#08181C] border border-[#22D3EE]/30 focus:border-[#22D3EE] rounded-xl pl-10 pr-4 py-3 text-xs font-sans text-white focus:outline-none placeholder:text-zinc-500 shadow-inner"
                      />
                    </div>
                    <select
                      value={googleFetchLimit}
                      onChange={(e) => setGoogleFetchLimit(e.target.value)}
                      className="bg-[#08181C] border border-[#22D3EE]/30 rounded-xl px-3 py-3 text-xs font-sans text-teal-100 focus:outline-none cursor-pointer"
                    >
                      <option value={5} className="bg-[#08181C]">5 Patents</option>
                      <option value={10} className="bg-[#08181C]">10 Patents</option>
                      <option value={20} className="bg-[#08181C]">20 Patents</option>
                    </select>
                    <button
                      type="submit"
                      disabled={googleFetchLoading}
                      className="px-6 py-3 bg-gradient-to-r from-[#0D9488] to-[#22D3EE] hover:opacity-90 text-white font-semibold text-xs font-sans tracking-wide uppercase rounded-xl transition-all shadow-lg disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {googleFetchLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>FETCHING GOOGLE PATENTS...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>FETCH & VECTORIZE PATENTS</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Preset Keyword Pills */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-mono text-teal-200/60 uppercase tracking-wider block">POPULAR GOOGLE PATENT SEARCH TOPICS:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Artificial Intelligence & Neural Control',
                        'Quantum Cryptography Protocol',
                        'Autonomous Robotics & Guidance',
                        'Genomic CRISPR Editing',
                        'Renewable Solar Cell Efficiency'
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setGoogleFetchQuery(preset);
                            handleGooglePatentsFetch(null, preset);
                          }}
                          className="px-3 py-1.5 bg-[#0E262B]/80 hover:bg-[#22D3EE]/20 border border-[#22D3EE]/20 rounded-lg text-xs text-teal-200 transition-all font-sans"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </form>

                {googleFetchError && (
                  <div className="p-4 border border-red-500/30 bg-red-950/20 text-xs text-red-300 font-light flex items-center gap-2 rounded-xl">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                    <span>{googleFetchError}</span>
                  </div>
                )}

                {googleFetchResult && (
                  <div className="p-6 border border-[#22D3EE]/30 bg-[#08181C]/90 rounded-xl text-xs font-light space-y-4 text-zinc-300">
                    <div className="flex items-center justify-between font-mono uppercase tracking-wider text-[#22D3EE]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                        <span>GOOGLE PATENTS INGESTION COMPLETE</span>
                      </div>
                      <span className="text-[10px] text-zinc-400">Latency: {googleFetchResult.latency_sec}s</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-xs font-mono py-2">
                      <div className="border border-white/10 p-3 rounded-xl bg-white/5">
                        <span className="text-zinc-400 text-[10px] block mb-1">SEARCH QUERY</span>
                        <span className="text-white font-semibold truncate block">{googleFetchResult.query}</span>
                      </div>
                      <div className="border border-white/10 p-3 rounded-xl bg-white/5">
                        <span className="text-zinc-400 text-[10px] block mb-1">PATENTS INGESTED</span>
                        <span className="text-[#22D3EE] font-semibold">{googleFetchResult.successfully_ingested} / {googleFetchResult.total_fetched}</span>
                      </div>
                      <div className="border border-white/10 p-3 rounded-xl bg-white/5">
                        <span className="text-zinc-400 text-[10px] block mb-1">CHUNKS VECTORIZED</span>
                        <span className="text-emerald-400 font-semibold">{googleFetchResult.total_chunks_indexed} vectors</span>
                      </div>
                    </div>

                    {googleFetchResult.fetched_patents && googleFetchResult.fetched_patents.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Newly Ingested Patents:</span>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {googleFetchResult.fetched_patents.map((p, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-lg text-xs">
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-mono text-[#22D3EE] font-bold">{p.patent_number}</span>
                                <span className="text-white truncate font-sans">{p.title}</span>
                              </div>
                              <span className="text-[9px] font-mono bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full flex-shrink-0">{p.source}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CSV / JSON FILE IMPORT */}
            {datasetActiveTab === 'file' && (
              <div className="glass-panel-sleek p-8 rounded-2xl border border-white/10 space-y-6 shadow-2xl">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-white font-sans flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#22D3EE]" />
                    Batch CSV / JSON Dataset Upload
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed font-light">
                    Upload a structured <strong>JSON</strong> (array of patent records) or <strong>CSV</strong> dataset file. The processing engine will parse, validate fields, chunk claim text, and index vector embeddings into the database automatically.
                  </p>
                </div>

                <form onSubmit={handleDatasetSubmit} className="space-y-6">
                  <div className="border-2 border-dashed border-[#22D3EE]/30 hover:border-[#7C3AED]/70 transition-all p-10 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer bg-white/5 group shadow-inner">
                    <input
                      type="file"
                      accept=".json,.csv"
                      onChange={(e) => setDatasetFile(e.target.files[0])}
                      className="hidden"
                      id="dataset-file-input"
                    />
                    <label htmlFor="dataset-file-input" className="cursor-pointer text-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#22D3EE] mx-auto shadow-lg group-hover:scale-110 transition-transform">
                        <FileCode className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-white block font-sans">
                        {datasetFile ? datasetFile.name : 'Choose a JSON or CSV dataset file'}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono uppercase block">Max File Size: 25MB • JSON / CSV</span>
                    </label>
                  </div>

                  {/* Sample JSON/CSV Schema helper */}
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-xs font-mono space-y-1.5 text-zinc-400">
                    <span className="text-[#22D3EE] font-bold block text-[10px] uppercase">Expected Schema Fields:</span>
                    <p className="text-[11px] text-zinc-300">
                      <code className="text-[#8B5CF6]">patent_number</code>, <code className="text-[#8B5CF6]">title</code>, <code className="text-[#8B5CF6]">abstract</code>, <code className="text-[#8B5CF6]">claims</code>, <code className="text-[#8B5CF6]">source</code>, <code className="text-[#8B5CF6]">document_date</code>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={datasetLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-[#0D9488] to-[#22D3EE] hover:opacity-90 text-white font-semibold text-xs font-sans tracking-wider uppercase rounded-xl transition-all shadow-lg disabled:opacity-40"
                  >
                    {datasetLoading ? 'BATCH VECTORIZING DATASET RECORDS...' : 'START BULK INGESTION'}
                  </button>
                </form>
              </div>
            )}

            {datasetError && (
              <div className="p-4 border border-zinc-800 bg-black/15 text-xs text-red-300 font-light flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{datasetError}</span>
              </div>
            )}

            {datasetResult && (
              <div className="p-6 border border-theme bg-black/15 text-xs font-light space-y-4 text-zinc-300">
                <div className="flex items-center gap-2 font-mono uppercase tracking-wider">
                  <CheckCircle2 className="w-4.5 h-4.5 text-zinc-450" />
                  <span>DATASET IMPORT RESULTS</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono py-2">
                  <div className="border border-theme p-3">
                    <span className="text-zinc-550 text-[10px] block mb-1">TOTAL SCANNED</span>
                    <span className="text-main font-semibold">{datasetResult.total_records_read}</span>
                  </div>
                  <div className="border border-theme p-3">
                    <span className="text-zinc-550 text-[10px] block mb-1">INGESTED</span>
                    <span className="text-main font-semibold text-zinc-200">{datasetResult.successfully_ingested}</span>
                  </div>
                  <div className="border border-theme p-3">
                    <span className="text-zinc-550 text-[10px] block mb-1">VECTORS LOADED</span>
                    <span className="text-main font-semibold">{datasetResult.total_chunks_indexed}</span>
                  </div>
                  <div className="border border-theme p-3">
                    <span className="text-zinc-550 text-[10px] block mb-1">FAILED</span>
                    <span className={`font-semibold ${datasetResult.failed_records_count > 0 ? 'text-amber-500' : 'text-zinc-400'}`}>
                      {datasetResult.failed_records_count}
                    </span>
                  </div>
                </div>

                {datasetResult.errors && datasetResult.errors.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="font-mono text-zinc-555 text-[10px] uppercase block">INGESTION DIAGNOSTIC WARNINGS (TOP 10):</span>
                    <ul className="list-disc list-inside font-mono text-[9px] text-zinc-500 space-y-1 pl-1.5">
                      {datasetResult.errors.map((err, idx) => (
                        <li key={idx} className="truncate" title={err}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CHATBOT TAB (CHATGPT STYLE WITH DIRECT PDF ANALYZER) */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col space-y-8 fade-in min-h-[78vh] justify-between max-w-4xl w-full mx-auto">
            
            {/* Hidden File Input for PDF Analyzer */}
            <input
              type="file"
              ref={pdfInputRef}
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleChatPdfUpload(e.target.files[0]);
                  e.target.value = null;
                }
              }}
            />

            {/* Chat Thread Container OR Centered Hero Title */}
            <div className="flex-1 space-y-6 flex flex-col justify-center my-auto">
              
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-4 space-y-6 max-w-xl mx-auto my-auto">
                  <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-main font-sans">
                    What can I help with?
                  </h2>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">
                    Ask any question, analyze patent claims, or attach a PDF specification directly using the paperclip 📎 button below.
                  </p>

                  {/* Quick Action Suggestion Cards */}
                  <div className="grid grid-cols-2 gap-3 w-full pt-2">
                    <button
                      onClick={() => pdfInputRef.current?.click()}
                      className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left space-y-1 transition-all group"
                    >
                      <div className="flex items-center gap-2 text-xs font-mono text-[#22D3EE] font-semibold">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>ANALYZE PDF</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-light">Upload PDF for instant AI prior-art analysis</p>
                    </button>

                    <button
                      onClick={() => setChatInput("Search for recent AI prior-art patents in USPTO database")}
                      className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left space-y-1 transition-all group"
                    >
                      <div className="flex items-center gap-2 text-xs font-mono text-[#8B5CF6] font-semibold">
                        <Globe className="w-3.5 h-3.5" />
                        <span>DEEP SEARCH</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-light">Query dense vector store for claim matches</p>
                    </button>

                    <button
                      onClick={() => setChatInput("Study claim differentiations for my invention idea")}
                      className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left space-y-1 transition-all group"
                    >
                      <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>REASON & STRATEGY</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-light">Consult AI Patent Strategy Advisor persona</p>
                    </button>

                    <button
                      onClick={() => setChatInput("Explain CPC classification codes G06F and H04L")}
                      className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left space-y-1 transition-all group"
                    >
                      <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold">
                        <Tag className="w-3.5 h-3.5" />
                        <span>STUDY CODES</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-light">Decode IPC/CPC technology classifications</p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 flex-1 overflow-y-auto glass-panel-sleek rounded-2xl p-6 md:p-8 shadow-2xl">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
                    >
                      {/* Role Label */}
                      <div className="flex items-center justify-between gap-2 w-full px-1">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-semibold">
                          {msg.role === 'user' ? (
                            <span className="text-[#22D3EE]">👤 {username}</span>
                          ) : (
                            <span className="text-[#8B5CF6]">🤖 PatentMind AI</span>
                          )}
                        </span>
                        {msg.role === 'assistant' && (
                          <button
                            type="button"
                            onClick={() => handleSpeakText(msg.content)}
                            className="text-[9px] font-mono text-zinc-500 hover:text-white flex items-center gap-1 transition-colors uppercase"
                            title="Read Aloud (Voice Output)"
                          >
                            <Volume2 className="w-3 h-3 text-[#22D3EE]" />
                            <span>LISTEN</span>
                          </button>
                        )}
                      </div>

                      {/* Content Bubble */}
                      <div className={`p-4.5 max-w-[85%] text-xs font-light leading-relaxed font-sans shadow-lg transition-all ${
                        msg.role === 'user' 
                          ? 'bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-white rounded-2xl rounded-tr-sm shadow-[0_0_20px_rgba(124,58,237,0.1)]' 
                          : 'bg-[#18181B]/95 border border-white/10 text-zinc-200 rounded-2xl rounded-tl-sm'
                      }`}>
                        <div className="whitespace-pre-wrap">{msg.content}</div>

                        {/* Perplexity-style citation card deck */}
                        {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-white/10 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-[#00C2FF]" />
                                Sources Cited ({msg.citations.length})
                              </span>
                              <button
                                type="button"
                                onClick={() => setExpandedCitationIndex(expandedCitationIndex === idx ? null : idx)}
                                className="flex items-center gap-1 text-[9px] font-mono text-[#00C2FF] hover:text-white transition-colors uppercase font-semibold"
                              >
                                {expandedCitationIndex === idx ? 'Collapse' : 'Details'}
                                {expandedCitationIndex === idx ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </div>

                            {/* Card Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                              {msg.citations.slice(0, 3).map((c, cIdx) => (
                                <div
                                  key={cIdx}
                                  onClick={() => setExpandedCitationIndex(expandedCitationIndex === idx ? null : idx)}
                                  className="p-3 bg-white/[0.03] border border-white/10 rounded-xl hover:border-[#00C2FF]/40 hover:bg-white/[0.06] transition-all cursor-pointer text-left space-y-1.5"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[9px] font-mono text-[#00C2FF] bg-[#5B7CFA]/15 px-2 py-0.5 rounded border border-[#5B7CFA]/30 truncate max-w-[130px]">
                                      {c.metadata.patent_number}
                                    </span>
                                    <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                      {c.metadata.section}
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-medium text-white truncate">{c.metadata.title}</div>
                                  <div className="flex items-center justify-between text-[9px] text-slate-400">
                                    <span>Match</span>
                                    <span className="font-mono font-bold">{(c.score * 100).toFixed(1)}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Expanded excerpts */}
                            {expandedCitationIndex === idx && (
                              <div className="space-y-2.5 pt-2 border-t border-white/5 fade-in">
                                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Citation Excerpts</span>
                                {msg.citations.map((c, cIdx) => (
                                  <div key={cIdx} className="space-y-1 bg-black/40 p-3 border border-white/5 rounded-lg text-[11px] text-zinc-400">
                                    <div className="flex justify-between font-mono text-[9px] text-zinc-400">
                                      <span className="font-semibold text-[#00C2FF]">{c.metadata.patent_number} ({c.metadata.section})</span>
                                      <span>SIMILARITY: {(c.score * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="text-[11px] font-medium text-white mt-0.5">{c.metadata.title}</div>
                                    <p className="text-[10px] text-zinc-400 italic mt-1.5 border-l-2 border-[#7B61FF] pl-2 leading-relaxed">
                                      "{c.text}"
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Telemetry metadata footer */}
                      {msg.role === 'assistant' && msg.latency && (
                        <div className="text-[8px] font-mono text-zinc-550 flex gap-3 px-1">
                          {msg.active_llm && <span>LLM: {msg.active_llm.toUpperCase()}</span>}
                          <span>LATENCY: {msg.latency}s</span>
                          {msg.active_db && <span>DB: {msg.active_db.toUpperCase()}</span>}
                        </div>
                      )}

                    </div>
                  ))}

                  {/* Typing / Analyzing Indicator */}
                  {chatLoading && (
                    <div className="flex flex-col items-start space-y-1.5 self-start">
                      <span className="text-[9px] font-mono text-[#8B5CF6] uppercase tracking-widest px-1 font-semibold">🤖 PatentMind AI</span>
                      <div className="p-4 bg-[#18181B] border border-[#7C3AED]/30 rounded-2xl text-xs font-mono text-zinc-300 tracking-wider flex items-center gap-3 shadow-lg">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#22D3EE]" />
                        <span>SYNTHESIZING CONTEXT & RUNNING AI ANALYSIS...</span>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* CHATGPT STYLE FLOATING INPUT CONTAINER */}
            <div className="max-w-3xl w-full mx-auto space-y-2">
              
              {/* Attached PDF Badge (if uploading) */}
              {attachedPdfName && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#7C3AED]/20 border border-[#7C3AED]/40 rounded-lg text-xs font-mono text-[#22D3EE] w-fit animate-pulse">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Analyzing: {attachedPdfName}</span>
                </div>
              )}

              {/* Floating Input Box */}
              <form onSubmit={handleChatSend} className="glass-panel-sleek rounded-2xl p-3.5 space-y-3 border border-white/10 shadow-2xl focus-within:border-[#7C3AED]/50 transition-all">
                
                {/* Textarea Input */}
                <textarea
                  rows={2}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSend(e);
                    }
                  }}
                  disabled={chatLoading}
                  placeholder="Ask anything or attach a patent PDF specification..."
                  className="w-full bg-transparent text-xs font-sans tracking-wide focus:outline-none placeholder:text-zinc-500 text-main resize-none border-none p-1"
                />

                {/* Bottom Toolbar inside Input Box */}
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  
                  {/* Left Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Paperclip Button for PDF Upload */}
                    <button
                      type="button"
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={chatLoading}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all text-xs font-mono flex items-center gap-1.5"
                      title="Attach Patent PDF Specification"
                    >
                      <Paperclip className="w-4 h-4 text-zinc-400" />
                    </button>

                    {/* Deep Search Toggle Pill */}
                    <button
                      type="button"
                      onClick={() => setChatModeDeepSearch(!chatModeDeepSearch)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider transition-all flex items-center gap-1.5 border ${
                        chatModeDeepSearch
                          ? 'bg-[#22D3EE]/15 border-[#22D3EE]/40 text-[#22D3EE] font-semibold'
                          : 'bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Deep Search</span>
                    </button>

                    {/* Reason Toggle Pill */}
                    <button
                      type="button"
                      onClick={() => setChatModeReasoning(!chatModeReasoning)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider transition-all flex items-center gap-1.5 border ${
                        chatModeReasoning
                          ? 'bg-[#7C3AED]/20 border-[#7C3AED]/40 text-[#8B5CF6] font-semibold'
                          : 'bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Reason</span>
                    </button>

                    {/* Voice Assist Button */}
                    <button
                      type="button"
                      onClick={() => handleVoiceInput(setChatInput, 'chat')}
                      className={`p-1.5 rounded-lg transition-all ${
                        isListening && activeListeningField === 'chat'
                          ? 'text-red-400 bg-red-950/40 animate-pulse'
                          : 'text-zinc-500 hover:text-white'
                      }`}
                      title="Voice Speech-to-Text"
                    >
                      {isListening && activeListeningField === 'chat' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Right Action: Circle ArrowUp Send Button */}
                  <button
                    type="submit"
                    disabled={chatLoading || (!chatInput.trim() && !attachedPdfFile)}
                    className="w-8 h-8 rounded-full bg-[#7C3AED] hover:bg-[#8B5CF6] disabled:opacity-30 disabled:bg-zinc-800 text-white flex items-center justify-center transition-all shadow-lg flex-shrink-0"
                    title="Send message"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                </div>
              </form>

              {/* Bottom Disclaimer */}
              <div className="text-center">
                <span className="text-[9px] font-mono text-zinc-550">
                  AI can make mistakes. Please double-check responses against official USPTO/WIPO sources.
                </span>
              </div>

            </div>

          </div>
        )}


        {/* IDEA ANALYZER TAB */}
        {activeTab === 'idea' && (
          <div className="flex-1 flex flex-col space-y-6 fade-in h-[calc(100vh-8rem)]">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted font-mono tracking-widest uppercase">07. PATENT STRATEGY</span>
                <h2 className="text-serif-editorial text-4xl text-main tracking-wide mt-2">IDEA ANALYZER</h2>
              </div>
              {ideaStep !== 'upload' && (
                <button
                  onClick={() => {
                    setIdeaStep('upload');
                    setIdeaFile(null);
                    setIdeaAnalysis(null);
                    setIdeaMatchedPatents([]);
                    setIdeaText('');
                    setIdeaChatMessages([]);
                    setIdeaError(null);
                  }}
                  className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 hover:text-white transition-colors uppercase tracking-wider border border-theme px-3 py-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>NEW ANALYSIS</span>
                </button>
              )}
            </div>

            {/* Step Progress Indicator */}
            <div className="flex items-center gap-2 text-[9px] font-mono tracking-wider uppercase">
              <span className={ideaStep === 'upload' ? 'text-main font-semibold' : 'text-zinc-600'}>① UPLOAD</span>
              <span className="text-zinc-700">→</span>
              <span className={ideaStep === 'results' ? 'text-main font-semibold' : 'text-zinc-600'}>② RESULTS</span>
              <span className="text-zinc-700">→</span>
              <span className={ideaStep === 'chat' ? 'text-main font-semibold' : 'text-zinc-600'}>③ IMPROVE</span>
            </div>

            {/* STEP 1: UPLOAD */}
            {ideaStep === 'upload' && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                <div className="text-center space-y-3">
                  <Lightbulb className="w-12 h-12 text-zinc-600 mx-auto" />
                  <h3 className="text-serif-editorial text-xl text-main">UPLOAD YOUR IDEA</h3>
                  <p className="text-xs text-muted font-light max-w-md">
                    Upload a PDF document describing your idea. The system will find the most relevant existing patents to learn from and provide AI-powered improvement suggestions.
                  </p>
                </div>

                <form onSubmit={handleIdeaAnalyze} className="w-full max-w-md space-y-5">
                  <label className="block cursor-pointer">
                    <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 hover:border-zinc-500 ${
                      ideaFile ? 'border-zinc-500 bg-zinc-900/30' : 'border-zinc-800'
                    }`}>
                      {ideaFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-8 h-8 text-zinc-400" />
                          <span className="text-xs font-mono text-main uppercase tracking-wider">{ideaFile.name}</span>
                          <span className="text-[9px] text-zinc-500 font-mono">{(ideaFile.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <UploadCloud className="w-8 h-8 text-zinc-600" />
                          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">DROP PDF OR CLICK TO SELECT</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setIdeaFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={!ideaFile || ideaLoading}
                    className="w-full py-3 btn-theme text-xs font-mono tracking-widest uppercase disabled:opacity-40 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {ideaLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>ANALYZING IDEA AGAINST PATENT DATABASE...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>ANALYZE MY IDEA</span>
                      </>
                    )}
                  </button>
                </form>

                {ideaError && (
                  <div className="p-4 border border-red-900/50 bg-red-950/20 text-xs text-red-400 flex items-center gap-2 max-w-md w-full">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{ideaError}</span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: RESULTS */}
            {ideaStep === 'results' && ideaAnalysis && (
              <div className="flex-1 overflow-y-auto space-y-8">
                
                {/* Matched Patents */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-2">
                    <Database className="w-3.5 h-3.5" />
                    MATCHED PATENTS ({ideaMatchedPatents.length})
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ideaMatchedPatents.map((patent, idx) => (
                      <div key={idx} className="panel-card p-5 space-y-3 border border-theme hover:border-zinc-600 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 tracking-wider">{patent.patent_number}</span>
                            <h4 className="text-sm font-medium text-main mt-0.5 leading-snug">{patent.title}</h4>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border rounded ${
                            patent.avg_score > 0.7 ? 'text-emerald-400 border-emerald-800' :
                            patent.avg_score > 0.4 ? 'text-amber-400 border-amber-800' :
                            'text-zinc-400 border-zinc-700'
                          }`}>
                            {(patent.avg_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        {/* Score bar */}
                        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(patent.avg_score * 100, 100)}%` }}
                          />
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {patent.sections.map((sec, sIdx) => (
                            <span key={sIdx} className="text-[8px] font-mono bg-zinc-800/60 border border-zinc-750 text-zinc-400 px-1.5 py-0.5 uppercase tracking-wider">
                              {sec}
                            </span>
                          ))}
                        </div>

                        <p className="text-[11px] text-zinc-500 italic leading-relaxed border-l-2 border-zinc-800 pl-3">
                          "{patent.excerpt}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI STRATEGY ANALYSIS
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleSpeakText(ideaAnalysis.ai_analysis)}
                      className={`flex items-center gap-1.5 text-[9px] font-mono border px-2.5 py-1 rounded transition-colors uppercase ${
                        isSpeaking ? 'border-amber-800 text-amber-400 bg-amber-950/20' : 'border-theme text-zinc-400 hover:text-white'
                      }`}
                      title="Voice Narration (Text-to-Speech)"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeaking ? 'STOP AUDIO' : 'LISTEN STRATEGY'}</span>
                    </button>
                  </div>
                  <div className="panel-card p-6 border border-theme">
                    <div className="text-sm text-zinc-300 font-light leading-relaxed whitespace-pre-wrap">
                      {ideaAnalysis.ai_analysis}
                    </div>
                    <div className="mt-4 pt-3 border-t border-theme flex gap-4 text-[8px] font-mono text-zinc-650">
                      <span>LLM: {ideaAnalysis.active_llm?.toUpperCase()}</span>
                      <span>LATENCY: {ideaAnalysis.latency_sec}s</span>
                    </div>
                  </div>
                </div>

                {/* Proceed to Chat */}
                <div className="text-center py-4">
                  <button
                    onClick={() => setIdeaStep('chat')}
                    className="btn-theme px-8 py-3 text-xs font-mono tracking-widest uppercase flex items-center gap-2 mx-auto"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>ASK QUESTIONS TO IMPROVE</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CHAT TO IMPROVE */}
            {ideaStep === 'chat' && (
              <div className="flex-1 flex flex-col space-y-4">
                <div className="flex-1 overflow-y-auto panel-card p-6 md:p-8 space-y-6 bg-black/15 flex flex-col border border-theme">
                  
                  {ideaChatMessages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <Lightbulb className="w-10 h-10 text-zinc-650" />
                      <div className="space-y-2">
                        <h3 className="text-serif-editorial text-lg text-main">IMPROVE YOUR IDEA</h3>
                        <p className="text-xs text-muted max-w-sm font-light">
                          Ask questions about how to differentiate from existing patents, strengthen your claims, or improve your approach. The AI has context of your idea and all matched patents.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 flex-1">
                      {ideaChatMessages.map((msg, idx) => (
                        <div 
                          key={idx} 
                          className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
                        >
                          <div className="flex items-center justify-between gap-2 w-full px-1">
                             <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest flex items-center gap-1">
                               {msg.role === 'user' ? `👤 ${username}` : '  STRATEGY ADVISOR'}
                             </span>
                            {msg.role === 'assistant' && (
                              <button
                                type="button"
                                onClick={() => handleSpeakText(msg.content)}
                                className="text-[9px] font-mono text-zinc-500 hover:text-white flex items-center gap-1 transition-colors uppercase"
                                title="Read Aloud (Voice Output)"
                              >
                                <Volume2 className="w-3 h-3" />
                                <span>LISTEN</span>
                              </button>
                            )}
                          </div>
                          <div className={`p-4 max-w-[85%] text-xs font-light leading-relaxed font-sans border ${
                            msg.role === 'user' 
                              ? 'bg-zinc-800/40 border-zinc-700/60 text-zinc-200 rounded-bl-lg rounded-tl-lg rounded-tr-lg' 
                              : 'bg-black/30 border-theme text-muted rounded-br-lg rounded-tl-lg rounded-tr-lg'
                          }`}>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          </div>
                          {msg.role === 'assistant' && msg.latency && (
                            <div className="text-[8px] font-mono text-zinc-650 flex gap-3 px-1">
                              <span>LLM: {msg.active_llm?.toUpperCase()}</span>
                              <span>LATENCY: {msg.latency}s</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {ideaChatLoading && (
                    <div className="flex flex-col items-start space-y-1.5 self-start">
                      <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest px-1">STRATEGY ADVISOR</span>
                      <div className="p-4 bg-black/25 border border-theme text-xs font-mono text-zinc-500 tracking-wider flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-600" />
                        <span>ANALYZING PATENT LANDSCAPE FOR YOUR IDEA...</span>
                      </div>
                    </div>
                  )}

                  <div ref={ideaChatEndRef} />
                </div>

                {/* Input bar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">
                      CONTEXT: {ideaMatchedPatents.length} PATENTS LOADED
                    </span>
                    {ideaChatMessages.length > 0 && (
                      <button
                        onClick={() => setIdeaChatMessages([])}
                        className="flex items-center gap-1 text-[9px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors uppercase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>RESET</span>
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleIdeaChatSend} className="relative flex items-center border-b border-theme focus-within:border-zinc-550 transition-colors py-2 bg-black/5 pr-4 pl-2">
                    <input
                      type="text"
                      value={ideaChatInput}
                      onChange={(e) => setIdeaChatInput(e.target.value)}
                      disabled={ideaChatLoading}
                      placeholder="HOW CAN I DIFFERENTIATE MY IDEA? WHAT CLAIMS SHOULD I FOCUS ON?"
                      className="w-full bg-transparent py-2 px-3 text-xs uppercase font-mono tracking-wider focus:outline-none placeholder:text-zinc-700 text-main disabled:opacity-40"
                    />
                    <button
                      type="button"
                      onClick={() => handleVoiceInput(setIdeaChatInput, 'idea')}
                      className={`p-2 transition-all mr-1.5 ${
                        isListening && activeListeningField === 'idea'
                          ? 'text-red-400 bg-red-950/40 animate-pulse rounded'
                          : 'text-zinc-500 hover:text-white'
                      }`}
                      title="Voice Input (Speech-to-Text)"
                    >
                      {isListening && activeListeningField === 'idea' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="submit"
                      disabled={ideaChatLoading || !ideaChatInput.trim()}
                      className="p-2 border border-theme hover:border-zinc-550 text-zinc-500 hover:text-main transition-all disabled:opacity-30 flex-shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* HELP & FEEDBACK TAB (OFFICIAL BRAND LOGOS + SURVEY CARD) */}
        {activeTab === 'help' && (
          <div className="space-y-8 fade-in max-w-4xl">
            <div>
              <span className="text-[10px] text-muted font-mono tracking-widest uppercase">08. SUPPORT & FEEDBACK</span>
              <h2 className="text-4xl font-semibold tracking-tight text-main font-sans mt-1">Help & Feedback</h2>
              <p className="text-xs text-zinc-400 font-light mt-1">Connect directly with our engineering team or submit your platform survey evaluation.</p>
            </div>

            {/* SECTION 1: DIRECT CONTACT CHANNELS (OFFICIAL BRAND SVG LOGOS) */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono tracking-widest text-zinc-400 uppercase flex items-center gap-2 pb-2 border-b border-white/10">
                <HelpCircle className="w-4 h-4 text-[#22D3EE]" />
                DIRECT CONTACT CHANNELS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
                
                {/* Official WhatsApp Support Card */}
                <div className="glass-panel-sleek p-5 border border-emerald-500/30 bg-emerald-950/20 space-y-4 rounded-2xl shadow-xl hover:border-emerald-400/60 transition-all group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 fill-current text-[#25D366]" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.279.444-1.034 3.774 3.861-1.013.437.262z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-sans">WhatsApp</h4>
                        <span className="text-[10px] text-zinc-400 font-mono">24/7 Tech Support</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase font-semibold">
                      ONLINE
                    </span>
                  </div>

                  <p className="text-xs font-sans text-zinc-300 font-light">
                    Direct developer hotline: <strong className="text-white font-mono">+91 9359082546</strong>
                  </p>

                  <a
                    href="https://wa.me/919359082546"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold rounded-xl text-xs font-sans tracking-wide uppercase transition-all shadow-lg"
                  >
                    <span>Open WhatsApp Chat</span>
                  </a>
                </div>

                {/* Official Instagram Profile Card */}
                <div className="glass-panel-sleek p-5 border border-pink-500/30 bg-pink-950/20 space-y-4 rounded-2xl shadow-xl hover:border-pink-400/60 transition-all group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 fill-current text-[#E4405F]" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-sans">Instagram</h4>
                        <span className="text-[10px] text-zinc-400 font-mono">Official Handle</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono bg-pink-500/20 text-pink-400 px-2.5 py-0.5 rounded-full border border-pink-500/30 uppercase font-semibold">
                      OFFICIAL
                    </span>
                  </div>

                  <p className="text-xs font-sans text-zinc-300 font-light">
                    Lead Dev: <strong className="text-white font-mono">@patil.bhushan1</strong>
                  </p>

                  <a
                    href="https://instagram.com/patil.bhushan1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white font-bold rounded-xl text-xs font-sans tracking-wide uppercase transition-all shadow-lg"
                  >
                    <span>Visit Instagram</span>
                  </a>
                </div>

              </div>
            </div>

            {/* SECTION 2: ONBOARDING EXPERIENCE & RATING SURVEY CARD (IMAGE 2 DESIGN) */}
            <div className="glass-panel-sleek p-7 space-y-6 border border-white/10 max-w-2xl rounded-2xl shadow-2xl">
              
              {/* Card Illustration Header */}
              <div className="p-6 bg-white/5 border border-white/5 rounded-xl text-center space-y-3">
                <div className="flex justify-center gap-4 text-3xl">
                  <span className="cursor-pointer hover:scale-125 transition-transform" onClick={() => setFeedbackRating(5)}>😁</span>
                  <span className="cursor-pointer hover:scale-125 transition-transform" onClick={() => setFeedbackRating(4)}>😊</span>
                  <span className="cursor-pointer hover:scale-125 transition-transform" onClick={() => setFeedbackRating(3)}>😐</span>
                  <span className="cursor-pointer hover:scale-125 transition-transform" onClick={() => setFeedbackRating(2)}>🙁</span>
                  <span className="cursor-pointer hover:scale-125 transition-transform" onClick={() => setFeedbackRating(1)}>😡</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-sans">Onboarding & Platform Experience Survey</h3>
                  <p className="text-xs text-zinc-400 font-light mt-1">Evaluate the effectiveness of your AI patent search and onboarding experience.</p>
                </div>
                <div className="flex justify-center gap-2 pt-1">
                  <span className="text-[10px] font-mono bg-white/10 text-zinc-300 px-3 py-1 rounded-full border border-white/5">User Experience</span>
                  <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full border border-rose-500/30 font-semibold">❤️ Popular</span>
                </div>
              </div>

              {feedbackResult && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs font-mono rounded">
                  {feedbackResult}
                </div>
              )}

              {feedbackError && (
                <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs font-mono rounded">
                  {feedbackError}
                </div>
              )}

              <form onSubmit={handleSendFeedback} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-mono text-zinc-400 uppercase tracking-wider block">RATING</label>
                  <div className="flex gap-2 items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className={`text-xl transition-transform hover:scale-125 focus:outline-none p-0.5 ${
                          star <= feedbackRating ? 'opacity-100 scale-110' : 'opacity-30 grayscale'
                        }`}
                        title={`${star} Star${star > 1 ? 's' : ''}`}
                      >
                        ⭐
                      </button>
                    ))}
                    <span className="text-xs font-mono text-amber-400 font-semibold ml-2">
                      ({feedbackRating} / 5)
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-mono text-zinc-400 uppercase tracking-wider block">FEEDBACK / COMMENTS</label>
                  <textarea
                    rows={3}
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    placeholder="WRITE YOUR FEEDBACK HERE..."
                    required
                    className="w-full bg-black/40 border border-zinc-800 focus:border-zinc-500 p-2.5 text-xs font-mono tracking-wider focus:outline-none text-main placeholder:text-zinc-700 uppercase rounded"
                  />
                </div>

                <button
                  type="submit"
                  disabled={feedbackLoading || !feedbackComments.trim()}
                  className="w-full py-2.5 btn-theme text-xs font-mono tracking-widest uppercase disabled:opacity-40"
                >
                  {feedbackLoading ? 'SUBMITTING...' : 'SUBMIT FEEDBACK'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* PLATFORM SETTINGS TAB (3 OPTIONS ONLY) */}
        {activeTab === 'settings' && (
          <div className="space-y-6 fade-in max-w-2xl">
            <div>
              <span className="text-[10px] text-muted font-mono tracking-widest uppercase">09. SYSTEM PREFERENCES</span>
              <h2 className="text-serif-editorial text-3xl text-main tracking-wide mt-1">SETTINGS</h2>
            </div>

            {settingsSavedMsg && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs font-mono rounded flex justify-between items-center">
                <span>{settingsSavedMsg}</span>
                <button onClick={() => setSettingsSavedMsg('')} className="text-zinc-500 hover:text-white text-xs font-bold"></button>
              </div>
            )}

            {/* OPTION 1: LANGUAGE SELECTION */}
            <div className="panel-card p-5 space-y-4 border-theme rounded">
              <div className="flex justify-between items-center pb-2 border-b border-theme">
                <h3 className="text-xs font-mono tracking-widest text-main uppercase flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  1. LANGUAGE SELECTION
                </h3>
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider">ACTIVE: {selectedLanguage.toUpperCase()}</span>
              </div>

              <div className="space-y-3">
                <label className="text-[9.5px] font-mono text-zinc-400 uppercase tracking-wider block">CHOOSE PREFERRED LANGUAGE</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.keys(languageCodes).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setSettingsSavedMsg(`Platform language changed to ${lang}`);
                      }}
                      className={`py-2 px-3 text-xs font-mono border rounded transition-all flex items-center justify-between ${
                        selectedLanguage === lang
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-semibold shadow-sm'
                          : 'bg-black/30 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <span>{lang.toUpperCase()}</span>
                      {selectedLanguage === lang && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SUBSCRIPTION & PRICING PLANS (IMAGE 2 REFERENCE DESIGN) */}
            <div className="space-y-8 pt-4">
              <div className="text-center space-y-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">ENTERPRISE SCALE & PLANS</span>
                <h2 className="text-3xl font-semibold tracking-tight text-main font-sans">Find the right plan for your needs.</h2>
              </div>

              {/* Brand Logo Ticker */}
              <div className="flex flex-wrap items-center justify-center gap-8 py-3 text-zinc-500 font-mono text-xs opacity-75 uppercase tracking-wider border-y border-white/5">
                <span className="font-bold tracking-widest text-zinc-400">DOORDASH</span>
                <span>Airtable</span>
                <span className="font-semibold text-zinc-300">OpenAI</span>
                <span>ServiceTitan</span>
                <span className="italic">Lemonade</span>
              </div>

              {/* 3 Pricing Plan Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. ESSENTIALS */}
                <div className="panel-card p-7 space-y-6 bg-white/5 border border-white/10 hover:border-orange-500/50 rounded-xl transition-all shadow-xl">
                  <div>
                    <h3 className="text-xl font-bold text-main">Essentials</h3>
                    <p className="text-[11px] text-zinc-400 mt-1 font-light">For startups and growing companies</p>
                  </div>
                  <div className="py-2">
                    <span className="text-3xl font-bold text-main">$0</span>
                    <span className="text-xs text-zinc-400 font-light"> user/month</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("You are currently using the Essentials Free Tier.")}
                    className="w-full py-3 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs tracking-wider uppercase rounded-lg transition-all shadow-md"
                  >
                    Try Free Plan
                  </button>
                  <ul className="space-y-3 text-xs text-zinc-300 font-light pt-2 border-t border-white/5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Global USPTO & Google Patents search access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>AI-powered custom search rules</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Up to 10 document OCR extractions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>SQLite fallback local vector store</span>
                    </li>
                  </ul>
                </div>

                {/* 2. PREMIUM */}
                <div className="panel-card p-7 space-y-6 bg-purple-950/20 border border-[#7C3AED]/50 hover:border-orange-500/70 rounded-xl transition-all shadow-2xl relative">
                  <span className="absolute -top-3 right-6 bg-[#7C3AED] text-white text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">POPULAR</span>
                  <div>
                    <h3 className="text-xl font-bold text-main">Premium</h3>
                    <p className="text-[11px] text-zinc-400 mt-1 font-light">For mid-sized companies looking to scale</p>
                  </div>
                  <div className="py-2">
                    <span className="text-3xl font-bold text-main">$12</span>
                    <span className="text-xs text-zinc-400 font-light"> user/month</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("Redirecting to Premium Plan Checkout...")}
                    className="w-full py-3 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs tracking-wider uppercase rounded-lg transition-all shadow-md"
                  >
                    Open Premium Account
                  </button>
                  <ul className="space-y-3 text-xs text-zinc-300 font-light pt-2 border-t border-white/5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#22D3EE] flex-shrink-0 mt-0.5" />
                      <span>Everything in Essentials, plus:</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#22D3EE] flex-shrink-0 mt-0.5" />
                      <span>Unlimited Groq & Ollama dual-LLM queries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#22D3EE] flex-shrink-0 mt-0.5" />
                      <span>Dynamic RAG review chains & citations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#22D3EE] flex-shrink-0 mt-0.5" />
                      <span>AI compliance & prior-art study graphs</span>
                    </li>
                  </ul>
                </div>

                {/* 3. ENTERPRISE */}
                <div className="panel-card p-7 space-y-6 bg-white/5 border border-white/10 hover:border-orange-500/50 rounded-xl transition-all shadow-xl">
                  <div>
                    <h3 className="text-xl font-bold text-main">Enterprise</h3>
                    <p className="text-[11px] text-zinc-400 mt-1 font-light">For global enterprises with custom needs</p>
                  </div>
                  <div className="py-2">
                    <span className="text-3xl font-bold text-main">Custom</span>
                    <span className="text-xs text-zinc-400 font-light"> pricing</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("Sales Inquiry Dispatched. An Enterprise advisor will email you shortly.")}
                    className="w-full py-3 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs tracking-wider uppercase rounded-lg transition-all shadow-md"
                  >
                    Contact Sales
                  </button>
                  <ul className="space-y-3 text-xs text-zinc-300 font-light pt-2 border-t border-white/5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Everything in Premium, plus:</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Unlimited US & Global database entities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Dedicated MySQL & S3 cloud database cluster</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Named Account Manager & 24/7 priority SLA</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>

            {/* OPTION 2: CHANGE PASSWORD */}
            <div className="panel-card p-5 space-y-4 border-theme rounded">
              <div className="flex justify-between items-center pb-2 border-b border-theme">
                <h3 className="text-xs font-mono tracking-widest text-main uppercase flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  2. CHANGE PASSWORD
                </h3>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">SECURITY</span>
              </div>

              {changePasswordMsg && (
                <div className={`p-3 text-xs font-mono rounded ${changePasswordMsg.startsWith('SUCCESS') ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300' : 'bg-red-950/40 border border-red-800 text-red-300'}`}>
                  {changePasswordMsg}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono text-zinc-400 uppercase tracking-wider block">CURRENT PASSWORD</label>
                    <input
                      type="password"
                      required
                      value={changePasswordForm.old_password}
                      onChange={(e) => setChangePasswordForm(prev => ({ ...prev, old_password: e.target.value }))}
                      placeholder="ENTER CURRENT PASSWORD"
                      className="w-full bg-black/40 border border-zinc-800 focus:border-zinc-500 p-2.5 text-xs font-mono tracking-wider focus:outline-none text-main rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono text-zinc-400 uppercase tracking-wider block">NEW PASSWORD</label>
                    <input
                      type="password"
                      required
                      value={changePasswordForm.new_password}
                      onChange={(e) => setChangePasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                      placeholder="ENTER NEW PASSWORD"
                      className="w-full bg-black/40 border border-zinc-800 focus:border-zinc-500 p-2.5 text-xs font-mono tracking-wider focus:outline-none text-main rounded"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={changePasswordLoading || !changePasswordForm.old_password || !changePasswordForm.new_password}
                  className="w-full py-2.5 btn-theme text-xs font-mono tracking-widest uppercase disabled:opacity-40"
                >
                  {changePasswordLoading ? 'UPDATING PASSWORD...' : 'UPDATE PASSWORD'}
                </button>
              </form>
            </div>

            {/* OPTION 3: LOG OUT ACCOUNT */}
            <div className="panel-card p-5 space-y-3 border-red-900/40 bg-red-950/10 rounded">
              <div className="flex justify-between items-center pb-2 border-b border-red-900/30">
                <h3 className="text-xs font-mono tracking-widest text-red-400 uppercase flex items-center gap-2">
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  3. LOG OUT ACCOUNT
                </h3>
                <span className="text-[9px] font-mono text-red-400 uppercase tracking-wider">SESSION</span>
              </div>

              <p className="text-[11px] font-mono text-zinc-300">
                Terminate active session for account <strong>{username}</strong> safely.
              </p>

              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="w-full py-2.5 bg-red-600/30 hover:bg-red-600/40 text-red-200 border border-red-500/50 rounded text-xs font-mono tracking-widest uppercase transition-all"
              >
                LOG OUT ACCOUNT
              </button>
            </div>
          </div>
        )}

        {/* ADMIN CONTROL TAB (SYSTEM CONSOLE) */}
        {activeTab === 'admin' && (
          <div className="space-y-12 fade-in">
            <div>
              <span className="text-[11px] text-muted font-mono tracking-widest uppercase">08. ADMINISTRATIVE CONTROLS</span>
              <h2 className="text-serif-editorial text-4xl text-main tracking-wide mt-2">SYSTEM CONSOLE</h2>
            </div>

            {/* Diagnostics Stats Telemetry Banner */}
            {adminDiagnostics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Active Engine", value: adminDiagnostics.database_type, desc: "Primary relational database routing layer" },
                  { label: "Registered Accounts", value: `${adminDiagnostics.registered_users_count} Active`, desc: "Total user records verified in auth tables" },
                  { label: "Indexed Patents", value: `${adminDiagnostics.indexed_patents_count} Records`, desc: "Indexed metadata references seeded in database" }
                ].map((stat, idx) => (
                  <div key={idx} className="panel-card p-5 space-y-2 border border-white/5">
                    <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest block">{stat.label}</span>
                    <h4 className="text-lg font-mono text-[#22D3EE] font-bold">{stat.value}</h4>
                    <p className="text-[9px] font-mono text-zinc-650 uppercase">{stat.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Export Metadata Download Section */}
            <div className="panel-card p-6 rounded-none space-y-4 border border-white/5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-mono tracking-wider text-main uppercase flex items-center gap-2">
                    <Database className="w-4 h-4 text-zinc-500" />
                    EXPORT APPLICATION METADATA
                  </h3>
                  <p className="text-[9px] font-mono text-zinc-550 mt-1 uppercase">Download all users, patents, query logs, and feedback records from the active database.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const response = await authenticatedFetch('/api/v1/admin/export-metadata?format=json');
                      if (response && response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `patentmind_export_${Date.now()}.json`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                      } else {
                        alert('Export failed. Please try again.');
                      }
                    } catch (err) {
                      console.error('Export error:', err);
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED]/15 hover:bg-[#7C3AED]/25 text-[#8B5CF6] border border-[#7C3AED]/30 rounded text-[10px] font-mono tracking-widest uppercase transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  DOWNLOAD JSON
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const response = await authenticatedFetch('/api/v1/admin/export-metadata?format=csv');
                      if (response && response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `patentmind_export_${Date.now()}.csv`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                      } else {
                        alert('Export failed. Please try again.');
                      }
                    } catch (err) {
                      console.error('Export error:', err);
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#22D3EE]/10 hover:bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/30 rounded text-[10px] font-mono tracking-widest uppercase transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  DOWNLOAD CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Reset Password Form */}
              <div className="md:col-span-2 panel-card p-8 rounded-none space-y-6">
                <h3 className="text-xs font-mono tracking-wider text-main uppercase flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-zinc-500" />
                  RESET USER PASSWORD
                </h3>

                <form onSubmit={handleResetSubmit} className="space-y-6">
                  
                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1">
                    <label className="text-zinc-550 text-[10px] font-mono tracking-wider block mb-1">SELECT REGISTERED USER</label>
                    <select
                      value={resetForm.target_username}
                      onChange={(e) => setResetForm({ ...resetForm, target_username: e.target.value })}
                      required
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none text-main uppercase border-none py-1"
                    >
                      <option value="" className="bg-[#0c0c0e]">-- SELECT USER --</option>
                      {(adminUsers || []).map((u, idx) => {
                        const val = typeof u === 'object' ? (u?.username || '') : String(u || '');
                        return (
                          <option key={idx} value={val} className="bg-[#0c0c0e]">
                            {val.toUpperCase()}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1">
                    <label className="text-zinc-550 text-[10px] font-mono tracking-wider block mb-1">OR ENTER USERNAME MANUALLY</label>
                    <input
                      type="text"
                      value={resetForm.target_username}
                      onChange={(e) => setResetForm({ ...resetForm, target_username: e.target.value })}
                      placeholder="ENTER USERNAME"
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-800 text-main uppercase"
                    />
                  </div>

                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1">
                    <label className="text-zinc-555 text-[10px] font-mono tracking-wider block mb-1">NEW SECURE PASSWORD</label>
                    <input
                      type="text"
                      value={resetForm.new_password}
                      onChange={(e) => setResetForm({ ...resetForm, new_password: e.target.value })}
                      placeholder="ENTER NEW PASSWORD"
                      required
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-800 text-main"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3.5 btn-theme text-xs font-mono tracking-widest uppercase disabled:opacity-40"
                  >
                    {resetLoading ? 'UPDATING DB RECORDS...' : 'RESET PASSWORD'}
                  </button>
                </form>

                {resetError && (
                  <div className="p-4 border border-zinc-800 bg-black/10 text-xs text-red-300 font-light flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                {resetResult && (
                  <div className="p-4 border border-theme bg-black/10 text-xs font-light text-zinc-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-zinc-450 flex-shrink-0" />
                    <span>{resetResult.message}</span>
                  </div>
                )}
              </div>

              {/* Registered Users Listing with Email Credentials Action */}
              <div className="panel-card p-6 rounded-none space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-theme">
                  <h4 className="text-xs font-mono tracking-wider text-zinc-500 uppercase">SYSTEM USERS</h4>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={fetchAdminDiagnostics}
                      className="text-zinc-500 hover:text-white transition-colors"
                      title="Refresh statistics"
                    >
                      <Activity className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={fetchAdminUsers}
                      className="text-zinc-500 hover:text-white transition-colors"
                      title="Refresh list"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-theme text-xs font-mono">
                  {(adminUsersDetailed || []).length > 0 ? (
                    adminUsersDetailed.map((u, uIdx) => {
                      const uname = typeof u === 'string' ? u : (u?.username || '');
                      const uemail = typeof u === 'object' ? u?.email : '';
                      return (
                        <div key={uIdx} className="py-2.5 flex justify-between items-center group">
                          <div className="flex flex-col">
                            <span className="text-main uppercase font-semibold">{uname || 'USER'}</span>
                            <span className="text-[9px] text-zinc-500">{uemail || 'NO GMAIL REGISTERED'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {uname.toLowerCase() !== 'bhushan' && uemail && (
                              <button
                                onClick={() => handleSendCredentialsEmail(uname)}
                                className="text-zinc-500 hover:text-[#22D3EE] transition-colors p-1"
                                title={`Send account credentials to ${uemail}`}
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {uname.toLowerCase() !== 'bhushan' && (
                              <button
                                onClick={() => handleUserDelete(uname)}
                                className="text-zinc-650 hover:text-red-500 transition-colors p-1"
                                title={`Delete user account ${uname}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-4 text-zinc-655 italic font-light">No users found.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Bulk Password Reset & Custom Gmail Message Dispatcher */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Bulk Reset All Passwords Form */}
              <div className="panel-card p-8 rounded-none space-y-6">
                <h3 className="text-xs font-mono tracking-wider text-main uppercase flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-purple-400" />
                  BULK RESET ALL PASSWORDS
                </h3>
                <p className="text-[10px] font-mono text-zinc-400 uppercase">Change passwords for ALL non-admin users in one single click.</p>

                <form onSubmit={handleBulkResetSubmit} className="space-y-6">
                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1">
                    <label className="text-zinc-550 text-[10px] font-mono tracking-wider block mb-1">NEW MASTER PASSWORD FOR ALL USERS</label>
                    <input
                      type="text"
                      value={bulkResetForm.new_password}
                      onChange={(e) => setBulkResetForm({ ...bulkResetForm, new_password: e.target.value })}
                      placeholder="ENTER MASTER PASSWORD"
                      required
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-800 text-main"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bulkResetForm.send_email}
                      onChange={(e) => setBulkResetForm({ ...bulkResetForm, send_email: e.target.checked })}
                      className="w-3.5 h-3.5 accent-purple-600 rounded"
                    />
                    <span>SEND NEW PASSWORD TO USERS VIA GMAIL</span>
                  </label>

                  <button
                    type="submit"
                    disabled={bulkResetLoading}
                    className="w-full py-3.5 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/50 text-purple-200 text-xs font-mono tracking-widest uppercase transition-all disabled:opacity-40"
                  >
                    {bulkResetLoading ? 'EXECUTING BULK RESET...' : 'RESET ALL PASSWORDS'}
                  </button>
                </form>
              </div>

              {/* Custom Gmail Dispatcher */}
              <div className="panel-card p-8 rounded-none space-y-6">
                <h3 className="text-xs font-mono tracking-wider text-main uppercase flex items-center gap-2">
                  <Send className="w-4 h-4 text-cyan-400" />
                  DISPATCH CUSTOM GMAIL MESSAGE
                </h3>
                <p className="text-[10px] font-mono text-zinc-400 uppercase">Send a direct custom Gmail message to any registered user.</p>

                <form onSubmit={handleCustomEmailSubmit} className="space-y-4">
                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1">
                    <label className="text-zinc-550 text-[10px] font-mono tracking-wider block mb-1">RECIPIENT USERNAME OR GMAIL</label>
                    <input
                      type="text"
                      value={customEmailForm.target_username}
                      onChange={(e) => setCustomEmailForm({ ...customEmailForm, target_username: e.target.value })}
                      placeholder="USERNAME OR EMAIL@GMAIL.COM"
                      required
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-800 text-main"
                    />
                  </div>

                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1">
                    <label className="text-zinc-550 text-[10px] font-mono tracking-wider block mb-1">EMAIL SUBJECT</label>
                    <input
                      type="text"
                      value={customEmailForm.subject}
                      onChange={(e) => setCustomEmailForm({ ...customEmailForm, subject: e.target.value })}
                      placeholder="ENTER SUBJECT"
                      required
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-800 text-main"
                    />
                  </div>

                  <div className="border-b border-theme focus-within:border-zinc-500 transition-colors py-1">
                    <label className="text-zinc-550 text-[10px] font-mono tracking-wider block mb-1">MESSAGE BODY</label>
                    <textarea
                      rows={3}
                      value={customEmailForm.body}
                      onChange={(e) => setCustomEmailForm({ ...customEmailForm, body: e.target.value })}
                      placeholder="WRITE YOUR MESSAGE..."
                      required
                      className="w-full bg-transparent text-xs font-mono tracking-wider focus:outline-none placeholder:text-zinc-800 text-main resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={customEmailLoading}
                    className="w-full py-3.5 bg-cyan-950/40 hover:bg-cyan-950/60 border border-cyan-500/50 text-cyan-200 text-xs font-mono tracking-widest uppercase transition-all disabled:opacity-40"
                  >
                    {customEmailLoading ? 'SENDING GMAIL...' : 'DISPATCH GMAIL MESSAGE'}
                  </button>
                </form>
              </div>

            </div>

            {/* User Feedback Log Table */}
            <div className="panel-card p-6 rounded-none space-y-4 border border-white/5">
              <div className="flex justify-between items-center pb-2 border-b border-theme">
                <h4 className="text-xs font-mono tracking-wider text-main uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  SUBMITTED USER FEEDBACK & RATINGS
                </h4>
                <button
                  onClick={fetchAdminFeedback}
                  className="text-zinc-500 hover:text-white transition-colors"
                  title="Refresh feedback list"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-theme text-xs font-mono">
                {(adminFeedback || []).length > 0 ? (
                  adminFeedback.map((item, itemIdx) => {
                    const ratingNum = Math.min(Math.max(Number(item?.rating) || 5, 1), 5);
                    return (
                      <div key={item?.id || itemIdx} className="py-3 space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-zinc-400">
                          <span className="font-semibold text-main uppercase">{item?.username || 'ANONYMOUS'}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-bold">
                              {"★".repeat(ratingNum)}{"☆".repeat(5 - ratingNum)} ({ratingNum}/5)
                            </span>
                            <span className="text-zinc-600">{item?.created_at || ''}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-zinc-300 font-light leading-relaxed">"{item?.comments || ''}"</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-4 text-zinc-600 italic font-light">No user feedback logged yet.</div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Developer Credit Footer */}
        <footer className="mt-auto pt-16 border-t border-theme/35 flex flex-col md:flex-row items-center justify-between gap-4 pb-8 w-full">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">PatentMind System v2.1.0 Cloud</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 hover:text-white transition-colors duration-200 text-right uppercase tracking-wider">
            Developer: <span className="text-main font-semibold">Bhushan</span> // Contact: <span className="text-main font-semibold">+91 93590 83546</span>
          </div>
        </footer>

      
        {/* PAGE 7: PATENT DETAILS */}
        {activeTab === 'patent-details' && (
          <PatentDetailsView 
            patentNumber={selectedPatentNumber} 
            onBack={() => setActiveTab('search')}
            onCompare={(num) => { setComparePatentB(num); setActiveTab('compare'); }}
          />
        )}

        {/* PAGE 8: PATENT COMPARISON */}
        {activeTab === 'compare' && (
          <PatentComparisonView 
            defaultPatentA={selectedPatentNumber}
            defaultPatentB={comparePatentB}
          />
        )}

        {/* PAGE 11: KNOWLEDGE GRAPH */}
        {activeTab === 'knowledge-graph' && (
          <KnowledgeGraphView 
            onSelectPatent={(num) => { setSelectedPatentNumber(num); setActiveTab('patent-details'); }}
          />
        )}

        {/* PAGE 13: SAVED PATENTS */}
        {activeTab === 'saved-patents' && (
          <SavedPatentsView 
            onSelectPatent={(num) => { setSelectedPatentNumber(num); setActiveTab('patent-details'); }}
          />
        )}

        {/* PAGE 14: PROJECTS */}
        {activeTab === 'projects' && (
          <ProjectsView />
        )}

        {/* PAGE 15: TEAM WORKSPACE */}
        {activeTab === 'team' && (
          <TeamWorkspaceView />
        )}

        {/* PAGE 16: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <NotificationsView />
        )}

        {/* PAGE 17: USER PROFILE */}
        {activeTab === 'profile' && (
          <UserProfileView username={username} />
        )}

        {/* PAGE 19: API KEYS */}
        {activeTab === 'api-keys' && (
          <ApiKeysView />
        )}

        {/* PAGE 20: BILLING */}
        {activeTab === 'billing' && (
          <BillingView />
        )}

        {/* PAGE 21: HELP CENTER */}
        {activeTab === 'help' && (
          <HelpCenterView />
        )}

        {/* PAGE 22: CONTACT */}
        {activeTab === 'contact' && (
          <ContactView />
        )}

        {/* PAGE 23: PRIVACY POLICY */}
        {activeTab === 'privacy' && (
          <PrivacyPolicyView />
        )}

        {/* PAGE 24: TERMS OF SERVICE */}
        {activeTab === 'terms' && (
          <TermsOfServiceView />
        )}

        {/* PAGE 25: 404 PAGE */}
        {activeTab === '404' && (
          <NotFoundView onNavigateHome={() => setActiveTab('search')} />
        )}

      </main>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md fade-in">
          <div className="panel-card p-7 max-w-md w-full border-red-900/60 bg-[#0c0c0e] space-y-6 shadow-2xl rounded">
            <div className="flex items-center gap-3 border-b border-red-900/40 pb-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-mono tracking-widest text-main font-semibold uppercase">LOG OUT CONFIRMATION</h3>
            </div>

            <p className="text-xs font-mono text-zinc-300 leading-relaxed">
              Are you sure you want to log out of your PatentMind AI session, <strong>{username}</strong>?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 text-xs font-mono tracking-wider uppercase rounded transition-all"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-mono tracking-wider font-semibold uppercase rounded transition-all shadow-md"
              >
                CONFIRM LOG OUT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 space-y-6 font-sans">
          <div className="max-w-md w-full bg-[#141417] border border-cyan-500/40 p-6 rounded-2xl shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto text-xl font-bold">
              
            </div>
            <h2 className="text-lg font-mono text-[#22D3EE] font-semibold uppercase">SYSTEM RECOVERY INTERFACE</h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-mono">
              {this.state.error?.message || "An isolated UI state anomaly was intercepted."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = window.location.pathname + '?v=' + Date.now();
              }}
              className="w-full py-3 bg-gradient-to-r from-[#0D9488] to-[#22D3EE] text-black font-semibold text-xs font-mono tracking-widest rounded-xl uppercase hover:brightness-110 transition-all shadow-lg cursor-pointer"
            >
              RECOVER & RELOAD PLATFORM
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
