import React, { useState, useEffect, useRef } from 'react';
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
  Sliders
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

export default function App() {
  // Session & Auth state
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [authMode, setAuthMode] = useState('login'); // login / register
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authRole, setAuthRole] = useState('client'); // client / admin

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
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('token'));
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
  const [resetForm, setResetForm] = useState({ target_username: '', new_password: '' });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [resetError, setResetError] = useState(null);

  // Chatbot states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSourceFilter, setChatSourceFilter] = useState('');
  const [chatSectionFilter, setChatSectionFilter] = useState('');
  const [expandedCitationIndex, setExpandedCitationIndex] = useState(null);
  
  const chatEndRef = useRef(null);

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

  // Scroll to bottom on chat messages update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
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
    if (username !== 'admin') return;
    try {
      const response = await authenticatedFetch('/api/v1/auth/admin/users');
      if (response && response.ok) {
        const data = await response.json();
        setAdminUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to list user accounts:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [activeTab, token]);

  useEffect(() => {
    if (token && username === 'admin' && activeTab === 'admin') {
      fetchAdminUsers();
    }
  }, [activeTab, token, username]);

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
          content: `⚠️ Error: ${data.detail || 'Failed to generate chat response.'}`,
          citations: []
        }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Connection Error: ${err.message || 'Could not communicate with backend.'}`,
        citations: []
      }]);
    } finally {
      setChatLoading(false);
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
          content: `⚠️ Error: ${data.detail || 'Failed to generate response.'}`
        }]);
      }
    } catch (err) {
      setIdeaChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Connection Error: ${err.message || 'Could not communicate with backend.'}`
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

  // RENDER WELCOME SCREEN ON FIRST LOAD
  if (showWelcome) {
    // Dynamic styling classes based on selected welcome layout
    let wrapperClass = "min-h-screen w-full bg-[#FAF9F6] text-zinc-900 font-outfit relative overflow-hidden flex flex-col justify-between p-8 md:p-12";
    if (welcomeLayout === 'brutalist') {
      wrapperClass = "min-h-screen w-full bg-[#FFFBEB] text-black font-mono relative overflow-hidden flex flex-col justify-between p-8 md:p-12 border-[5px] border-black";
    } else if (welcomeLayout === 'cyber') {
      wrapperClass = "min-h-screen w-full bg-[#05050A] text-[#10B981] font-mono relative overflow-hidden flex flex-col justify-between p-8 md:p-12 bg-[linear-gradient(rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:24px_24px]";
    } else if (welcomeLayout === 'aurora') {
      wrapperClass = "min-h-screen w-full bg-[#0A0915] text-white font-outfit relative overflow-hidden flex flex-col justify-between p-8 md:p-12";
    }

    return (
      <div className={wrapperClass}>
        {/* Ambient blurred backdrop shapes for Claymation and Aurora styles */}
        {welcomeLayout === 'claymation' && (
          <>
            <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-amber-200/40 to-transparent blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr from-violet-200/30 to-transparent blur-[100px] pointer-events-none" />
          </>
        )}
        {welcomeLayout === 'aurora' && (
          <>
            <div className="absolute top-[-20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-[#7C3AED]/25 to-transparent blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-25%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#312E81]/30 to-transparent blur-[130px] pointer-events-none" />
          </>
        )}

        {/* Top Header Row */}
        <div className="flex items-center justify-between z-10 w-full">
          <div className="flex items-center gap-2">
            {welcomeLayout === 'brutalist' ? (
              <div className="bg-black text-[#FFFBEB] px-2 py-1 font-black text-xs border border-black uppercase tracking-widest shadow-[2px_2px_0px_#000]">
                T3
              </div>
            ) : welcomeLayout === 'cyber' ? (
              <div className="border border-[#10B981] text-[#10B981] px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest bg-[#10B981]/10">
                [SYS_T3]
              </div>
            ) : (
              <div className={`w-7.5 h-7.5 rounded-full bg-[#6366F1] flex items-center justify-center text-white font-extrabold text-[10px]`}>
                T3
              </div>
            )}
            <span className={`font-outfit font-black text-[10px] md:text-xs tracking-wider uppercase ${
              welcomeLayout === 'cyber' ? 'text-[#10B981]' : 'text-zinc-950'
            }`}>
              BHUSHAN SHREYA OMKAR SOHAM ASTA TAWARI JI
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-[10px] font-mono tracking-widest uppercase">
            <span className="hover:text-[#6366F1] cursor-pointer transition-colors">Home</span>
            <span className="hover:text-[#6366F1] cursor-pointer transition-colors">Features</span>
            <span className="hover:text-[#6366F1] cursor-pointer transition-colors">Database</span>
            <span className="hover:text-[#6366F1] cursor-pointer transition-colors">Documentation</span>
          </div>

          {/* Style & Theme Selectors inside Welcome */}
          <div className="flex items-center gap-2 z-20">
            {/* Design Style Selector */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm border ${
              welcomeLayout === 'cyber' 
                ? 'bg-zinc-950 border-emerald-950 text-[#10B981]' 
                : welcomeLayout === 'brutalist'
                ? 'bg-[#FFFBEB] border-black text-black'
                : 'bg-white border-zinc-200 text-zinc-700'
            }`}>
              <span className="text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-wider">Style:</span>
              <select 
                value={welcomeLayout} 
                onChange={(e) => setWelcomeLayout(e.target.value)}
                className="bg-transparent text-[9px] font-mono border-none focus:outline-none uppercase cursor-pointer text-inherit"
              >
                <option value="claymation">Claymation</option>
                <option value="brutalist">Brutalist</option>
                <option value="cyber">Cyber HUD</option>
                <option value="aurora">Aurora Glass</option>
              </select>
            </div>

            {/* Accent Theme Selector */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm border ${
              welcomeLayout === 'cyber' 
                ? 'bg-zinc-950 border-emerald-950 text-[#10B981]' 
                : welcomeLayout === 'brutalist'
                ? 'bg-[#FFFBEB] border-black text-black'
                : 'bg-white border-zinc-200 text-zinc-700'
            }`}>
              <Palette className="w-3.5 h-3.5 text-zinc-400" />
              <select 
                value={theme} 
                onChange={(e) => setTheme(e.target.value)}
                className="bg-transparent text-[9px] font-mono border-none focus:outline-none uppercase cursor-pointer text-inherit"
              >
                {themesList.map((t) => (
                  <option key={t.id} value={t.id} className="bg-zinc-900 text-zinc-300">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Split Column */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 max-w-5xl mx-auto w-full z-10 py-4">
          {/* Left Hero Column */}
          <div className="flex-1 space-y-6 text-left max-w-lg">
            {welcomeLayout === 'claymation' && (
              <div className="space-y-3">
                <span className="text-[10px] font-mono tracking-[4px] text-zinc-400 uppercase font-semibold block">
                  Digital Experiences
                </span>
                <h1 className="font-outfit font-black text-5xl md:text-6xl text-zinc-900 leading-[1.05] tracking-tight">
                  Hello
                </h1>
                <p className="text-zinc-500 font-light text-sm max-w-sm mt-4 leading-relaxed uppercase tracking-wider text-[11px] font-mono">
                  WELCOME TO THE TEAM NO 3 APPLICATION WINDOW
                </p>
                <p className="text-zinc-450 font-light text-xs max-w-sm leading-relaxed">
                  Advanced patent semantic intelligence workspace. Process complex technical structures with automated vector RAG orchestration.
                </p>
              </div>
            )}

            {welcomeLayout === 'brutalist' && (
              <div className="space-y-4">
                <span className="bg-black text-[#FFFBEB] text-[10px] px-2 py-1 font-bold inline-block border-2 border-black">
                  [ SYSTEM BOOT PROTOCOL ]
                </span>
                <h1 className="font-black text-5xl md:text-6xl text-black leading-none tracking-normal uppercase">
                  TEAM_3_SYS
                </h1>
                <p className="text-black font-bold text-sm uppercase">
                  === WELCOME TO THE TEAM NO 3 APPLICATION WINDOW ===
                </p>
                <p className="text-black text-xs leading-relaxed max-w-md border-l-4 border-black pl-3 py-1 bg-yellow-100/50">
                  No-nonsense knowledge acquisition and relational analysis core. Secure database seed verified. Ready for query mapping.
                </p>
              </div>
            )}

            {welcomeLayout === 'cyber' && (
              <div className="space-y-4 text-[#10B981]">
                <span className="text-[10px] tracking-[4px] animate-pulse font-bold block">
                  &gt; ESTABLISHING INTERRUPT
                </span>
                <h1 className="font-bold text-4xl md:text-5xl leading-none uppercase tracking-widest text-[#10B981] drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  SYS_OPERATOR
                </h1>
                <p className="text-emerald-500/70 text-xs font-mono uppercase">
                  Logical Kernel Registered. Ready for command ingestion.
                </p>
                <p className="text-emerald-500/60 text-xs leading-relaxed max-w-md font-mono bg-zinc-950/80 p-3 border border-emerald-950 rounded">
                  WELCOME TO THE TEAM NO 3 APPLICATION WINDOW. INDEXING USPTO RAW DATABASES. BOOT PARITY ACTIVE.
                </p>
              </div>
            )}

            {welcomeLayout === 'aurora' && (
              <div className="space-y-4">
                <span className="text-[10px] font-mono tracking-[6px] text-zinc-400 uppercase font-semibold block">
                  Aesthetic Intelligence
                </span>
                <h1 className="font-outfit font-light text-5xl md:text-6xl text-white leading-none tracking-wide">
                  Intellect <strong className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Core</strong>
                </h1>
                <p className="text-zinc-400 font-light text-xs max-w-sm leading-relaxed uppercase tracking-wider text-[11px] font-mono">
                  WELCOME TO THE TEAM NO 3 APPLICATION WINDOW
                </p>
                <p className="text-zinc-350 font-light text-xs max-w-sm leading-relaxed">
                  Experience seamless semantic context rendering, multi-constraint mathematical RAG queries, and neural knowledge discovery.
                </p>
              </div>
            )}

            {/* Launch Form fields */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-md w-full pt-2">
              {welcomeLayout === 'brutalist' ? (
                <>
                  <div className="flex-1 bg-white border-[3px] border-black px-4 py-3.5 shadow-[4px_4px_0px_#000] flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="TEAM_3_GATEWAY"
                      disabled
                      className="bg-transparent w-full focus:outline-none text-xs font-mono font-bold tracking-widest text-black/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWelcome(false)}
                    className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-[3px] border-black text-xs font-mono tracking-widest uppercase px-8 py-4 font-black shadow-[4px_4px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
                  >
                    LAUNCH PLATFORM
                  </button>
                </>
              ) : welcomeLayout === 'cyber' ? (
                <>
                  <div className="flex-1 bg-zinc-950 border border-emerald-950 px-4 py-3.5 flex items-center gap-2">
                    <span className="text-emerald-500 font-mono text-xs animate-pulse">&gt;</span>
                    <input
                      type="text"
                      value="run_gateway --role guest"
                      disabled
                      className="bg-transparent w-full focus:outline-none text-xs font-mono tracking-wider text-emerald-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWelcome(false)}
                    className="bg-emerald-950/20 border border-emerald-500 hover:bg-emerald-500 hover:text-black text-emerald-500 text-xs font-mono tracking-widest uppercase px-8 py-4 rounded transition-all cursor-pointer font-bold animate-pulse"
                  >
                    BOOT KERNEL
                  </button>
                </>
              ) : welcomeLayout === 'aurora' ? (
                <>
                  <div className="flex-1 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-3.5 rounded-2xl flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="neural_gate_03"
                      disabled
                      className="bg-transparent w-full focus:outline-none text-xs font-mono tracking-widest text-white/30"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWelcome(false)}
                    className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white text-xs font-mono tracking-widest uppercase px-8 py-4 rounded-2xl font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all cursor-pointer"
                  >
                    ENTER PORTAL
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 bg-white border border-zinc-200 px-4 py-3.5 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="TEAM_3_GATEWAY"
                      disabled
                      className="bg-transparent w-full focus:outline-none text-xs font-mono tracking-widest text-zinc-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWelcome(false)}
                    className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-mono tracking-widest uppercase px-8 py-4 rounded-2xl font-bold shadow-[0_10px_25px_rgba(99,102,241,0.25)] hover:scale-102 transition-all cursor-pointer"
                  >
                    LAUNCH PLATFORM
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Hero Column Graphic Switcher */}
          <div className="flex-1 flex items-center justify-center relative w-full max-w-md h-[340px] md:h-[420px]">
            {welcomeLayout === 'claymation' && (
              <>
                <div className="absolute w-[280px] h-[280px] rounded-full border border-amber-300/40 animate-pulse pointer-events-none" />
                <div className="absolute w-[320px] h-[320px] rounded-full border border-amber-200/20 animate-spin [animation-duration:20s] pointer-events-none" />
                <svg className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)]" viewBox="0 0 400 400" fill="none">
                  <defs>
                    <radialGradient id="beanbag-grad" cx="50%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#FCD34D"/>
                      <stop offset="70%" stopColor="#F59E0B"/>
                      <stop offset="100%" stopColor="#D97706"/>
                    </radialGradient>
                    <linearGradient id="body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818CF8"/>
                      <stop offset="100%" stopColor="#4F46E5"/>
                    </linearGradient>
                    <radialGradient id="bulb-grad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFF"/>
                      <stop offset="30%" stopColor="#FCD34D"/>
                      <stop offset="100%" stopColor="#F59E0B"/>
                    </radialGradient>
                  </defs>
                  <circle cx="160" cy="50" r="16" fill="url(#bulb-grad)" className="animate-bounce" style={{ animationDuration: '4s' }} />
                  <rect x="156" y="65" width="8" height="10" rx="1" fill="#4B5563" />
                  <ellipse cx="200" cy="220" rx="110" ry="75" fill="url(#beanbag-grad)" />
                  <path d="M165 170 C165 140 180 120 200 120 C220 120 235 140 235 170 C235 210 165 210 165 170 Z" fill="url(#body-grad)" />
                  <path d="M180 195 C180 250 160 275 160 275" stroke="#EF4444" strokeWidth="22" strokeLinecap="round" />
                  <path d="M160 275 C160 275 140 282 145 292 C150 302 165 292 165 292" stroke="#60A5FA" strokeWidth="16" strokeLinecap="round" />
                  <path d="M220 195 C220 250 240 275 240 275" stroke="#EF4444" strokeWidth="22" strokeLinecap="round" />
                  <path d="M240 275 C240 275 260 282 255 292 C250 302 235 292 235 292" stroke="#60A5FA" strokeWidth="16" strokeLinecap="round" />
                  <path d="M170 145 C150 135 145 100 150 90" stroke="#4F46E5" strokeWidth="18" strokeLinecap="round" />
                  <circle cx="150" cy="85" r="10" fill="#FBBF24" />
                  <path d="M230 145 C250 135 255 100 250 90" stroke="#4F46E5" strokeWidth="18" strokeLinecap="round" />
                  <circle cx="250" cy="85" r="10" fill="#FBBF24" />
                  <circle cx="200" cy="95" r="22" fill="#FBBF24" />
                  <circle cx="192" cy="92" r="6" stroke="#0284C7" strokeWidth="3.5" fill="none" />
                  <circle cx="208" cy="92" r="6" stroke="#0284C7" strokeWidth="3.5" fill="none" />
                  <line x1="198" y1="92" x2="202" y2="92" stroke="#0284C7" strokeWidth="3.5" />
                </svg>
              </>
            )}

            {welcomeLayout === 'brutalist' && (
              <div className="w-full h-full border-[4px] border-black bg-white p-6 shadow-[8px_8px_0px_#000] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-yellow-400 border-[3px] border-black rotate-12 z-0" />
                <div className="z-10 space-y-4">
                  <div className="text-xs font-black uppercase border-b-2 border-black pb-2 flex items-center justify-between">
                    <span>SYS DIAGNOSTIC</span>
                    <span className="animate-pulse">●</span>
                  </div>
                  <h3 className="font-black text-3xl leading-none">NO_3_NODE</h3>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <div className="border border-black p-2 bg-purple-200">PORT: 8000</div>
                    <div className="border border-black p-2 bg-orange-200">DB: MYSQL</div>
                    <div className="border border-black p-2 bg-green-200">INDEX: ACTIVE</div>
                    <div className="border border-black p-2 bg-blue-200">JWT: SIGNED</div>
                  </div>
                </div>
                <div className="border-[3px] border-black bg-yellow-300 p-3 font-black text-center text-xs tracking-wider uppercase">
                  SEEDED IN WORKSPACE
                </div>
              </div>
            )}

            {welcomeLayout === 'cyber' && (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                {/* Glowing Matrix scanning radar HUD */}
                <div className="absolute inset-0 bg-[#10B981]/5 rounded border border-[#10B981]/20 pointer-events-none" />
                <svg className="w-4/5 h-4/5 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]" viewBox="0 0 400 400" fill="none" stroke="#10B981" strokeWidth="1.5">
                  <circle cx="200" cy="200" r="140" strokeDasharray="6,6" className="animate-spin [animation-duration:25s]" />
                  <circle cx="200" cy="200" r="100" />
                  <circle cx="200" cy="200" r="60" strokeDasharray="3,3" />
                  <line x1="50" y1="200" x2="350" y2="200" strokeOpacity="0.4" />
                  <line x1="200" y1="50" x2="200" y2="350" strokeOpacity="0.4" />
                  {/* Sweeping hand line */}
                  <line x1="200" y1="200" x2="280" y2="120" strokeWidth="2.5" className="animate-pulse" />
                  <circle cx="280" cy="120" r="4" fill="#10B981" />
                </svg>
                <div className="absolute bottom-4 font-mono text-[9px] text-[#10B981]/80 tracking-widest uppercase animate-pulse">
                  System diagnostic sweep in progress...
                </div>
              </div>
            )}

            {welcomeLayout === 'aurora' && (
              <div className="w-full h-full flex items-center justify-center relative">
                {/* Floating radial abstract donut */}
                <div className="absolute w-[240px] h-[240px] rounded-full bg-indigo-500/10 blur-xl animate-pulse" />
                <svg className="w-4/5 h-4/5" viewBox="0 0 400 400" fill="none">
                  <defs>
                    <radialGradient id="aurora-donut-grad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#C084FC" stopOpacity="0.8"/>
                      <stop offset="50%" stopColor="#818CF8" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="transparent"/>
                    </radialGradient>
                  </defs>
                  <circle cx="200" cy="200" r="110" fill="url(#aurora-donut-grad)" className="animate-float" />
                  <circle cx="200" cy="200" r="75" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="6" strokeDasharray="10,5" className="animate-spin [animation-duration:40s]" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Footer Row */}
        <div className={`flex flex-col md:flex-row items-center justify-between w-full z-10 pt-4 max-w-5xl mx-auto border-t ${
          welcomeLayout === 'cyber' 
            ? 'border-emerald-950' 
            : welcomeLayout === 'brutalist'
            ? 'border-black border-t-[3px]'
            : 'border-zinc-200/60'
        }`}>
          {/* Bottom Left Status/Character segment */}
          {welcomeLayout === 'brutalist' ? (
            <div className="border-2 border-black bg-yellow-250 p-2.5 shadow-[2px_2px_0px_#000] text-[10px] font-bold uppercase">
              STATUS: <span className="text-green-700 animate-pulse">ONLINE</span> // MEMORY: SEEDED // COMPILER: OK
            </div>
          ) : welcomeLayout === 'cyber' ? (
            <div className="font-mono text-[9px] text-[#10B981]/70 leading-relaxed text-left uppercase">
              <div>&gt; local_ollama_model: qwen2.5:latest [FOUND]</div>
              <div>&gt; chroma_vector_db: chroma_db [ACTIVE]</div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <svg className="w-24 h-20 drop-shadow-md" viewBox="0 0 160 120" fill="none">
                <defs>
                  <radialGradient id="beanbag-grad-small" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#FCD34D"/>
                    <stop offset="70%" stopColor="#F59E0B"/>
                    <stop offset="100%" stopColor="#D97706"/>
                  </radialGradient>
                  <linearGradient id="body-grad-small" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818CF8"/>
                    <stop offset="100%" stopColor="#4F46E5"/>
                  </linearGradient>
                </defs>
                <ellipse cx="60" cy="80" rx="45" ry="30" fill="url(#beanbag-grad-small)" />
                <path d="M48 60 C48 45 58 35 70 35 C82 35 92 45 92 60 C92 75 48 75 48 60 Z" fill="url(#body-grad-small)" />
                <path d="M55 75 C55 95 65 105 65 105" stroke="#EF4444" strokeWidth="14" strokeLinecap="round" />
                <path d="M85 75 C85 95 95 105 95 105" stroke="#EF4444" strokeWidth="14" strokeLinecap="round" />
                <circle cx="70" cy="20" r="12" fill="#FBBF24" />
                <circle cx="66" cy="18" r="3.5" stroke="#0284C7" strokeWidth="2" fill="none" />
                <circle cx="74" cy="18" r="3.5" stroke="#0284C7" strokeWidth="2" fill="none" />
                <path d="M80 65 L96 65 L102 75 L86 75 Z" fill="#0EA5E9" />
                <path d="M96 65 L96 55 L80 55 L80 65 Z" fill="#38BDF8" />
              </svg>
              <div className="text-left">
                <span className="text-[10px] font-mono tracking-widest text-zinc-400 block uppercase">Workspace Status</span>
                <span className={`text-xs font-bold uppercase flex items-center gap-1.5 ${
                  welcomeLayout === 'aurora' ? 'text-zinc-300' : 'text-zinc-800'
                }`}>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  SYSTEM ONLINE
                </span>
              </div>
            </div>
          )}

          {/* Right Motto segment */}
          <div className="mt-4 md:mt-0 text-center md:text-right space-y-1">
            {welcomeLayout === 'brutalist' ? (
              <h4 className="font-black text-sm uppercase tracking-wide">
                BUILD AWESOME THINGS TOGETHER
              </h4>
            ) : welcomeLayout === 'cyber' ? (
              <h4 className="font-mono text-[10px] text-[#10B981] uppercase tracking-wider animate-pulse">
                // SYSTEM_PROTOCOL_ESTABLISHED_SUCCESSFULLY //
              </h4>
            ) : (
              <h4 className={`font-outfit font-black text-lg tracking-tight ${
                welcomeLayout === 'aurora' ? 'text-zinc-200' : 'text-zinc-800'
              }`}>
                Build Awesome Things <span className="text-[#6366F1]">Together</span>
              </h4>
            )}
            <button
              onClick={() => setShowWelcome(false)}
              className={`text-[9px] font-mono tracking-widest uppercase transition-colors ${
                welcomeLayout === 'cyber' 
                  ? 'text-[#10B981]/50 hover:text-[#10B981]' 
                  : welcomeLayout === 'aurora' 
                  ? 'text-zinc-500 hover:text-[#6366F1]' 
                  : 'text-zinc-450 hover:text-[#6366F1]'
              }`}
            >
              Get In Touch &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER AUTHENTICATION VIEW IF NOT LOGGED IN
  if (!token) {
    if (showOnboarding) {
      return (
        <div className={`app-wrapper bg-grain ${theme} flex items-center justify-center p-6 transition-all duration-300 relative`}>
          {/* Top-Right Theme Selector */}
          <div className="absolute top-6 right-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 border border-theme rounded-full">
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

          <div className="w-full max-w-sm panel-card p-8 rounded-[32px] md:rounded-[36px] min-h-[440px] flex flex-col justify-between space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-theme/60 transition-all duration-500 transform scale-100 slide-enter">
            {/* Carousel Header */}
            <div className="text-center space-y-2">
              <h2 className="font-outfit font-light text-2xl tracking-wider text-main uppercase">
                {onboardingSlide === 0 && "PATENTMIND AI"}
                {onboardingSlide === 1 && "INTELLIGENT INGEST"}
                {onboardingSlide === 2 && "SEMANTIC CHAT"}
              </h2>
              <p className="text-[10px] text-muted font-mono tracking-widest uppercase">
                {onboardingSlide === 0 && "KNOWLEDGE ANALYSIS PLATFORM"}
                {onboardingSlide === 1 && "RAW DOCUMENT VECTORIZATION"}
                {onboardingSlide === 2 && "DYNAMIC RAG PIPELINES"}
              </p>
            </div>

            {/* Slide Interactive Animated Parallax Viewport */}
            <div className="w-full space-y-4">
              <div className={`relative w-full h-[180px] bg-[#090514] overflow-hidden rounded-[24px] border border-theme/40 state-${onboardingSlide}`}>
                {/* Layer 1: Sky */}
                <div className="parallax-layer parallax-sky">
                  <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
                    <rect width="400" height="300" fill="url(#sky-grad)"/>
                    <circle cx="50" cy="40" r="1" fill="#fff" opacity="0.6"/>
                    <circle cx="150" cy="80" r="1.5" fill="#fff" opacity="0.8"/>
                    <circle cx="280" cy="50" r="1" fill="#fff" opacity="0.5"/>
                    <circle cx="340" cy="90" r="1.2" fill="#fff" opacity="0.7"/>
                    <defs>
                      <radialGradient id="sky-grad" cx="50%" cy="50%" r="50%">
                        <stop stopColor="#1E1233"/>
                        <stop offset="100%" stopColor="#090514"/>
                      </radialGradient>
                    </defs>
                  </svg>
                </div>

                {/* Layer 2: Mountains */}
                <div className="parallax-layer parallax-mountains">
                  <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
                    <path d="M 0 300 L 0 170 L 90 120 L 180 190 L 260 110 L 330 160 L 400 100 L 400 300 Z" fill="#130B24" opacity="0.95"/>
                    <path d="M 0 300 L 0 220 L 110 160 L 210 230 L 300 150 L 400 210 L 400 300 Z" fill="#0C0617"/>
                  </svg>
                </div>

                {/* Layer 3: Clouds */}
                <div className="parallax-layer parallax-clouds">
                  <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
                    <path d="M50,130 Q100,80 180,120 T320,110 Q370,160 300,200 H90 Z" fill="#fff" opacity="0.08"/>
                  </svg>
                </div>

                {/* Layer 4: Title */}
                <div className="parallax-layer parallax-title flex flex-col items-center justify-center">
                  <h3 className="font-outfit font-bold text-2xl tracking-[10px] text-main/90 uppercase pl-[10px]">
                    {onboardingSlide === 0 && "DISCOVER"}
                    {onboardingSlide === 1 && "NAVIGATE"}
                    {onboardingSlide === 2 && "REVEAL"}
                  </h3>
                </div>

                {/* Layer 5: Explorer */}
                <div className="parallax-layer parallax-explorer">
                  <svg className="w-full h-full" viewBox="0 0 70 95" fill="none">
                    <path d="M35 15 C20 40 20 85 20 85 L50 85 C50 85 50 40 35 15 Z" fill="#06030B" stroke="#8A5CF6" strokeWidth="1.5" />
                    <circle cx="35" cy="22" r="7" fill="#06030B" stroke="#8A5CF6" strokeWidth="1.5"/>
                    <path d="M42 42 L55 35 L55 48" stroke="#8A5CF6" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="55" cy="52" r="5" fill="#FBBF24" className="animate-pulse"/>
                    <rect x="52" y="47" width="6" height="10" rx="1" stroke="#8A5CF6" strokeWidth="1.5"/>
                  </svg>
                </div>

                {/* Layer 6: Cave foreground */}
                <div className="parallax-layer parallax-cave">
                  <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
                    <path d="M0,0 H400 V300 H0 Z M100,240 C140,240 120,80 200,80 C270,80 260,245 300,245 C350,245 370,300 370,300 H30 Z" fill="#05030A" fillRule="evenodd" stroke="#1F153F" strokeWidth="2"/>
                  </svg>
                </div>
              </div>

              {/* Caption Text Box */}
              <div className="text-center min-h-[54px] flex items-center justify-center">
                <p className="text-[11px] text-muted font-light leading-relaxed max-w-[270px] uppercase tracking-wide">
                  {onboardingSlide === 0 && "Next-generation semantic knowledge analysis for complex patent architectures and technical databases."}
                  {onboardingSlide === 1 && "Process raw patent PDFs, run automatic OCR scanned page extractions, and structure vector indices."}
                  {onboardingSlide === 2 && "Ask natural language questions, retrieve segments, and get citations with confidence scoring."}
                </p>
              </div>
            </div>

            {/* Carousel Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-theme/40">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('onboarding_done', 'true');
                  setShowOnboarding(false);
                }}
                className="text-[10px] font-mono tracking-widest text-zinc-500 hover:text-zinc-350 uppercase transition-colors"
              >
                SKIP
              </button>

              {/* Dots Indicators */}
              <div className="flex gap-2">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setOnboardingSlide(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      onboardingSlide === idx ? 'bg-main w-3.5' : 'bg-zinc-700'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onboardingSlide < 2) {
                    setOnboardingSlide(onboardingSlide + 1);
                  } else {
                    localStorage.setItem('onboarding_done', 'true');
                    setShowOnboarding(false);
                  }
                }}
                className="text-[10px] font-mono tracking-widest text-main hover:text-white uppercase transition-colors font-semibold flex items-center gap-1"
              >
                <span>{onboardingSlide === 2 ? 'START' : 'NEXT'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`app-wrapper bg-grain ${theme} flex items-center justify-center p-6 transition-all duration-300 relative`}>
        {/* Top-Right Theme Selector */}
        <div className="absolute top-6 right-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 border border-theme rounded-full">
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

        <div className={`w-full max-w-sm panel-card p-8 space-y-7 transition-all duration-300 rounded-[32px] md:rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-theme/60 ${
          authRole === 'admin' ? 'border-red-900/40 bg-zinc-950/80 shadow-[0_0_50px_rgba(220,38,38,0.07)]' : ''
        }`}>
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

          <div className="text-center pt-2">
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
        </div>
      </div>
    );
  }

  // CORE APPLICATION DASHBOARD (LOGGED IN)
  return (
    <div className={`app-wrapper bg-grain ${theme} flex flex-col md:flex-row transition-all duration-300`}>
      
      {/* LEFT FIXED PANEL (HERO & NAVIGATION & LOGOUT) */}
      <aside className="w-full md:w-[360px] md:fixed md:top-0 md:bottom-0 md:left-0 panel-card border-r border-theme p-8 md:p-12 flex flex-col justify-between overflow-y-auto z-20">
        <div className="space-y-8">
          
          {/* Brand Header */}
          <div>
            <h1 className="font-outfit font-light text-3xl tracking-wider leading-none text-main">
              PATENT<br />MIND AI
            </h1>
            <div className="w-12 h-[1px] bg-zinc-700/60 my-4"></div>
            
            {/* User Session Profile & Password Change */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                  SESSION: <strong className="text-main font-semibold">{username}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowChangePasswordModal(true);
                  setChangePasswordMsg('');
                }}
                className="text-[9px] font-mono text-zinc-500 hover:text-white flex items-center gap-1 border border-theme px-2 py-0.5 rounded uppercase tracking-wider transition-colors"
                title="Change Account Password"
              >
                <KeyRound className="w-3 h-3" />
                <span>CHANGE PW</span>
              </button>
            </div>

            {/* Change Password Modal */}
            {showChangePasswordModal && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#0f0f12] border border-theme panel-card p-6 md:p-8 max-w-sm w-full space-y-5 fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-main flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-zinc-400" />
                      CHANGE ACCOUNT PASSWORD
                    </h3>
                    <button
                      onClick={() => setShowChangePasswordModal(false)}
                      className="text-zinc-500 hover:text-white font-mono text-xs"
                    >
                      ✕
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
                    <div className="border-b border-theme py-1">
                      <label className="text-[9px] font-mono text-zinc-500 block mb-1 uppercase">CURRENT PASSWORD</label>
                      <input
                        type="password"
                        value={changePasswordForm.old_password}
                        onChange={(e) => setChangePasswordForm({ ...changePasswordForm, old_password: e.target.value })}
                        required
                        className="w-full bg-transparent text-xs font-mono text-main focus:outline-none"
                      />
                    </div>

                    <div className="border-b border-theme py-1">
                      <label className="text-[9px] font-mono text-zinc-500 block mb-1 uppercase">NEW PASSWORD (MIN 4 CHARACTERS)</label>
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
                        className="flex-1 py-2 border border-theme text-[10px] font-mono text-zinc-400 hover:text-white uppercase tracking-wider"
                      >
                        CANCEL
                      </button>
                      <button
                        type="submit"
                        disabled={changePasswordLoading}
                        className="flex-1 py-2 btn-theme text-[10px] font-mono uppercase tracking-wider disabled:opacity-40"
                      >
                        {changePasswordLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Multi-Language & Voice Assistance Widget */}
          <div className="py-4 border-b border-theme space-y-3">
            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 tracking-wider">
              <span>MULTILINGUAL & VOICE ASSIST</span>
              <span className="uppercase font-semibold text-zinc-400">
                {selectedLanguage}
              </span>
            </div>

            <div className="relative flex items-center border border-theme bg-black/10 px-2.5 py-1">
              <Globe className="w-3 h-3 text-zinc-500 mr-2 flex-shrink-0" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-transparent text-[10px] font-mono focus:outline-none border-none text-zinc-300 uppercase cursor-pointer"
              >
                <option value="English" className="bg-zinc-950 text-zinc-400">ENGLISH (US 🇺🇸)</option>
                <option value="Hindi" className="bg-zinc-950 text-zinc-400">HINDI (हिंदी 🇮🇳)</option>
                <option value="Spanish" className="bg-zinc-950 text-zinc-400">SPANISH (ESPAÑOL 🇪🇸)</option>
                <option value="French" className="bg-zinc-950 text-zinc-400">FRENCH (FRANÇAIS 🇫🇷)</option>
                <option value="German" className="bg-zinc-950 text-zinc-400">GERMAN (DEUTSCH 🇩🇪)</option>
              </select>
            </div>

            {isSpeaking && (
              <button
                onClick={() => handleSpeakText('')}
                className="w-full py-1.5 text-[9px] font-mono border border-amber-800 bg-amber-950/30 text-amber-400 flex items-center justify-center gap-1.5 rounded animate-pulse"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>STOP VOICE NARRATION</span>
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-4 text-left">
            <button
              onClick={() => setActiveTab('search')}
              className={`group flex items-baseline gap-4 text-xs font-mono tracking-widest uppercase transition-all duration-150 ${
                activeTab === 'search' ? 'text-main font-semibold' : 'text-muted hover:text-main'
              }`}
            >
              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">01</span>
              <span>RAG SEARCH</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`group flex items-baseline gap-4 text-xs font-mono tracking-widest uppercase transition-all duration-150 ${
                activeTab === 'dashboard' ? 'text-main font-semibold' : 'text-muted hover:text-main'
              }`}
            >
              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">02</span>
              <span>DASHBOARD</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`group flex items-baseline gap-4 text-xs font-mono tracking-widest uppercase transition-all duration-150 ${
                activeTab === 'upload' ? 'text-main font-semibold' : 'text-muted hover:text-main'
              }`}
            >
              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">03</span>
              <span>DOCUMENT UPLOAD</span>
            </button>

            <button
              onClick={() => setActiveTab('dataset')}
              className={`group flex items-baseline gap-4 text-xs font-mono tracking-widest uppercase transition-all duration-150 ${
                activeTab === 'dataset' ? 'text-main font-semibold' : 'text-muted hover:text-main'
              }`}
            >
              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">04</span>
              <span>DATASET IMPORT</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`group flex items-baseline gap-4 text-xs font-mono tracking-widest uppercase transition-all duration-150 ${
                activeTab === 'chat' ? 'text-main font-semibold' : 'text-muted hover:text-main'
              }`}
            >
              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">05</span>
              <span>CHATBOT</span>
            </button>

            <button
              onClick={() => setActiveTab('idea')}
              className={`group flex items-baseline gap-4 text-xs font-mono tracking-widest uppercase transition-all duration-150 ${
                activeTab === 'idea' ? 'text-main font-semibold' : 'text-muted hover:text-main'
              }`}
            >
              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">06</span>
              <span>IDEA ANALYZER</span>
            </button>

            <button
              onClick={() => setActiveTab('help')}
              className={`group flex items-baseline gap-4 text-xs font-mono tracking-widest uppercase transition-all duration-150 ${
                activeTab === 'help' ? 'text-main font-semibold' : 'text-muted hover:text-main'
              }`}
            >
              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">07</span>
              <span>HELP & FEEDBACK</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`group flex items-baseline gap-4 text-xs font-mono tracking-widest uppercase transition-all duration-150 ${
                activeTab === 'settings' ? 'text-main font-semibold' : 'text-muted hover:text-main'
              }`}
            >
              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">08</span>
              <span>SETTINGS</span>
            </button>

            {username === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`group flex items-baseline gap-4 text-xs font-mono tracking-widest uppercase transition-all duration-150 ${
                  activeTab === 'admin' ? 'text-main font-semibold' : 'text-muted hover:text-main'
                }`}
              >
                <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">09</span>
                <span>ADMIN CONTROL</span>
              </button>
            )}
          </nav>
        </div>

        {/* Sidebar Footer with Logout */}
        <div className="pt-6 border-t border-theme mt-8 space-y-4">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2.5 text-[10px] font-mono text-zinc-400 hover:text-red-400 transition-colors uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5 text-red-500" />
            <span>LOG OUT</span>
          </button>
          
          <div className="text-[9px] text-zinc-650 font-mono tracking-wider flex items-center justify-between">
            <span>SECURE LINK ENCRYPTED</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-550 inline-block"></span>
              SSL
            </span>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-[360px] p-8 md:p-16 max-w-5xl overflow-y-auto flex flex-col min-h-screen">

        {/* Top Ticker Slider Banner */}
        <div className="w-full bg-zinc-950/80 border border-theme/60 backdrop-blur-md rounded-none py-2.5 px-4 mb-8 overflow-hidden relative flex items-center gap-4 select-none">
          <div className="flex items-center gap-1.5 flex-shrink-0 text-emerald-500 font-mono text-[9px] font-bold uppercase tracking-widest border-r border-theme pr-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SYSTEM MONITOR</span>
          </div>
          <div className="flex-1 overflow-hidden relative h-4">
            <div className="animate-marquee whitespace-nowrap text-[9px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-12 absolute">
              <span>💡 PATENT INDEX STATUS: <strong className="text-white">ONLINE</strong></span>
              <span>⚡ ACTIVE AI ENGINE: <strong className="text-white">GROQ LLM (HYBRID CLOUD)</strong></span>
              <span>🔐 NETWORK LINK: <strong className="text-white">SECURED SSL ACTIVE</strong></span>
              <span>📊 TOTAL PATENTS INDEXED: <strong className="text-white">DEFAULT SEED COMPLETED</strong></span>
              <span>🤖 COMPILER STATUS: <strong className="text-white">SUCCESS (v2.1.0-CLEAN)</strong></span>
            </div>
          </div>
        </div>

        {/* SEMANTIC SEARCH & RAG TAB */}
        {activeTab === 'search' && (
          <div className="space-y-12 fade-in">
            <div>
              <span className="text-[11px] text-muted font-mono tracking-widest uppercase">01. SEMANTIC MATCHING</span>
              <h2 className="text-serif-editorial text-4xl text-main tracking-wide mt-2">RAG KNOWLEDGE SEARCH</h2>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative border-b border-theme focus-within:border-zinc-500 transition-colors duration-250 py-2">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="QUERY DATASET RECORDS OR PATENT CLAIMS..."
                  className="w-full bg-transparent pl-8 pr-32 py-2 text-sm uppercase font-mono tracking-wider focus:outline-none placeholder:text-zinc-655 text-main"
                />
                <div className="absolute right-20 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-mono tracking-widest uppercase border border-theme hover:border-zinc-500 disabled:opacity-40 text-muted hover:text-main px-4 py-1.5 transition-all duration-150"
                >
                  {searchLoading ? 'RUNNING...' : 'SUBMIT'}
                </button>
              </div>

              <div className="flex items-center gap-6 text-[10px] font-mono tracking-wider text-zinc-500 pt-2">
                <div className="flex items-center gap-2">
                  <span>SOURCE LIMIT:</span>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="bg-transparent border border-theme text-zinc-400 focus:outline-none px-1.5 py-0.5"
                  >
                    <option value="" className="bg-[#0c0c0e]">ALL SOURCES</option>
                    <option value="USPTO" className="bg-[#0c0c0e]">USPTO</option>
                    <option value="WIPO" className="bg-[#0c0c0e]">WIPO</option>
                    <option value="Google Patents" className="bg-[#0c0c0e]">GOOGLE PATENTS</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span>SECTION LIMIT:</span>
                  <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    className="bg-transparent border border-theme text-zinc-400 focus:outline-none px-1.5 py-0.5"
                  >
                    <option value="" className="bg-[#0c0c0e]">ALL SECTIONS</option>
                    <option value="Abstract" className="bg-[#0c0c0e]">ABSTRACT</option>
                    <option value="Description" className="bg-[#0c0c0e]">DESCRIPTION</option>
                    <option value="Claims" className="bg-[#0c0c0e]">CLAIMS</option>
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
                      <span>🧠 ✨</span> <span>SYNTHESIZED INSIGHTS</span>
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
        )}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10 fade-in">
            <div>
              <span className="text-[11px] text-muted font-mono tracking-widest uppercase">02. PATENT LANDSCAPE & STRATEGY</span>
              <h2 className="text-serif-editorial text-4xl text-main tracking-wide mt-2">TECHNOLOGY DASHBOARD</h2>
            </div>

            {analyticsLoading && !analytics ? (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <RefreshCw className="w-5 h-5 text-zinc-500 animate-spin" />
                <span className="text-xs font-mono tracking-wider text-zinc-600 uppercase">SYNCHRONIZING LANDSCAPE TELEMETRY...</span>
              </div>
            ) : (
              <>
                {/* SECTION 1: Top Fields Where Patents Are Created Most */}
                <div className="panel-card p-7 space-y-6 border-theme">
                  <div className="flex justify-between items-center pb-3 border-b border-theme">
                    <h3 className="text-xs font-mono tracking-widest text-main uppercase flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-cyan-400" />
                      TOP FIELDS WHERE PATENTS ARE CREATED MOST
                    </h3>
                    <span className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider">CREATION DENSITY</span>
                  </div>

                  <div className="space-y-6">
                    {analytics?.top_created_fields?.map((item) => (
                      <div key={item.field} className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-main font-mono tracking-wider flex items-center gap-3">
                            {item.field}
                            <span className="text-[8.5px] font-mono text-zinc-400 px-2 py-0.5 bg-black/40 rounded border border-zinc-800 tracking-wider">
                              {item.status}
                            </span>
                          </span>
                          <span className="text-cyan-400 font-mono font-semibold">{item.percentage}% ({item.count} PATENTS)</span>
                        </div>
                        <div className="h-2.5 w-full bg-black/50 rounded-full overflow-hidden border border-zinc-850">
                          <div 
                            className={`h-full ${item.color} rounded-full transition-all duration-500`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 2: White-Space Opportunities (Fields Where Users SHOULD File Patents) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-theme">
                    <h3 className="text-xs font-mono tracking-widest text-main uppercase flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-400" />
                      RECOMMENDED INNOVATION FIELDS (HIGH OPPORTUNITY WHITE-SPACE)
                    </h3>
                    <span className="text-[9.5px] font-mono text-amber-400 uppercase tracking-wider">IDEAL PATENT TARGETS</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {analytics?.opportunity_whitespace_fields?.map((item) => (
                      <div key={item.field} className="panel-card p-6 border-amber-900/40 bg-amber-950/10 space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-mono font-semibold text-amber-300 tracking-wider uppercase">{item.field}</h4>
                          <span className="text-[9px] font-mono bg-amber-900/40 text-amber-300 px-2.5 py-1 rounded border border-amber-800/60 font-semibold">
                            SCORE: {item.opportunity_score}/100
                          </span>
                        </div>

                        {/* Opportunity Score Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9.5px] font-mono text-zinc-400">
                            <span>COMPETITION: {item.competition}</span>
                            <span className="text-amber-400">{item.opportunity_score}% UNTAPPED OPPORTUNITY</span>
                          </div>
                          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-amber-900/30">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full transition-all duration-500"
                              style={{ width: `${item.opportunity_score}%` }}
                            />
                          </div>
                        </div>

                        <div className="p-3 bg-black/40 border border-amber-900/30 rounded text-[9.5px] font-mono text-amber-200/90 leading-relaxed">
                          <strong className="text-amber-400 uppercase">STRATEGIC ACTION:</strong> {item.recommendation}
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
          <div className="space-y-12 fade-in">
            <div>
              <span className="text-[11px] text-muted font-mono tracking-widest uppercase">05. DATASET IMPORT</span>
              <h2 className="text-serif-editorial text-4xl text-main tracking-wide mt-2">BULK DATASET INDEXER</h2>
            </div>

            <div className="panel-card p-8 rounded-none space-y-6">
              <p className="text-xs text-muted leading-relaxed font-light">
                Ingest large structured collections of patents/technical documents in a single stream. Select and upload a JSON (array of records matching the schema) or CSV dataset file. The processing pipeline will parse, validate, chunk, and embed the documents automatically.
              </p>

              <form onSubmit={handleDatasetSubmit} className="space-y-6">
                <div className="border border-dashed border-theme hover:border-zinc-500 transition-colors p-8 flex flex-col items-center justify-center gap-2 cursor-pointer bg-black/10">
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={(e) => setDatasetFile(e.target.files[0])}
                    className="hidden"
                    id="dataset-file-input"
                  />
                  <label htmlFor="dataset-file-input" className="cursor-pointer text-center">
                    <FileCode className="w-6 h-6 text-zinc-555 mx-auto mb-2" />
                    <span className="text-xs font-mono tracking-wider uppercase text-zinc-400 block">
                      {datasetFile ? datasetFile.name : 'SELECT DATASET FILE (JSON / CSV)'}
                    </span>
                    <span className="text-[9px] text-zinc-650 font-mono uppercase mt-1 block">MAX SIZE 25MB</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={datasetLoading}
                  className="w-full py-3.5 btn-theme text-xs font-mono tracking-widest uppercase disabled:opacity-40"
                >
                  {datasetLoading ? 'BATCH INDEXING DATASET RECORDS...' : 'START BULK INGESTION'}
                </button>
              </form>
            </div>

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

        {/* CHATBOT TAB */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col space-y-6 fade-in h-[calc(100vh-8rem)]">
            
            {/* Header */}
            <div>
              <span className="text-[11px] text-muted font-mono tracking-widest uppercase">06. CONVERSATIONAL RAG</span>
              <h2 className="text-serif-editorial text-4xl text-main tracking-wide mt-2">KNOWLEDGE AGENT CHAT</h2>
            </div>

            {/* Chat Thread Container */}
            <div className="flex-1 overflow-y-auto panel-card p-6 md:p-8 space-y-6 bg-black/15 flex flex-col border border-theme">
              
              {chatMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <MessageSquare className="w-10 h-10 text-zinc-650" />
                  <div className="space-y-2">
                    <h3 className="text-serif-editorial text-lg text-main">CONVERSE WITH YOUR PATENTS</h3>
                    <p className="text-xs text-muted max-w-sm font-light">
                      Ask context-aware questions about your indexed patent PDFs. The chatbot remembers previous turns and links citations.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 flex-1">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      {/* Role Label */}
                      <div className="flex items-center justify-between gap-2 w-full px-1">
                        <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest flex items-center gap-1">
                          {msg.role === 'user' ? `👤 ${username}` : '🤖 ✨ AI ANALYST'}
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

                      {/* Content Bubble */}
                      <div className={`p-4 max-w-[85%] text-xs font-light leading-relaxed font-sans border ${
                        msg.role === 'user' 
                          ? 'bg-zinc-800/40 border-zinc-700/60 text-zinc-200 rounded-bl-lg rounded-tl-lg rounded-tr-lg' 
                          : 'bg-black/30 border-theme text-muted rounded-br-lg rounded-tl-lg rounded-tr-lg'
                      }`}>
                        <div className="whitespace-pre-wrap">{msg.content}</div>

                        {/* Citation attributions list */}
                        {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-theme/80 space-y-2.5">
                            <button
                              onClick={() => setExpandedCitationIndex(expandedCitationIndex === idx ? null : idx)}
                              className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 hover:text-main transition-colors uppercase tracking-wider"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>CITED SOURCES ({msg.citations.length})</span>
                              {expandedCitationIndex === idx ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>

                            {expandedCitationIndex === idx && (
                              <div className="space-y-3.5 pl-1 pt-1.5 fade-in">
                                {msg.citations.map((c, cIdx) => (
                                  <div key={cIdx} className="space-y-1 bg-black/10 p-2.5 border border-theme/50 text-[11px] text-zinc-400">
                                    <div className="flex justify-between font-mono text-[9px] text-zinc-500">
                                      <span className="font-semibold text-main">{c.metadata.patent_number} ({c.metadata.section})</span>
                                      <span>SCORE: {c.score.toFixed(3)}</span>
                                    </div>
                                    <div className="text-[11px] font-medium text-zinc-300 mt-0.5">{c.metadata.title}</div>
                                    <p className="text-[10px] text-zinc-500 italic mt-1.5 border-l border-zinc-800 pl-2 leading-relaxed">
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
                        <div className="text-[8px] font-mono text-zinc-650 flex gap-3 px-1">
                          <span>LLM: {msg.active_llm.toUpperCase()}</span>
                          <span>LATENCY: {msg.latency}s</span>
                          <span>DB: {msg.active_db.toUpperCase()}</span>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}

              {/* Typing indicator */}
              {chatLoading && (
                <div className="flex flex-col items-start space-y-1.5 self-start">
                  <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest px-1">AI ANALYST</span>
                  <div className="p-4 bg-black/25 border border-theme text-xs font-mono text-zinc-500 tracking-wider flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-600" />
                    <span>SYNTHESIZING CONTEXT AND QUERYING LLM...</span>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar & Controls */}
            <div className="space-y-3">
              {/* Filter controls */}
              <div className="flex flex-wrap gap-4 text-[9px] font-mono text-zinc-500 tracking-wider items-center justify-between px-1">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <span>SOURCE:</span>
                    <select
                      value={chatSourceFilter}
                      onChange={(e) => setChatSourceFilter(e.target.value)}
                      className="bg-transparent border border-theme text-zinc-400 focus:outline-none px-1 py-0.5 text-[9px]"
                    >
                      <option value="" className="bg-[#0c0c0e]">ALL SOURCES</option>
                      <option value="USPTO" className="bg-[#0c0c0e]">USPTO</option>
                      <option value="WIPO" className="bg-[#0c0c0e]">WIPO</option>
                      <option value="Google Patents" className="bg-[#0c0c0e]">GOOGLE PATENTS</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span>SECTION:</span>
                    <select
                      value={chatSectionFilter}
                      onChange={(e) => setChatSectionFilter(e.target.value)}
                      className="bg-transparent border border-theme text-zinc-400 focus:outline-none px-1 py-0.5 text-[9px]"
                    >
                      <option value="" className="bg-[#0c0c0e]">ALL SECTIONS</option>
                      <option value="Abstract" className="bg-[#0c0c0e]">ABSTRACT</option>
                      <option value="Description" className="bg-[#0c0c0e]">DESCRIPTION</option>
                      <option value="Claims" className="bg-[#0c0c0e]">CLAIMS</option>
                    </select>
                  </div>
                </div>

                {chatMessages.length > 0 && (
                  <button
                    onClick={() => setChatMessages([])}
                    className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors uppercase"
                    title="Clear history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>RESET THREAD</span>
                  </button>
                )}
              </div>

              {/* Text Input Block */}
              <form onSubmit={handleChatSend} className="relative flex items-center border-b border-theme focus-within:border-zinc-550 transition-colors py-2 bg-black/5 pr-4 pl-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                  placeholder="ASK THE PATENT AGENT A QUESTION OR FOLLOW UP..."
                  className="w-full bg-transparent py-2 px-3 text-xs uppercase font-mono tracking-wider focus:outline-none placeholder:text-zinc-700 text-main disabled:opacity-40"
                />
                <button
                  type="button"
                  onClick={() => handleVoiceInput(setChatInput, 'chat')}
                  className={`p-2 transition-all mr-1.5 ${
                    isListening && activeListeningField === 'chat'
                      ? 'text-red-400 bg-red-950/40 animate-pulse rounded'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                  title="Voice Input (Speech-to-Text)"
                >
                  {isListening && activeListeningField === 'chat' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-2 border border-theme hover:border-zinc-550 text-zinc-500 hover:text-main transition-all disabled:opacity-30 flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
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
                               {msg.role === 'user' ? `👤 ${username}` : '💡 ✨ STRATEGY ADVISOR'}
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

        {/* HELP & FEEDBACK TAB */}
        {activeTab === 'help' && (
          <div className="space-y-8 fade-in max-w-4xl">
            <div>
              <span className="text-[10px] text-muted font-mono tracking-widest uppercase">08. SUPPORT & FEEDBACK</span>
              <h2 className="text-serif-editorial text-3xl text-main tracking-wide mt-1">HELP & FEEDBACK</h2>
            </div>

            {/* SECTION 1: DIRECT CONTACT WP & IG BOXES (COMPACT SIZE) */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-mono tracking-widest text-main uppercase flex items-center gap-2 pb-1 border-b border-theme">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                DIRECT CONTACT CHANNELS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                {/* WhatsApp Support Box */}
                <div className="panel-card p-4 border-emerald-800/60 bg-emerald-950/20 space-y-2.5 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-semibold text-emerald-400 tracking-wider flex items-center gap-1.5">
                      💬 WHATSAPP
                    </span>
                    <span className="text-[8.5px] font-mono bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50 uppercase">
                      ONLINE
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-300">
                    Direct tech support: <strong>+91 9359082546</strong>
                  </p>
                  <a
                    href="https://wa.me/919359082546"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/50 rounded text-[10.5px] font-mono tracking-wider uppercase transition-all"
                  >
                    <span>OPEN WHATSAPP CHAT</span>
                  </a>
                </div>

                {/* Instagram Profile Box */}
                <div className="panel-card p-4 border-pink-800/60 bg-pink-950/20 space-y-2.5 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-semibold text-pink-400 tracking-wider flex items-center gap-1.5">
                      📸 INSTAGRAM
                    </span>
                    <span className="text-[8.5px] font-mono bg-pink-900/50 text-pink-300 px-2 py-0.5 rounded border border-pink-700/50 uppercase">
                      OFFICIAL
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-300">
                    Lead Dev: <strong>@patil.bhushan1</strong>
                  </p>
                  <a
                    href="https://instagram.com/patil.bhushan1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2 bg-pink-600/30 hover:bg-pink-600/40 text-pink-200 border border-pink-500/50 rounded text-[10.5px] font-mono tracking-wider uppercase transition-all"
                  >
                    <span>VISIT INSTAGRAM</span>
                  </a>
                </div>
              </div>
            </div>

            {/* SECTION 2: COMPACT FEEDBACK FORM */}
            <div className="panel-card p-5 space-y-4 border-theme max-w-2xl rounded">
              <div className="flex justify-between items-center pb-2 border-b border-theme">
                <h3 className="text-xs font-mono tracking-widest text-main uppercase flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  SUBMIT FEEDBACK
                </h3>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">EVALUATION</span>
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
                <button onClick={() => setSettingsSavedMsg('')} className="text-zinc-500 hover:text-white text-xs font-bold">✕</button>
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

        {/* ADMIN CONTROL TAB (ONLY ACCESSIBLE TO ADMIN) */}
        {username === 'admin' && activeTab === 'admin' && (
          <div className="space-y-12 fade-in">
            <div>
              <span className="text-[11px] text-muted font-mono tracking-widest uppercase">08. ADMINISTRATIVE CONTROLS</span>
              <h2 className="text-serif-editorial text-4xl text-main tracking-wide mt-2">USER MANAGEMENT</h2>
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
                      {adminUsers.map((u) => (
                        <option key={u} value={u} className="bg-[#0c0c0e]">{u.toUpperCase()}</option>
                      ))}
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

              {/* Registered Users Listing */}
              <div className="panel-card p-6 rounded-none space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-theme">
                  <h4 className="text-xs font-mono tracking-wider text-zinc-500 uppercase">SYSTEM USERS</h4>
                  <button 
                    onClick={fetchAdminUsers}
                    className="text-zinc-500 hover:text-white transition-colors"
                    title="Refresh list"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-theme text-xs font-mono">
                  {adminUsers.length > 0 ? (
                    adminUsers.map((user) => (
                      <div key={user} className="py-2.5 flex justify-between items-center">
                        <span className="text-main uppercase">{user}</span>
                        <span className="text-[10px] text-zinc-555">
                          {user === 'admin' ? 'ADMINISTRATOR' : 'CLIENT'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-zinc-655 italic font-light">No users found.</div>
                  )}
                </div>
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
