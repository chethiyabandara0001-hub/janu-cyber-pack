/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Server, Inbox, Settings, Activity, Upload, Check, X, AlertCircle, 
  Send, Phone, Mail, Award, Lock, LogIn, ExternalLink, RefreshCw, Layers,
  ChevronRight, Sparkles, Database, Plus, Trash2, Edit2, Volume2, Globe, FileText, CheckCircle, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Post, PaymentSlip, ContactDetails, HomeAnnouncement, User } from './types';

export default function App() {
  // Theme state: 'cyberpunk-dark' | 'cyberpunk-light' | 'acid-volt' | 'neon-blue'
  const [theme, setTheme] = useState<'cyberpunk-dark' | 'cyberpunk-light' | 'acid-volt' | 'neon-blue'>(() => {
    return (localStorage.getItem('janu-cyber-theme') as 'cyberpunk-dark' | 'cyberpunk-light' | 'acid-volt' | 'neon-blue') || 'cyberpunk-dark';
  });

  useEffect(() => {
    localStorage.setItem('janu-cyber-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Navigation: 'home' | 'packages' | 'announcements' | 'dashboard' | 'admin'
  const [activeTab, setActiveTab] = useState<'home' | 'packages' | 'dashboard' | 'admin'>('home');
  const [user, setUser] = useState<User | null>(null);
  
  // App Data States
  const [packages, setPackages] = useState<Package[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [contact, setContact] = useState<ContactDetails | null>(null);
  const [announcement, setAnnouncement] = useState<HomeAnnouncement | null>(null);
  const [userSlips, setUserSlips] = useState<PaymentSlip[]>([]);
  
  // Slip upload popup settings
  const [selectedPackForSlip, setSelectedPackForSlip] = useState<Package | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('LITE - 100GB');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [base64Slip, setBase64Slip] = useState<string>('');
  const [isSubmittingSlip, setIsSubmittingSlip] = useState<boolean>(false);
  const [slipFeedback, setSlipFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Authentication Fields (Google & Facebook & Email System Integrator)
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginName, setLoginName] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [loginProvider, setLoginProvider] = useState<'google' | 'facebook' | 'email'>('email');
  const [emailAuthMode, setEmailAuthMode] = useState<'login' | 'register'>('login');
  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  
  // Custom High-Fidelity Google & Facebook login form dialog controls
  const [showGoogleForm, setShowGoogleForm] = useState<boolean>(false);
  const [showFacebookForm, setShowFacebookForm] = useState<boolean>(false);
  const [socialEmail, setSocialEmail] = useState<string>('');
  const [socialPassword, setSocialPassword] = useState<string>('');
  const [socialName, setSocialName] = useState<string>('');

  // Admin Dashboard stats & controls
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);
  const [slipVerificationFilter, setSlipVerificationFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [customVpnCode, setCustomVpnCode] = useState<string>('');
  
  // Admin Editing state hooks
  const [editingPack, setEditingPack] = useState<Partial<Package> | null>(null);
  const [isPackDragOver, setIsPackDragOver] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [editingContact, setEditingContact] = useState<Partial<ContactDetails> | null>(null);
  const [editingAnnounce, setEditingAnnounce] = useState<Partial<HomeAnnouncement> | null>(null);
  const [selectedUserIdForBandwidth, setSelectedUserIdForBandwidth] = useState<string>('');
  const [adminUserTotalGB, setAdminUserTotalGB] = useState<number>(100);
  const [adminUserUsedGB, setAdminUserUsedGB] = useState<number>(0);
  const [confirmDeletePackId, setConfirmDeletePackId] = useState<string | null>(null);
  const [confirmDeletePostId, setConfirmDeletePostId] = useState<string | null>(null);
  const [promoteEmail, setPromoteEmail] = useState<string>('');
  const [adminManageMessage, setAdminManageMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Telegram Bot Live Terminal simulator states
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[${new Date(Date.now() - 360000).toLocaleTimeString()}] [SYSTEM] Telebot process daemon successfully booted under Node runtime.`,
    `[${new Date(Date.now() - 300000).toLocaleTimeString()}] [INFO] Long-Polling connection pool initialized for verification channels.`,
    `[${new Date(Date.now() - 240000).toLocaleTimeString()}] [INFO] WebSocket tunnel handshakes completed with official Telegram API gateway servers.`,
    `[${new Date(Date.now() - 180000).toLocaleTimeString()}] [SUCCESS] Database bridges connected securely. Active user telemetry synced.`,
    `[${new Date(Date.now() - 120000).toLocaleTimeString()}] [BOT] Received /start command signal from Telegram client @chethiya_bandara (ID: 554311)`,
    `[${new Date(Date.now() - 60000).toLocaleTimeString()}] [INFO] Automatic daemon watchdog check accomplished. Status: 100% Operational, Latency: 12ms.`,
  ]);
  const [isTerminalLive, setIsTerminalLive] = useState<boolean>(false);
  const [customBotCmd, setCustomBotCmd] = useState<string>('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Periodic heartbeat loops for live logs
  useEffect(() => {
    if (!isTerminalLive) return;

    const phrases = [
      "Background heartbeat validated. Core socket link remains active.",
      "Optimized internal packet caching system. Status: healthy.",
      "Polled database for transaction slip validations: queue clear.",
      "Active 10Gbps gateway link check resolved successfully (16ms latency).",
      "SSL verification keys checked recursively. Expiry of daemon cert: 108 days.",
      "Secured API rate metrics: 0.12 total req/sec, connection pool is nominal.",
      "Dynamic data allocation watchdogs verified active tunnel endpoints.",
    ];

    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * phrases.length);
      setTerminalLogs(prev => {
        const nextLogs = [...prev, `[${new Date().toLocaleTimeString()}] [SYSTEM] ${phrases[idx]}`];
        if (nextLogs.length > 50) {
          return nextLogs.slice(nextLogs.length - 50);
        }
        return nextLogs;
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [isTerminalLive]);

  const handleSendTerminalCmd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBotCmd.trim()) return;

    const cmd = customBotCmd.trim();
    const timestamp = new Date().toLocaleTimeString();
    
    setTerminalLogs(prev => {
      let responseLogs = [...prev, `[${timestamp}] [USER-ADMIN] admin@datastore:~$ ${cmd}`];
      const lowerCmd = cmd.toLowerCase();

      if (lowerCmd === '/status') {
        responseLogs.push(`[${timestamp}] [SYSTEM] CPU Load: 7% • Daemon RAM: 298MB/512MB Allocation`);
        responseLogs.push(`[${timestamp}] [SYSTEM] Telebot process state: ONLINE (PID: 88402)`);
        responseLogs.push(`[${timestamp}] [SYSTEM] Established socket connections: 14 channels, DB sync OK.`);
      } else if (lowerCmd === '/restartbot' || lowerCmd === '/restart') {
        responseLogs.push(`[${timestamp}] [SYSTEM] Initializing bot warm reload...`);
        responseLogs.push(`[${timestamp}] [SYSTEM] Flushed all socket poll queries.`);
        responseLogs.push(`[${timestamp}] [SUCCESS] Bot daemon restarted successfully! Long-polling re-armed.`);
      } else if (lowerCmd === '/cleanlogs' || lowerCmd === '/clear') {
        responseLogs = [`[${timestamp}] [SYSTEM] User terminal logs cache cleared successfully.`];
      } else if (lowerCmd === '/sendbroadcast') {
        responseLogs.push(`[${timestamp}] [INFO] Launching Global Broadcast dispatch to active customer pool...`);
        responseLogs.push(`[${timestamp}] [SUCCESS] Broadcaster pipeline fully matched 34 client channels.`);
      } else {
        responseLogs.push(`[${timestamp}] [BOT-ROUTER] Recv custom test packet: "${cmd}" from admin desktop.`);
        responseLogs.push(`[${timestamp}] [BOT-ROUTER] Auto-Response: "Acknowledge signal test. Web application and Telegram API bindings are working as expected."`);
      }

      if (responseLogs.length > 50) {
        return responseLogs.slice(responseLogs.length - 50);
      }
      return responseLogs;
    });

    if (cmd.toLowerCase() === '/cleanlogs' || cmd.toLowerCase() === '/clear') {
      setTerminalLogs([]);
    }

    setCustomBotCmd('');
  };

  // Read initial data from backend API
  const fetchAllData = async () => {
    try {
      const res = await fetch('/api/initial-data');
      const data = await res.json();
      setPackages(data?.packages || []);
      setPosts(data?.posts || []);
      setContact(data?.contact || null);
      setAnnouncement(data?.announcement || null);
    } catch (e) {
      console.error("Error loading index data", e);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (user?.uid) {
      loadUserSlips(user.uid);
    } else {
      setUserSlips([]);
    }
  }, [user?.uid]);

  // Fetch user specific slips
  const loadUserSlips = async (uid: string) => {
    try {
      const res = await fetch(`/api/slips/user/${uid}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        // Sort by submittedAt descending to ensure new VPN inbox keys and profile slips are displayed at the top
        const sortedSlips = [...data].sort((a, b) => {
          const dateA = new Date(a.submittedAt || 0).getTime();
          const dateB = new Date(b.submittedAt || 0).getTime();
          return dateB - dateA;
        });
        setUserSlips(sortedSlips);
      } else {
        setUserSlips([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch live stats in admin panel
  const fetchAdminStats = async () => {
    setAdminLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard-stats');
      const data = await res.json();
      setAdminStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin' && user?.role === 'admin') {
      fetchAdminStats();
    }
  }, [activeTab, user]);

  // Auth execution using API
  const handleAuthSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');

    if (!loginEmail) {
      setAuthError('Email ID address is required');
      return;
    }

    if (loginProvider === 'email' && (!loginPassword || loginPassword.length < 4)) {
      setAuthError('Password must be at least 4 characters long');
      return;
    }

    setIsLoginLoading(true);
    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          displayName: loginName || loginEmail.split('@')[0],
          provider: loginProvider
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUser(data.user);
        loadUserSlips(data.user.uid);
        setShowLoginModal(false);
        // Reset inputs
        setLoginEmail('');
        setLoginName('');
        setLoginPassword('');
        setAuthError('');
        
        // Redirect standard users or admin to their preferred spaces
        if (data.user?.role === 'admin' || data.user?.email?.toLowerCase() === 'chethiyabandara0001@gmail.com') {
          setActiveTab('admin');
        } else {
          setActiveTab('home');
        }
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error("Auth server error", error);
      setAuthError('Could not reach secure authentication servers.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Auth execution for registration
  const handleAuthRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');

    if (!loginEmail) {
      setAuthError('Email address is required to register');
      return;
    }

    if (!loginPassword || loginPassword.length < 4) {
      setAuthError('Password must be at least 4 characters long');
      return;
    }

    setIsLoginLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          displayName: loginName || loginEmail.split('@')[0]
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUser(data.user);
        loadUserSlips(data.user.uid);
        setShowLoginModal(false);
        // Reset inputs and mode
        setLoginEmail('');
        setLoginName('');
        setLoginPassword('');
        setAuthError('');
        setEmailAuthMode('login');
        
        // Redirect standard users or admin to their preferred spaces
        if (data.user?.role === 'admin' || data.user?.email?.toLowerCase() === 'chethiyabandara0001@gmail.com') {
          setActiveTab('admin');
        } else {
          setActiveTab('home');
        }
      } else {
        setAuthError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error("Auth server error", error);
      setAuthError('Could not reach secure authentication servers.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Auth execution using API for Google & Facebook logins
  const handleSocialFormSubmit = async (provider: 'google' | 'facebook', emailInput: string, nameInput: string) => {
    setAuthError('');
    setIsLoginLoading(true);
    setLoginProvider(provider);

    const finalEmail = emailInput.trim();
    const finalName = nameInput.trim() || finalEmail.split('@')[0];

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: finalEmail,
          displayName: finalName,
          provider: provider
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUser(data.user);
        loadUserSlips(data.user.uid);
        setShowLoginModal(false);
        setShowGoogleForm(false);
        setShowFacebookForm(false);
        // Reset inputs
        setLoginEmail('');
        setLoginName('');
        setLoginPassword('');
        setSocialEmail('');
        setSocialPassword('');
        setSocialName('');
        setAuthError('');
        
        // Redirect standard users or admin to their preferred spaces
        if (data.user?.role === 'admin' || data.user?.email?.toLowerCase() === 'chethiyabandara0001@gmail.com') {
          setActiveTab('admin');
        } else {
          setActiveTab('home');
        }
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error("Auth server error", error);
      setAuthError('Could not reach secure authentication servers.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Drag and drop setup for slip
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setBase64Slip(reader.result as string);
    };
    reader.onerror = () => {
      console.error("File processing error");
    };
    reader.readAsDataURL(file);
  };

  // User submits Slip to backend
  const handleSlipSubmission = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!selectedPackForSlip || !base64Slip) return;

    setIsSubmittingSlip(true);
    setSlipFeedback(null);

    try {
      const res = await fetch('/api/slips/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName,
          packageId: selectedPackForSlip.id,
          bankSlipBase64: base64Slip,
          tier: selectedTier
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSlipFeedback({ type: 'success', message: 'Bank payment slip submitted to administrative queue successfully! Automatic bot check processing.' });
        setBase64Slip('');
        loadUserSlips(user.uid);
        setTimeout(() => {
          setSelectedPackForSlip(null);
          setSlipFeedback(null);
        }, 4000);
      } else {
        setSlipFeedback({ type: 'error', message: data.error || 'Submission failed.' });
      }
    } catch (e) {
      setSlipFeedback({ type: 'error', message: 'Network connection error submitting slip.' });
    } finally {
      setIsSubmittingSlip(false);
    }
  };

  // Admin approves/verifies the payment
  const handleVerifySlip = async (slipId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/slips/${slipId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminNotes,
          vpnCodeOverride: customVpnCode
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setAdminNotes('');
        setCustomVpnCode('');
        fetchAdminStats();
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Convert custom package images to base64
  const handlePackImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file. (Web PNG, JPG or WEBP formats)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result && editingPack) {
        setEditingPack({
          ...editingPack,
          imageURL: event.target.result as string
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Admin save package API
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPack) return;

    try {
      const res = await fetch('/api/admin/packages/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPack)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setEditingPack(null);
        fetchAdminStats();
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin delete package API
  const handleDeletePackage = async (id: string) => {
    try {
      // Immediate optimistic update to remove from UI instantly
      setPackages(prev => prev.filter(p => p.id !== id));
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchAdminStats();
        if (data.packages) {
          setPackages(data.packages);
        } else {
          fetchAllData();
        }
      } else {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
      fetchAllData();
    }
  };

  // Admin save post API
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    try {
      const res = await fetch('/api/admin/posts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPost)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setEditingPost(null);
        fetchAdminStats();
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin delete post API
  const handleDeletePost = async (id: string) => {
    try {
      // Immediate optimistic update to remove news, blog, draft, layout, guide or post index from UI instantly
      setPosts(prev => prev.filter(p => p.id !== id));
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchAdminStats();
        if (data.posts) {
          setPosts(data.posts);
        } else {
          fetchAllData();
        }
      } else {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
      fetchAllData();
    }
  };

  // Admin update bandwidth API
  const handleUpdateBandwidth = async () => {
    if (!selectedUserIdForBandwidth) return;
    try {
      const res = await fetch('/api/admin/users/save-bandwidth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: selectedUserIdForBandwidth,
          totalGB: adminUserTotalGB,
          usedGB: adminUserUsedGB
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSelectedUserIdForBandwidth('');
        fetchAdminStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePromoteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteEmail.trim()) return;
    setAdminManageMessage(null);
    try {
      const res = await fetch('/api/admin/users/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: promoteEmail.trim() })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setPromoteEmail('');
        setAdminManageMessage({ type: 'success', text: data.message });
        fetchAdminStats();
        fetchAllData();
      } else {
        setAdminManageMessage({ type: 'error', text: data.error || 'Failed to promote member to Admin' });
      }
    } catch (err: any) {
      console.error(err);
      setAdminManageMessage({ type: 'error', text: String(err) });
    }
  };

  const handleDemoteAdmin = async (uid: string) => {
    if (!confirm("Are you sure you want to revoke Admin rights and demote this user?")) return;
    setAdminManageMessage(null);
    try {
      const res = await fetch('/api/admin/users/demote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setAdminManageMessage({ type: 'success', text: data.message });
        fetchAdminStats();
        fetchAllData();
      } else {
        setAdminManageMessage({ type: 'error', text: data.error || 'Failed to demote Administrator' });
      }
    } catch (err: any) {
      console.error(err);
      setAdminManageMessage({ type: 'error', text: String(err) });
    }
  };

  // Admin update Contact API
  const handleSaveContactDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    try {
      const res = await fetch('/api/admin/contact/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingContact)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setEditingContact(null);
        fetchAdminStats();
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin update Announcement info
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnounce) return;
    try {
      const res = await fetch('/api/admin/announcement/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAnnounce)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setEditingAnnounce(null);
        fetchAdminStats();
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Simple VPN image path matcher state machine
  const getVpnBanner = (typeName: string) => {
    switch (typeName) {
      case 'WireGuard':
        return 'https://images.unsplash.com/photo-1601597111158-2fceff270190?auto=format&fit=crop&w=600&q=80';
      case 'Vmess':
        return 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80';
      case 'SSH':
        return 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80';
      default:
        return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
        {/* Glow ambient design backdrops */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10 space-y-8"
        >
          {/* Logo / Title Block */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl shadow-indigo-500/10 shadow-lg justify-center items-center">
              <Shield className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Janu Cyber Pack</h1>
              <p className="text-xs text-slate-400 tracking-wide font-mono">⚡ CYBERNETIC INSTANT VPN NETWORK ⚡</p>
            </div>
          </div>

          {/* Login container Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">Access Gate Identity</h2>
              <p className="text-xs text-slate-400">Login securely via your preferred connection below</p>
            </div>

            {/* Email Authentication Mode Selector Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setEmailAuthMode('login');
                  setAuthError('');
                }}
                className={`py-2 text-[11px] font-bold rounded-lg uppercase transition-all cursor-pointer ${
                  emailAuthMode === 'login'
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-505/10 shadow-sm'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailAuthMode('register');
                  setAuthError('');
                }}
                className={`py-2 text-[11px] font-bold rounded-lg uppercase transition-all cursor-pointer ${
                  emailAuthMode === 'register'
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-505/10 shadow-sm'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                Register
              </button>
            </div>

            {authError && (
              <div className="p-3.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-xl flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="font-medium">{authError}</p>
              </div>
            )}

            {/* Simulated Authenticator Form */}
            <form onSubmit={emailAuthMode === 'login' ? handleAuthSignIn : handleAuthRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  {emailAuthMode === 'login' ? 'SECURE ACCOUNT EMAIL:' : 'REGISTRATION EMAIL ADDRESS:'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. user@domain.com"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      setLoginProvider('email');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/80 rounded-xl pl-10 pr-4 py-3 text-xs text-white transition outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  {emailAuthMode === 'login' ? 'SECURE ACCESS PASSWORD:' : 'CREATE SECURE PASSWORD:'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginProvider('email');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/80 rounded-xl pl-10 pr-4 py-3 text-xs text-white transition outline-none"
                  />
                </div>
              </div>

              {emailAuthMode === 'register' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">DISPLAY NICKNAME (OPTIONAL):</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/80 rounded-xl px-4 py-3 text-xs text-white transition outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoginLoading}
                className="w-full py-3 font-bold bg-indigo-500 hover:bg-indigo-650 text-white text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow shadow-indigo-500/15 font-mono"
              >
                {isLoginLoading && loginProvider === 'email' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> {emailAuthMode === 'login' ? 'VERIFYING ID SYSTEM KEYS...' : 'CREATING SECURITY PROFILE...'}
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> 
                    {emailAuthMode === 'login' ? 'Secure Account Login' : 'Register New Account'}
                  </>
                )}
              </button>
            </form>

            {/* Quick social authentication section */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-[10px] tracking-widest uppercase font-mono">Or connect with</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isLoginLoading}
                onClick={() => {
                  setSocialEmail(loginEmail || '');
                  setSocialPassword('');
                  setSocialName('');
                  setAuthError('');
                  setShowGoogleForm(true);
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/30 rounded-xl text-xs font-semibold text-slate-200 transition cursor-pointer disabled:opacity-50"
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Google Account</span>
              </button>

              <button
                type="button"
                disabled={isLoginLoading}
                onClick={() => {
                  setSocialEmail(loginEmail || '');
                  setSocialPassword('');
                  setSocialName('');
                  setAuthError('');
                  setShowFacebookForm(true);
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/30 rounded-xl text-xs font-semibold text-slate-200 transition cursor-pointer disabled:opacity-50"
              >
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Facebook Identity</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl text-[10px] text-slate-400 leading-normal text-center font-mono border border-slate-800/50">
              💡 <span className="text-slate-300">Form Gateway</span>: Click Google or Facebook to load their respective secure access input flows. Passwords are encrypted on-the-fly for optimal connection confidentiality.
            </div>
          </div>

          <div className="text-center">
            <p className="text-[11px] text-slate-500 font-sans">
              🔒 Encrypted authentication keys. Secure Sandbox Client.
            </p>
          </div>
        </motion.div>

        {/* GOOGLE SIGN-IN INTERACTIVE MOCK FORM */}
        <AnimatePresence>
          {showGoogleForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 overflow-hidden font-sans p-8 sm:p-10 flex flex-col relative"
              >
                <button 
                  onClick={() => setShowGoogleForm(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Google Logo */}
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>

                  <div>
                    <h2 className="text-xl font-medium text-slate-900 tracking-tight font-sans">Sign in with Google</h2>
                    <p className="text-xs text-slate-500 mt-1 font-sans">to continue to Janu Cyber Pack Platform</p>
                  </div>
                </div>

                {authError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-650 rounded-lg text-xs font-semibold leading-normal border border-red-200">
                    {authError}
                  </div>
                )}

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!socialEmail.trim()) {
                      setAuthError('Please enter an email address');
                      return;
                    }
                    handleSocialFormSubmit('google', socialEmail, socialName);
                  }}
                  className="mt-8 space-y-5"
                >
                  <div className="space-y-1">
                    <div className="relative border border-slate-300 focus-within:border-[#1a73e8] focus-within:ring-1 focus-within:ring-[#1a73e8] bg-white rounded-lg px-3 py-2 transition-all">
                      <label className="block text-[10px] text-slate-500 font-medium select-none uppercase tracking-wide">
                        Email or phone
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. user@gmail.com"
                        value={socialEmail}
                        onChange={(e) => setSocialEmail(e.target.value)}
                        className="w-full bg-transparent border-0 outline-none text-[13px] text-slate-800 focus:ring-0 p-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="relative border border-slate-300 focus-within:border-[#1a73e8] focus-within:ring-1 focus-within:ring-[#1a73e8] bg-white rounded-lg px-3 py-2 transition-all">
                      <label className="block text-[10px] text-slate-500 font-medium select-none uppercase tracking-wide">
                        Enter your password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={socialPassword}
                        onChange={(e) => setSocialPassword(e.target.value)}
                        className="w-full bg-transparent border-0 outline-none text-[13px] text-slate-800 focus:ring-0 p-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="relative border border-slate-200 hover:border-slate-300 bg-white rounded-lg px-3 py-1.5 transition-all">
                      <label className="block text-[9px] text-slate-400 font-medium select-none uppercase">
                        Profile Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Guest User"
                        value={socialName}
                        onChange={(e) => setSocialName(e.target.value)}
                        className="w-full bg-transparent border-0 outline-none text-[12px] text-slate-700 focus:ring-0 p-0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-semibold text-[#1a73e8] hover:text-[#175cc0] transition cursor-pointer">
                      Forgot email?
                    </span>

                    <button
                      type="submit"
                      disabled={isLoginLoading}
                      className="bg-[#1a73e8] hover:bg-[#155fc4] disabled:bg-slate-400 text-white font-medium text-xs px-6 py-2.5 rounded shadow hover:shadow-md transition cursor-pointer flex items-center gap-2"
                    >
                      {isLoginLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Next'
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="hover:text-slate-700 transition cursor-pointer">Create account</span>
                  <span className="flex gap-3">
                    <span className="hover:text-slate-700 transition cursor-pointer">Help</span>
                    <span className="hover:text-slate-700 transition cursor-pointer">Privacy</span>
                  </span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* FACEBOOK SIGN-IN INTERACTIVE MOCK FORM */}
        <AnimatePresence>
          {showFacebookForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-[#f0f2f5] text-slate-800 rounded-xl shadow-2xl border border-slate-350 overflow-hidden font-sans flex flex-col relative"
              >
                <button 
                  onClick={() => setShowFacebookForm(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-200 rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Blue header mimicking Facebook identity */}
                <div className="bg-[#1877f2] p-4 text-center">
                  <h1 className="text-2xl font-black text-white tracking-tight">facebook</h1>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <div className="text-center space-y-1">
                    <h2 className="text-md font-semibold text-slate-800">Log in to Facebook</h2>
                    <p className="text-xs text-slate-500">To secure connection with Janu Cyber Pack service</p>
                  </div>

                  {authError && (
                    <div className="p-3 bg-red-105 border border-red-300 rounded text-xs text-red-700 leading-normal font-semibold">
                      {authError}
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!socialEmail.trim()) {
                        setAuthError('Email or mobile number is required.');
                        return;
                      }
                      handleSocialFormSubmit('facebook', socialEmail, socialName);
                    }}
                    className="space-y-4"
                  >
                    <input
                      type="email"
                      required
                      placeholder="Email address or phone number"
                      value={socialEmail}
                      onChange={(e) => setSocialEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] rounded-lg px-3 py-3 text-sm text-slate-900 shadow-sm outline-none transition"
                    />

                    <input
                      type="password"
                      required
                      placeholder="Password"
                      value={socialPassword}
                      onChange={(e) => setSocialPassword(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] rounded-lg px-3 py-3 text-sm text-slate-900 shadow-sm outline-none transition"
                    />

                    <input
                      type="text"
                      placeholder="Full Name / Display Nickname (Optional)"
                      value={socialName}
                      onChange={(e) => setSocialName(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] rounded-lg px-3 py-2 text-xs text-slate-700 shadow-sm outline-none transition"
                    />

                    <button
                      type="submit"
                      disabled={isLoginLoading}
                      className="w-full bg-[#1877f2] hover:bg-[#166fe5] disabled:bg-slate-400 text-white font-bold py-3 px-4 rounded-lg tracking-wide text-sm transition shadow cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isLoginLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Logging In...
                        </>
                      ) : (
                        'Log In'
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <span className="text-[#1877f2] hover:underline cursor-pointer text-xs">Forgotten password?</span>
                    </div>
                  </form>

                  <div className="pt-4 border-t border-slate-200 text-center">
                    <button
                      type="button"
                      className="bg-[#42b72a] hover:bg-[#36a420] text-white font-bold text-xs px-4 py-2.5 rounded-md transition shadow cursor-pointer"
                    >
                      Create New Account
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans flex flex-col md:flex-row selection:bg-indigo-500 selection:text-white">
      {/* SIDEBAR NAVIGATION - VISIBLE ON DESKTOP */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col shrink-0 min-h-screen text-slate-400">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-indigo-500/20 shadow">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white font-mono">Janu Cyber Pack</h1>
              <p className="text-[9px] text-[#ff007f] tracking-wider font-semibold">⚡ CYBERPACK GATEWAY ⚡</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full py-2.5 px-4 rounded-lg flex items-center gap-3 font-medium transition text-left cursor-pointer text-xs ${
              activeTab === 'home' 
                ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/10' 
                : 'hover:bg-slate-800/60 hover:text-slate-200 text-slate-400'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Overview & News
          </button>
          
          <button
            onClick={() => setActiveTab('packages')}
            className={`w-full py-2.5 px-4 rounded-lg flex items-center gap-3 font-medium transition text-left cursor-pointer text-xs ${
              activeTab === 'packages' 
                ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/10' 
                : 'hover:bg-slate-800/60 hover:text-slate-200 text-slate-400'
            }`}
          >
            <Layers className="w-4 h-4" />
            VPN Subscriptions
          </button>
          
          {user && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full py-2.5 px-4 rounded-lg flex items-center gap-3 font-medium transition text-left cursor-pointer text-xs ${
                activeTab === 'dashboard' 
                  ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/10' 
                  : 'hover:bg-slate-800/60 hover:text-slate-200 text-slate-400'
              }`}
            >
              <Server className="w-4 h-4" />
              My Account
            </button>
          )}

          {user?.role === 'admin' && (
            <div className="pt-6">
              <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Tools</p>
              <button
                onClick={() => setActiveTab('admin')}
                className={`w-full py-2.5 px-4 rounded-lg flex items-center gap-3 font-medium transition text-left cursor-pointer text-xs ${
                  activeTab === 'admin' 
                    ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/10' 
                    : 'hover:bg-slate-800/60 hover:text-slate-200 text-slate-400'
                }`}
              >
                <Database className="w-4 h-4 text-amber-500" />
                Admin Panel ⭐
              </button>
            </div>
          )}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800 mt-auto">
          {user ? (
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs uppercase shadow-sm">
                {user.displayName.substring(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-200 truncate">{user.displayName}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="px-2">
              <p className="text-[10px] text-slate-500">Guest Session Mode</p>
              <button
                onClick={() => {
                  setLoginProvider('email');
                  setShowLoginModal(true);
                }}
                className="mt-1 text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign in to start
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT SIDE MAIN VIEW WRAPPER */}
      <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-50 overflow-hidden">
        
        {/* HEADER BAR */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 sm:px-8 bg-slate-950 sticky top-0 z-40 shrink-0 backdrop-blur">
          <div className="flex items-center gap-3">
            {/* Mobile block logo */}
            <div className="flex md:hidden items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="text-md font-bold tracking-tight text-white font-mono">Janu Cyber Pack</h1>
            </div>
            
            <h2 className="hidden md:block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              System Overview / <span className="text-slate-100">{activeTab}</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Inline Theme Selection Controls */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-850 p-1 rounded-xl">
              <button
                onClick={() => setTheme('cyberpunk-dark')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer text-[10px] uppercase font-mono font-bold flex items-center gap-1 ${
                  theme === 'cyberpunk-dark'
                    ? 'bg-indigo-500 text-white shadow shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Cyberpunk Dark Mode"
              >
                🌌 <span className="hidden sm:inline">Dark</span>
              </button>
              <button
                onClick={() => setTheme('cyberpunk-light')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer text-[10px] uppercase font-mono font-bold flex items-center gap-1 ${
                  theme === 'cyberpunk-light'
                    ? 'bg-indigo-500 text-white shadow shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Cyberpunk Light Mode"
              >
                ☀️ <span className="hidden sm:inline">Light</span>
              </button>
              <button
                onClick={() => setTheme('acid-volt')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer text-[10px] uppercase font-mono font-bold flex items-center gap-1 ${
                  theme === 'acid-volt'
                    ? 'bg-indigo-500 text-white shadow shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Radioactive Acid Volt Theme"
              >
                ☣️ <span className="hidden sm:inline">Volt</span>
              </button>
              <button
                onClick={() => setTheme('neon-blue')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer text-[10px] uppercase font-mono font-bold flex items-center gap-1 ${
                  theme === 'neon-blue'
                    ? 'bg-indigo-500 text-white shadow shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Cosmic Tron Neon Blue Theme"
              >
                🌐 <span className="hidden sm:inline">Blue</span>
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-3 bg-slate-900 py-1.5 pl-3 pr-2 rounded-xl border border-slate-850">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-white truncate max-w-28">{user.displayName}</p>
                  <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">
                    {user.role} Account
                  </p>
                </div>
                <button
                  onClick={() => { setUser(null); setActiveTab('home'); }}
                  className="px-3 py-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setLoginProvider('email');
                  setShowLoginModal(true);
                }}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-indigo-500 hover:bg-indigo-600 transition-all flex items-center gap-2 cursor-pointer shadow-indigo-900/50 shadow-md"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* MOBILE NAVIGATION PILLS */}
        <div className="md:hidden flex space-x-1 px-4 py-2 bg-slate-900 border-b border-slate-800 justify-center">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition ${activeTab === 'home' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' : 'text-slate-400'}`}
          >
            News
          </button>
          <button 
            onClick={() => setActiveTab('packages')}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition ${activeTab === 'packages' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' : 'text-slate-400'}`}
          >
            VPN List
          </button>
          {user && (
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition ${activeTab === 'dashboard' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' : 'text-slate-400'}`}
            >
              My Account
            </button>
          )}
          {user?.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition ${activeTab === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'text-amber-500'}`}
            >
              Admin ⭐
            </button>
          )}
        </div>

        {/* CORE ANNOUNCEMENT JUMBOTRON */}
        {announcement?.showAnnouncement && activeTab === 'home' && (
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-6 py-5 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0 mt-0.5 border border-indigo-500/10">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{announcement.title}</h3>
                  <p className="text-xs text-indigo-300 font-medium mt-0.5">{announcement.subtitle}</p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{announcement.announcementText}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('packages')}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg shrink-0 transition-colors shadow-lg shadow-indigo-500/10 cursor-pointer"
              >
                Order Internet VPN Package Now
              </button>
            </div>
          </div>
        )}

      {/* APP CONTENT BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: OVERVIEW & NEW POSTS */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Active Subscriptions Validity Tracker */}
            {user && (() => {
              const activeSubscriptions = userSlips
                .filter(slip => slip.status === 'approved' && slip.verifiedAt)
                .map(slip => {
                  const pkg = packages.find(p => p.id === slip.packageId);
                  const validityDays = pkg?.validityDays || 30;
                  const approvedTime = new Date(slip.verifiedAt!).getTime();
                  const expiryTime = approvedTime + (validityDays * 24 * 60 * 60 * 1000);
                  const currentTime = Date.now();
                  const msRemaining = expiryTime - currentTime;
                  const daysLeft = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
                  const percentage = Math.max(0, Math.min(100, (daysLeft / validityDays) * 100));
                  
                  return {
                    slipId: slip.id,
                    title: slip.packageTitle,
                    vpnTypeName: slip.vpnTypeName,
                    validityDays,
                    daysLeft,
                    percentage,
                    isActive: daysLeft > 0
                  };
                })
                .filter(sub => sub.isActive);

              if (activeSubscriptions.length === 0) return null;

              return (
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl animate-fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                        Active Subscription Validity Tracker
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Circular responsive countdown representing validation days remaining on active purchases</p>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 font-mono font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 rounded-full">
                      {activeSubscriptions.length} Active Plan{activeSubscriptions.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeSubscriptions.map((sub) => {
                      const radius = 24;
                      const strokeWidth = 5;
                      const circumference = 2 * Math.PI * radius;
                      const strokeDashoffset = circumference - (sub.percentage / 100) * circumference;

                      return (
                        <div 
                          key={sub.slipId} 
                          className="bg-slate-950 p-4.5 rounded-xl flex items-center justify-between gap-3 border border-slate-850 hover:border-indigo-500/20 transition group"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/15">
                              {sub.vpnTypeName}
                            </span>
                            <h4 className="text-xs font-bold text-white mt-2 truncate" title={sub.title}>
                              {sub.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Duration: <span className="text-slate-200 font-semibold">{sub.validityDays} Days</span>
                            </p>
                            <p className="text-[9px] text-slate-500 mt-0.5 font-mono">
                              {sub.daysLeft} days remaining ({Math.round(sub.percentage)}%)
                            </p>
                          </div>

                          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="28"
                                cy="28"
                                r={radius}
                                className="stroke-slate-850"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                              />
                              <motion.circle
                                cx="28"
                                cy="28"
                                r={radius}
                                className="stroke-indigo-500 group-hover:stroke-indigo-400 transition-colors"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center font-mono leading-none">
                              <span className="text-xs font-black text-white">{sub.daysLeft}</span>
                              <span className="text-[7px] text-slate-500 mt-0.5 uppercase tracking-tighter">Days</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main posts sections (Featured, Recent, News) */}
            <div className="lg:col-span-2 space-y-8">
              
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Latest Announcements & Guides</h2>
                  <p className="text-xs text-slate-400">Discover setups, network updates, and Stealth tunnel configurations</p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg">
                  Total Posts: {posts.length}
                </span>
              </div>

              {posts.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
                  <p className="text-slate-400 text-sm">No documentation published yet. Sign in as admin to push content.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <article 
                      key={post.id} 
                      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all p-6 group animate-fade-in"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded uppercase ${
                          post.category === 'featured' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' :
                          post.category === 'recent' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' :
                          'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}>
                          {post.category}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{post.date}</span>
                        <span className="text-xs text-slate-500">By {post.author}</span>
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors mt-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="mt-4 p-4 bg-slate-950 rounded-xl text-xs text-slate-300 space-y-2 whitespace-pre-wrap font-sans border-l-3 border-indigo-500">
                        {post.content}
                      </div>

                      {post.imageURL && (
                        <div className="mt-4 rounded-xl overflow-hidden max-h-48 border border-slate-800">
                          <img src={post.imageURL} alt={post.title} className="w-full object-cover" />
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar section: Quick Stats and secure contacts */}
            <div className="space-y-6">
              
              {/* Secure Contact channels */}
              {contact && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold text-white font-mono border-b border-slate-800 pb-2 uppercase tracking-wider">SECURE CONTACT CHANNELS</h4>
                  
                  <div className="space-y-3 text-xs text-slate-300">
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-200">Hotline Support</p>
                        <p className="text-slate-400 font-mono">{contact.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-200">Administrative Email</p>
                        <p className="text-slate-400 font-mono break-all">{contact.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Send className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-200">Telegram Channel</p>
                        <a 
                          href={contact.telegramChannel} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-indigo-400 font-mono flex items-center gap-1 hover:underline"
                        >
                          Channel Link <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Server className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-200">VPN Tele_Bot User</p>
                        <p className="text-indigo-400 font-mono">{contact.telegramBotUser}</p>
                      </div>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800">
                      <p className="font-bold uppercase tracking-wider text-slate-400">Live Hours</p>
                      <p className="mt-0.5">{contact.workingHours}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bot Info Jumbotron */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20">
                  <Volume2 className="w-6 h-6 animate-pulse" />
                </div>
                <h5 className="text-sm font-bold text-white font-sans">Telegram Bot Live Integration</h5>
                <p className="text-xs text-slate-400">
                  Select a VPN package from our listing, complete your payment externally, and submit your bank slip. Our system will fetch the dynamic VPN configuration codes utilizing standard Bot API hooks.
                </p>
                <div className="inline-block px-3 py-1 bg-slate-950 border border-indigo-500/20 text-indigo-300 text-[10px] rounded font-mono">
                  BOT API TELEGRAM SECURED
                </div>
              </div>

            </div>

          </div>

          </div>
        )}

        {/* TAB 2: VPN SUBSCRIPTIONS & PACKAGE CARDS */}
        {activeTab === 'packages' && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Stealth Unlimited Data Subscriptions</h2>
              <p className="text-xs text-slate-400">Guaranteed unthrottled downloads, high stability gaming lines, and encrypted stealth tunnels</p>
            </div>

            {packages.filter(pkg => pkg.status === 'active').length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center">
                <p className="text-slate-400">No active internet packages available. Please contact administrator.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.filter(pkg => pkg.status === 'active').map((pkg) => (
                  <div 
                    key={pkg.id} 
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all flex flex-col group relative"
                  >
                    {/* VPN Badge stamp */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="px-3 py-1 bg-slate-950/90 text-indigo-400 border border-indigo-500/20 rounded-full font-mono text-xs font-bold uppercase shadow-lg">
                        {pkg.vpnTypeName}
                      </span>
                    </div>

                    {/* Image section */}
                    <div className="h-44 relative bg-slate-950 overflow-hidden">
                      <img 
                        src={pkg.imageURL || getVpnBanner(pkg.vpnTypeName)} 
                        alt={pkg.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                    </div>

                    {/* Package details body */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors mt-1 line-clamp-1">
                        {pkg.title}
                      </h3>
                      
                      {/* ISP and package selection badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="px-2 py-0.5 bg-slate-950 text-indigo-300 font-bold rounded text-[9px] font-mono border border-indigo-500/10 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                          📶 {pkg.isp || 'Dialog'}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-950 text-amber-300 font-bold rounded text-[9px] font-mono border border-amber-500/10 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          ⚡ {pkg.packageType || 'Mobile'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-2.5 flex-1 line-clamp-3 leading-relaxed">
                        {pkg.description}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono pt-4 border-t border-slate-800/60">
                        <div className="bg-slate-950 p-2.5 rounded-lg text-center border border-slate-800/40">
                          <p className="text-slate-500 text-[9px]">CAPACITY/SPEED</p>
                          <p className="text-slate-200 font-bold mt-0.5">{pkg.bandwidthGB}</p>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg text-center border border-slate-800/40">
                          <p className="text-slate-500 text-[9px]">VALIDITY</p>
                          <p className="text-slate-200 font-bold mt-0.5">{pkg.validityDays} Days</p>
                        </div>
                      </div>

                      {/* Cash Counter */}
                      <div className="mt-6 flex items-baseline justify-between pt-2">
                        <div>
                          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Monthly Service Fee</p>
                          <p className="text-2xl font-bold text-indigo-400 font-mono mt-0.5">
                            {pkg.priceCurrency} {pkg.price.toLocaleString()}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => {
                            if (!user) {
                              setShowLoginModal(true);
                              return;
                            }
                            setSelectedPackForSlip(pkg);
                          }}
                          className="px-4 py-2 font-bold text-xs text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/10"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Buy Package
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USER SUBSCRIPTIONS AND STATE MONITOR */}
        {activeTab === 'dashboard' && user && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold tracking-tight text-white mb-1">User Subscriptions & Usage Tracker</h2>
              <p className="text-xs text-slate-400">Review your activated VPN config profiles, live simulation statistics, and slip status</p>
            </div>

            {/* Simulated Live VPN Telemetry Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Secure Configurations Inbox */}
              <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span>📥 VPN INBOX & PROFILE KEYS</span>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">SYSTEM DIRECT</span>
                </h3>

                <div className="mt-6 space-y-4">
                  {userSlips.filter(s => s.status === 'approved').length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-400/60 font-mono space-y-4">
                      <Inbox className="w-10 h-10 mx-auto text-slate-705 mb-3" />
                      <p>Your verified subscription keys and configuration profiles will appear here.</p>
                      <p className="text-[11px] mt-1 text-indigo-400">Submit a bank slip receipt on packages tab and wait for approval.</p>
                    </div>
                  ) : (
                    userSlips.filter(s => s.status === 'approved').map((approvedSlip) => (
                      <div key={approvedSlip.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="p-1 px-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-xs font-bold uppercase">
                              {approvedSlip.vpnTypeName} Verified
                            </span>
                            <span className="text-xs font-bold text-slate-200 mt-0.5">{approvedSlip.packageTitle}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">Verified: {approvedSlip.verifiedAt ? new Date(approvedSlip.verifiedAt).toLocaleDateString() : 'N/A'}</span>
                        </div>

                        <p className="text-xs text-slate-400 mb-2">Copy the config configuration file code directly to your Wireguard or V2Ray agent application:</p>
                        
                        <div className="bg-slate-900 p-4 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800/80 max-h-56 select-all">
                          <pre>{approvedSlip.vpnCode}</pre>
                        </div>

                        <div className="mt-3 flex justify-between items-center text-[11px] text-slate-400 pt-3 border-t border-slate-800/50">
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Bot Service Synced
                          </span>
                          <span>Admin notes: {approvedSlip.adminNotes || "Enjoy your premium VPN connection"}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Receipt and Slip histories */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
                📋 SUBMITTED TRANSACTIONS HISTORY
              </h3>

              <div className="mt-6 overflow-x-auto">
                {userSlips.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">No bank slips submitted from your user account yet.</p>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-800 font-mono">
                        <th className="pb-3 font-semibold">Slip ID</th>
                        <th className="pb-3 font-semibold">Package Selection</th>
                        <th className="pb-3 font-semibold">Price</th>
                        <th className="pb-3 font-semibold">Submitted Date</th>
                        <th className="pb-3 font-semibold text-center">Status</th>
                        <th className="pb-3 font-semibold text-right">View Attachment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 font-mono">
                      {userSlips.map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.01]">
                          <td className="py-4 text-indigo-400 font-bold">{s.id.split('_')[1]}</td>
                          <td className="py-4 font-sans text-slate-200 font-medium">{s.packageTitle}</td>
                          <td className="py-4 font-bold text-slate-350">{s.currency} {s.price}</td>
                          <td className="py-4 text-slate-400">{new Date(s.submittedAt).toLocaleDateString()}</td>
                          <td className="py-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-black ${
                              s.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                              s.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                              'bg-rose-500/10 text-rose-400'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <a 
                              href={s.bankSlipBase64} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-indigo-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              Open Slip File <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: ADMINISTRATIVE COMMAND CENTER */}
        {activeTab === 'admin' && user?.role === 'admin' && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-400" />
                  DATA STORE CONTROL PANEL
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Track analytical user logs, verify slip triggers, create dynamic news and manager packages</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={fetchAdminStats}
                  className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reload Stats
                </button>
              </div>
            </div>

            {/* Quick KPI stats row */}
            {adminStats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Estimated Users Total</p>
                  <p className="text-3xl font-bold text-white mt-1">{adminStats.totalUsers}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Total Sales Approved</p>
                  <p className="text-3xl font-bold text-emerald-400 mt-1">LKR {adminStats.totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">Pending Slips Queue</p>
                  <p className="text-3xl font-bold text-amber-400 mt-1">{adminStats.pendingCount}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-[10px] text-indigo-450 text-indigo-400 font-mono uppercase tracking-wider">Approved Deliveries</p>
                  <p className="text-3xl font-bold text-indigo-400 mt-1">{adminStats.approvedCount}</p>
                </div>
              </div>
            )}

            {/* 1. VERIFY SLIPS QUEUE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                  🚨 Bank Slips Queue for Manual Check
                </h3>

                {/* Filter pills */}
                <div className="flex space-x-1.5 font-mono">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSlipVerificationFilter(opt)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg uppercase transition cursor-pointer ${
                        slipVerificationFilter === opt ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {!adminStats || adminStats.slips.length === 0 ? (
                <p className="text-xs text-slate-400 font-mono py-8 text-center">No payment slips uploaded in DB store yet.</p>
              ) : (
                <div className="mt-6 space-y-6">
                  {adminStats.slips
                    .filter((s: any) => slipVerificationFilter === 'all' || s.status === slipVerificationFilter)
                    .map((slip: any) => (
                      <div key={slip.id} className="bg-slate-950 border border-slate-850 rounded-xl p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        {/* Slip Image Thumbnail */}
                        <div className="lg:col-span-3">
                          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-wider mb-2 font-semibold">Uploaded Receipt Image</p>
                          <a href={slip.bankSlipBase64} target="_blank" rel="noreferrer" className="block relative h-48 sm:h-56 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden group">
                            <img src={slip.bankSlipBase64} alt="Slip" className="w-full h-full object-contain group-hover:scale-105 transition" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition">
                              Click to fullsize <ExternalLink className="w-3.5 h-3.5 ml-1" />
                            </div>
                          </a>
                        </div>

                        {/* Slip analytical data fields */}
                        <div className="lg:col-span-4 space-y-2 text-xs font-mono">
                          <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Transaction Attributes</p>
                          <div className="flex justify-between py-1 border-b border-slate-800/40">
                            <span className="text-slate-400 font-sans">Slip ID:</span>
                            <span className="text-white hover:underline">{slip.id}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-800/40">
                            <span className="text-slate-400 font-sans">User Client:</span>
                            <span className="text-indigo-400 font-sans font-semibold">{slip.userName} ({slip.userEmail})</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-800/40">
                            <span className="text-slate-400 font-sans">Target Package:</span>
                            <span className="text-white font-sans font-medium">{slip.packageTitle} ({slip.vpnTypeName})</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-800/40">
                            <span className="text-slate-400 font-sans">Cost check:</span>
                            <span className="text-[#3ee260] font-black">{slip.currency} {slip.price}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-400 font-sans">Submitted at:</span>
                            <span className="text-slate-400 font-sans">{new Date(slip.submittedAt).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Decision & verification workflow actions */}
                        <div className="lg:col-span-5 space-y-4">
                          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-wider font-bold">Actions & Output config</p>

                          {slip.status === 'pending' ? (
                            <div className="space-y-3">
                              <div>
                                <label className="text-slate-400 text-[11px] block mb-1">Administrative internal notes:</label>
                                <input
                                  type="text"
                                  placeholder="Approved Singapore Node 1 active Wireguard vpn"
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500/50 outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-slate-400 text-[11px] block mb-1">Override manual VPN Code config (Optional):</label>
                                <textarea
                                  placeholder="Leave blank to use dynamic system template"
                                  value={customVpnCode}
                                  onChange={(e) => setCustomVpnCode(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1 text-xs text-white h-12 font-mono placeholder-slate-600 focus:border-indigo-500/50 outline-none"
                                />
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleVerifySlip(slip.id, 'approved')}
                                  className="flex-1 py-2 text-xs font-bold bg-indigo-500 hover:bg-slate-100 hover:text-slate-950 text-white rounded flex items-center justify-center gap-1 cursor-pointer transition shadow-lg shadow-indigo-500/10"
                                >
                                  <Check className="w-4 h-4" /> Approve & Activation Config
                                </button>
                                <button
                                  onClick={() => handleVerifySlip(slip.id, 'rejected')}
                                  className="py-2 px-4 text-xs font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded cursor-pointer transition-all"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-2">
                              <p className="text-slate-350 flex items-center gap-1.5 font-mono">
                                <span className={`w-2 h-2 rounded-full ${slip.status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                THIS RECEIPT HAS BEEN {slip.status.toUpperCase()}
                              </p>
                              {slip.verifiedAt && <p className="text-slate-500 text-[10px] font-mono">Timestamp: {new Date(slip.verifiedAt).toLocaleString()}</p>}
                              {slip.adminNotes && <p className="text-slate-300 font-sans">Notes: {slip.adminNotes}</p>}
                              
                              {slip.vpnCode && (
                                <div className="mt-2 text-[10px]">
                                  <p className="text-slate-500 font-mono uppercase mb-1">Generated Active Code:</p>
                                  <pre className="bg-slate-950 p-2 rounded text-indigo-400 border border-slate-800 overflow-x-auto max-h-24 select-all">{slip.vpnCode}</pre>
                                </div>
                              )}
                            </div>
                          )}

                        </div>

                      </div>
                    ))}
                </div>
              )}
            </div>

                {/* 2. DYNAMIC PACKAGE DETAILS EDITOR */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  📦 Modify & Add New Packages Details
                </h3>
                <button
                  onClick={() => setEditingPack({
                    title: '',
                    description: '',
                    price: 1500,
                    priceCurrency: 'LKR',
                    validityDays: 30,
                    bandwidthGB: 'Unlimited',
                    vpnTypeName: 'WireGuard',
                    imageURL: '',
                    isFeatured: true,
                    status: 'active'
                  })}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-md shadow-indigo-500/10"
                >
                  <Plus className="w-3.5 h-3.5" /> Create New VPN Package
                </button>
              </div>

              {editingPack && (
                <form onSubmit={handleSavePackage} className="mt-6 p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-5 text-xs animate-fade-in text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-indigo-400 uppercase font-mono tracking-wide">
                      🛡️ Configurator Panel: {editingPack.id ? 'Modify Existing Package' : 'Create New Package'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditingPack(null)}
                      className="text-slate-500 hover:text-white transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Title Name / Label:</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Extreme Stealth Plus"
                        value={editingPack.title || ''}
                        onChange={(e) => setEditingPack({ ...editingPack, title: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">VPN Engine Protocol:</label>
                      <select
                        value={editingPack.vpnTypeName || 'WireGuard'}
                        onChange={(e) => setEditingPack({ ...editingPack, vpnTypeName: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white outline-none focus:border-indigo-500/50"
                      >
                        <option value="WireGuard">WireGuard</option>
                        <option value="Vmess">Vmess</option>
                        <option value="SSH">SSH</option>
                        <option value="Trojan">Trojan</option>
                        <option value="V2Ray">V2Ray</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Bandwidth Limit:</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Unlimited or 150 GB"
                        value={editingPack.bandwidthGB || ''}
                        onChange={(e) => setEditingPack({ ...editingPack, bandwidthGB: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Target Telecom ISP Carrier:</label>
                      <select
                        value={editingPack.isp || 'Dialog'}
                        onChange={(e) => setEditingPack({ ...editingPack, isp: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white outline-none focus:border-indigo-500/50"
                      >
                        <option value="Dialog">Dialog</option>
                        <option value="Mobitel">Mobitel</option>
                        <option value="Hutch">Hutch</option>
                        <option value="Airtel">Airtel</option>
                        <option value="SLT">SLT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Line / Package Connection Type:</label>
                      <select
                        value={editingPack.packageType || 'Mobile'}
                        onChange={(e) => setEditingPack({ ...editingPack, packageType: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white outline-none focus:border-indigo-500/50"
                      >
                        <option value="Mobile">Mobile</option>
                        <option value="Router">Router</option>
                        <option value="Fiber">Fiber</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Fee Price Rate:</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={editingPack.price || 0}
                        onChange={(e) => setEditingPack({ ...editingPack, price: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Currency Code:</label>
                      <input
                        type="text"
                        required
                        placeholder="LKR or USD"
                        value={editingPack.priceCurrency || 'LKR'}
                        onChange={(e) => setEditingPack({ ...editingPack, priceCurrency: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Validity (Days):</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={editingPack.validityDays || 30}
                        onChange={(e) => setEditingPack({ ...editingPack, validityDays: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Subscription Status:</label>
                      <select
                        value={editingPack.status || 'active'}
                        onChange={(e) => setEditingPack({ ...editingPack, status: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white outline-none focus:border-indigo-500/50"
                      >
                        <option value="active">Active (Available to buy)</option>
                        <option value="inactive">Inactive (Disabled / Hidden)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
                    {/* Featured toggle option */}
                    <div className="md:col-span-4 select-none">
                      <label className="block text-slate-400 mb-2 font-semibold">Promote on Home tab:</label>
                      <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-800 transition">
                        <input
                          type="checkbox"
                          checked={!!editingPack.isFeatured}
                          onChange={(e) => setEditingPack({ ...editingPack, isFeatured: e.target.checked })}
                          className="w-4 h-4 text-indigo-500 rounded focus:ring-indigo-500 focus:ring-offset-0 bg-slate-950 border-slate-800"
                        />
                        <div>
                          <p className="text-white font-semibold">Featured Package State</p>
                          <p className="text-[10px] text-slate-500">Highlight badge for clients</p>
                        </div>
                      </label>
                    </div>

                    {/* Integrated dual-mode secure Image uploader */}
                    <div className="md:col-span-8">
                      <label className="block text-slate-400 mb-1.5 font-semibold">Custom Banner Image (Upload graphics OR paste Direct Link):</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div 
                          onDragOver={(e) => { e.preventDefault(); setIsPackDragOver(true); }}
                          onDragLeave={() => setIsPackDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsPackDragOver(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handlePackImageUpload(e.dataTransfer.files[0]);
                            }
                          }}
                          onClick={() => document.getElementById('pack-image-input-file')?.click()}
                          className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition select-none min-h-[90px] ${
                            isPackDragOver 
                              ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                              : 'border-slate-800 hover:border-indigo-500/30 bg-slate-900 text-slate-400 hover:bg-slate-850'
                          }`}
                        >
                          <input
                            type="file"
                            id="pack-image-input-file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handlePackImageUpload(e.target.files[0]);
                              }
                            }}
                          />
                          {editingPack.imageURL && (editingPack.imageURL.startsWith('data:') || editingPack.imageURL.length > 200) ? (
                            <div className="flex items-center gap-3">
                              <img 
                                src={editingPack.imageURL} 
                                alt="Package display preview" 
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 object-cover rounded-lg border border-slate-700 shadow-sm"
                              />
                              <div className="text-left">
                                <p className="text-[11px] font-bold text-emerald-400">File loaded successfully</p>
                                <button 
                                  type="button"
                                  className="text-[10px] text-rose-450 text-rose-400 font-semibold hover:underline block" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingPack({ ...editingPack, imageURL: '' });
                                  }}
                                >
                                  Clear Preview
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <Upload className="w-4 h-4 mx-auto text-indigo-400 animate-pulse" />
                              <p className="text-[11px] text-slate-300">Drag & drop / click to Upload File</p>
                              <p className="text-[9px] text-slate-500">Local formats: JPG, WEBP, PNG</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col justify-center space-y-1">
                          <p className="text-[10px] text-slate-400 font-medium">Or input standard web HTTP graphic file link:</p>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/promo..."
                            value={editingPack.imageURL || ''}
                            onChange={(e) => setEditingPack({ ...editingPack, imageURL: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-[11px] text-white font-mono outline-none focus:border-indigo-500/50"
                          />
                          {editingPack.imageURL && !editingPack.imageURL.startsWith('data:') && (
                            <div className="flex items-center gap-2 mt-1">
                              <img 
                                src={editingPack.imageURL} 
                                alt="Remote preview" 
                                referrerPolicy="no-referrer"
                                className="w-6 h-6 object-cover rounded border border-slate-700"
                                onError={(e) => {
                                  // fallback graceful handler
                                  (e.target as any).src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=100&q=80';
                                }}
                              />
                              <span className="text-[10px] text-indigo-400 font-medium font-sans">Remote asset link connected.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Detailed Description:</label>
                    <textarea
                      required
                      placeholder="e.g. Delivers high speed obfuscated channels optimized for bufferless 4K streaming and gaming..."
                      value={editingPack.description || ''}
                      onChange={(e) => setEditingPack({ ...editingPack, description: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white h-20 outline-none focus:border-indigo-500/50"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2.5 font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg cursor-pointer transition shadow-xl hover:shadow-indigo-500/20 duration-250 font-sans text-xs"
                    >
                      {editingPack.id ? 'Save Configuration changes' : 'Publish New VPN Package'}
                    </button>
                    {editingPack.id && (
                      confirmDeletePackId === editingPack.id ? (
                        <div className="flex items-center gap-2 bg-rose-500/5 px-2.5 py-1 rounded-lg border border-rose-500/10">
                          <span className="text-rose-400 text-xs font-semibold">Delete config permanently?</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (editingPack.id) {
                                handleDeletePackage(editingPack.id);
                                setEditingPack(null);
                                setConfirmDeletePackId(null);
                              }
                            }}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[11px] font-bold transition cursor-pointer"
                          >
                            Yes, Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeletePackId(null)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-md text-[11px] font-medium transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (editingPack.id) {
                              setConfirmDeletePackId(editingPack.id);
                            }
                          }}
                          className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-lg cursor-pointer transition text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Package
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingPack(null)}
                      className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer hover:underline transition text-xs ml-auto"
                    >
                      Discard & Close
                    </button>
                  </div>
                </form>
              )}

              {/* Package admin row list */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800">
                      <th className="pb-3">Title ID</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Bandwidth</th>
                      <th className="pb-3">Validity</th>
                      <th className="pb-3">Fee Price</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/30">
                    {packages.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 font-sans">
                          <p className="font-semibold text-white">{p.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 flex gap-1.5">
                            <span>ISP: <strong className="text-slate-400">{p.isp || 'Dialog'}</strong></span>
                            <span>•</span>
                            <span>Type: <strong className="text-slate-400">{p.packageType || 'Mobile'}</strong></span>
                          </p>
                        </td>
                        <td className="py-3 text-indigo-400">{p.vpnTypeName}</td>
                        <td className="py-3 text-slate-350">{p.bandwidthGB}</td>
                        <td className="py-3 text-slate-400">{p.validityDays} Days</td>
                        <td className="py-3 text-emerald-450 text-emerald-400 font-bold">{p.priceCurrency} {p.price}</td>
                        <td className="py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => setEditingPack(p)}
                              className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-white rounded border border-indigo-500/20 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                              title="Edit Package details, price or validity"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            {confirmDeletePackId === p.id ? (
                              <div className="inline-flex gap-1 bg-rose-950/25 border border-rose-500/20 rounded p-0.5">
                                <button
                                  onClick={() => {
                                    handleDeletePackage(p.id);
                                    setConfirmDeletePackId(null);
                                  }}
                                  className="px-1.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[9px] font-bold transition cursor-pointer"
                                  title="Confirm delete"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setConfirmDeletePackId(null)}
                                  className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-medium transition cursor-pointer"
                                  title="Cancel delete"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeletePackId(p.id)}
                                className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded border border-rose-500/20 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                                title="Delete VPN Package entirely"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. DYNAMIC POSTS EDITOR */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  ✍️ Blog, Guides and Featured Home News Panel
                </h3>
                <button
                  onClick={() => setEditingPost({
                    title: '',
                    excerpt: '',
                    content: '',
                    category: 'recent',
                    author: 'Admin Support',
                    imageURL: ''
                  })}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-md shadow-indigo-500/10"
                >
                  <Plus className="w-3.5 h-3.5" /> Publish New Post
                </button>
              </div>

              {editingPost && (
                <form onSubmit={handleSavePost} className="mt-6 p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-4 text-xs animate-fade-in">
                  <p className="font-bold text-indigo-400 uppercase font-mono">Writing desk</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Post Title:</label>
                      <input
                        type="text"
                        required
                        value={editingPost.title || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Category placement:</label>
                      <select
                        value={editingPost.category || 'recent'}
                        onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white outline-none focus:border-indigo-500/50"
                      >
                        <option value="featured">Featured (Top Main banner)</option>
                        <option value="recent">Recent Tutorial / Configuration Guide</option>
                        <option value="news">News Announcement Update</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Short Excerpt Summary:</label>
                    <input
                      type="text"
                      required
                      value={editingPost.excerpt || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white outline-none focus:border-indigo-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Full content body (Supports Markdown):</label>
                    <textarea
                      required
                      value={editingPost.content || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white h-32 font-sans outline-none focus:border-indigo-500/50"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded cursor-pointer transition shadow"
                    >
                      Publish
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPost(null)}
                      className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Dynamic list */}
              <div className="mt-6 space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="p-4 bg-slate-950 rounded-xl flex items-center justify-between border border-slate-850 text-xs">
                    <div>
                      <p className="font-bold text-white">{post.title}</p>
                      <p className="text-slate-500 font-mono mt-0.5 uppercase text-[9px]">{post.category} • Published: {post.date}</p>
                    </div>
                    <div className="flex gap-1 font-mono">
                      <button
                        onClick={() => setEditingPost(post)}
                        className="p-1.5 hover:bg-slate-800 text-indigo-400 rounded transition cursor-pointer"
                        title="Edit Post Content"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {confirmDeletePostId === post.id ? (
                        <div className="inline-flex gap-1.5 bg-rose-950/25 border border-rose-500/20 rounded p-0.5 items-center">
                          <span className="text-rose-400 text-[9px] px-1 font-sans">Delete?</span>
                          <button
                            onClick={() => {
                              handleDeletePost(post.id);
                              setConfirmDeletePostId(null);
                            }}
                            className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[9px] font-bold transition cursor-pointer"
                            title="Yes, delete"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeletePostId(null)}
                            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-medium transition cursor-pointer"
                            title="Cancel delete"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeletePostId(post.id)}
                          className="p-1.5 hover:bg-slate-800 text-rose-500 rounded transition cursor-pointer"
                          title="Delete VPN Package entirely"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. ACTIVE USER BANDWIDTH OVERRIDES */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                📊 Telegram Simulated Data Usage Adjuster
              </h3>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Select Active Client Profile:</label>
                  <select
                    value={selectedUserIdForBandwidth}
                    onChange={(e) => setSelectedUserIdForBandwidth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white outline-none focus:border-indigo-500/50"
                  >
                    <option value="">Select User profile...</option>
                    {adminStats?.users.filter((u: any) => u.role !== 'admin').map((u: any) => (
                      <option key={u.uid} value={u.uid}>{u.displayName} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Allocate Total Cap (Gigabytes):</label>
                  <input
                    type="number"
                    value={adminUserTotalGB}
                    onChange={(e) => setAdminUserTotalGB(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white font-mono outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Simulate Used Transfer (Gigabytes):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={adminUserUsedGB}
                    onChange={(e) => setAdminUserUsedGB(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white font-mono outline-none focus:border-indigo-500/50"
                  />
                </div>

                <button
                  onClick={handleUpdateBandwidth}
                  className="w-full py-2 font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded cursor-pointer transition shadow shadow-indigo-500/10"
                >
                  Sync to Backend Database
                </button>
              </div>
            </div>

            {/* 4.5 ADMIN ACCESS CONTROL & ROLE DELEGATION */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                🔑 Admin Credentials & Role Delegation Control
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Delegate secure administrative permissions to other users using their email address, or revoke active administrators.
              </p>

              {adminManageMessage && (
                <div className={`mt-4 p-3 rounded-lg text-xs ${adminManageMessage.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
                  {adminManageMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Left pane: Add Administrator */}
                <form onSubmit={handlePromoteAdmin} className="space-y-4">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Promote New Administrator</h4>
                  <p className="text-[11px] text-slate-400">
                    Input a client's email address below to grant them full administrator privileges. If their account does not exist yet, they will automatically receive full administrator access immediately upon sign up.
                  </p>
                  <div className="flex gap-2 text-xs">
                    <input
                      type="email"
                      required
                      placeholder="e.g. member@datastore.shop"
                      value={promoteEmail}
                      onChange={(e) => setPromoteEmail(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-850 rounded p-2 text-white outline-none focus:border-indigo-500/50"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 font-bold text-white rounded cursor-pointer transition shadow"
                    >
                      Grant Admin Privilege
                    </button>
                  </div>
                </form>

                {/* Right pane: Current administrators */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-sans">Active Server Administrators</h4>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {adminStats?.users?.filter((u: any) => u.role === 'admin').map((admin: any) => {
                      const isMainAdmin = admin.email?.toLowerCase().trim() === 'chethiyabandara0001@gmail.com';
                      return (
                        <div key={admin.uid} className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 flex items-center justify-between gap-4 text-xs">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{admin.displayName || 'Administrator'}</p>
                            <p className="text-slate-500 text-[11px] font-mono mt-0.5 truncate">{admin.email}</p>
                            {isMainAdmin && (
                              <span className="inline-block mt-1 text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">
                                Primary System Owner
                              </span>
                            )}
                          </div>
                          <div>
                            {isMainAdmin ? (
                              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono bg-slate-900 border border-slate-850 px-2 py-1 rounded">
                                <Lock className="w-3 h-3 text-slate-650" /> System Locked
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDemoteAdmin(admin.uid)}
                                className="px-2.5 py-1 text-[10px] font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-transparent rounded transition cursor-pointer flex items-center gap-1 font-sans"
                                title="Revoke permissions"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" /> Remove Admin
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. CONTACT & GLOBAL METADATA EDITORS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
                  📞 Configure Store Public Contact Details
                </h3>

                {!editingContact && contact && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-4 text-xs">
                    <div>
                      <p className="font-bold text-indigo-400 font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5 pb-1 border-b border-slate-850 text-[11px]">
                        📞 Core Public Support Info
                      </p>
                      <div className="space-y-1.5 font-sans">
                        <div className="flex justify-between py-1 border-b border-slate-850/40">
                          <span className="text-slate-400">Phone Support:</span>
                          <span className="text-white font-mono font-semibold">{contact.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-850/40">
                          <span className="text-slate-400">Admin Email:</span>
                          <span className="text-white font-mono font-semibold">{contact.email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-850/40">
                          <span className="text-slate-400">Telegram Channel:</span>
                          <span className="text-indigo-400 font-mono font-semibold truncate max-w-[150px]" title={contact.telegramChannel}>{contact.telegramChannel || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Telegram Bot USER:</span>
                          <span className="text-indigo-400 font-mono font-bold">@{contact.telegramBotUser || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-yellow-500 font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5 pb-1 border-b border-slate-850 text-[11px]">
                        🏦 Registered Store Bank Accounts
                      </p>
                      <div className="space-y-1.5 font-sans">
                        <div className="flex justify-between py-1 border-b border-slate-850/40">
                          <span className="text-slate-400">Bank Name:</span>
                          <span className="text-slate-200 font-semibold">{contact.bankName || 'Commercial Bank Of Ceylon'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-850/40">
                          <span className="text-slate-400">Branch Name:</span>
                          <span className="text-slate-200 font-semibold">{contact.bankBranch || 'Colombo Fort'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-850/40">
                          <span className="text-slate-400">Account Owner Name:</span>
                          <span className="text-slate-200 font-semibold">{contact.bankAccountName || 'DataStore VPN Router Group'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Account Number:</span>
                          <span className="text-indigo-400 font-mono font-bold text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{contact.bankAccountNo || '800021398'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setEditingContact(contact || {phone: '', email: '', telegramChannel: '', telegramBotUser: '', address: '', workingHours: '', bankName: '', bankBranch: '', bankAccountNo: '', bankAccountName: ''})}
                  className="mt-4 w-full px-4 py-2.5 font-bold text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-slate-850 transition cursor-pointer text-center block"
                >
                  {editingContact ? 'Cancel & Close Settings' : '✏️ Configure Company Contacts & Banking Credentials'}
                </button>

                {editingContact && (
                  <form onSubmit={handleSaveContactDetails} className="mt-4 space-y-3 text-xs animate-fade-in">
                    <div>
                      <label className="block text-slate-400">Phone Hotline:</label>
                      <input
                        type="text"
                        value={editingContact.phone || ''}
                        onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400">Public Administrative Email:</label>
                      <input
                        type="text"
                        value={editingContact.email || ''}
                        onChange={(e) => setEditingContact({...editingContact, email: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400">Telegram Channel link:</label>
                      <input
                        type="text"
                        value={editingContact.telegramChannel || ''}
                        onChange={(e) => setEditingContact({...editingContact, telegramChannel: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400">Telegram Verification Bot username:</label>
                      <input
                        type="text"
                        value={editingContact.telegramBotUser || ''}
                        onChange={(e) => setEditingContact({...editingContact, telegramBotUser: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    {/* Copied and styled secure admin configurations as per guidelines */}
                    <div className="border-t border-slate-800 pt-3 mt-3">
                      <p className="font-bold text-indigo-300 mb-2 font-mono uppercase tracking-wide">🏦 Store Admin Bank Transfer Coordinates</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400">Bank Name:</label>
                          <input
                            type="text"
                            placeholder="e.g. Commercial Bank"
                            value={editingContact.bankName || ''}
                            onChange={(e) => setEditingContact({...editingContact, bankName: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400">Branch Name:</label>
                          <input
                            type="text"
                            placeholder="e.g. Colombo Fort"
                            value={editingContact.bankBranch || ''}
                            onChange={(e) => setEditingContact({...editingContact, bankBranch: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400">Account Owner Name:</label>
                          <input
                            type="text"
                            placeholder="e.g. DataStore VPN (Pvt) Ltd"
                            value={editingContact.bankAccountName || ''}
                            onChange={(e) => setEditingContact({...editingContact, bankAccountName: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400">Account Number:</label>
                          <input
                            type="text"
                            placeholder="e.g. 800021398"
                            value={editingContact.bankAccountNo || ''}
                            onChange={(e) => setEditingContact({...editingContact, bankAccountNo: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded cursor-pointer transition shadow">
                        Save Contacts & Bank Details
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
                  📢 Home Announcement Banner
                </h3>

                <button
                  onClick={() => setEditingAnnounce(announcement || {title: '', subtitle: '', announcementText: '', showAnnouncement: true})}
                  className="mt-4 px-4 py-2 font-bold text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-550/20 transition cursor-pointer"
                >
                  Configure Global Announcement Popups
                </button>

                {editingAnnounce && (
                  <form onSubmit={handleSaveAnnouncement} className="mt-4 space-y-3 text-xs animate-fade-in">
                    <div>
                      <label className="block text-slate-400">Main Title Headline:</label>
                      <input
                        type="text"
                        value={editingAnnounce.title || ''}
                        onChange={(e) => setEditingAnnounce({...editingAnnounce, title: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400">Accent subtitle:</label>
                      <input
                        type="text"
                        value={editingAnnounce.subtitle || ''}
                        onChange={(e) => setEditingAnnounce({...editingAnnounce, subtitle: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400">Detailed popup text:</label>
                      <textarea
                        value={editingAnnounce.announcementText || ''}
                        onChange={(e) => setEditingAnnounce({...editingAnnounce, announcementText: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white h-16 outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingAnnounce.showAnnouncement || false}
                        onChange={(e) => setEditingAnnounce({...editingAnnounce, showAnnouncement: e.target.checked})}
                        className="w-4 h-4 bg-slate-950 border border-slate-850 text-indigo-500 rounded outline-none"
                      />
                      <label className="text-slate-400 text-xs">Show notification bar on home screen</label>
                    </div>

                    <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded cursor-pointer mt-2 transition shadow">
                      Save Announcement
                    </button>
                  </form>
                )}
              </div>

            </div>

            {/* TELEGRAM BOT LIVE TERMINAL PREVIEW */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    🤖 Telegram Verification Bot Live API Daemon Terminal
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Synchronized interactive long-polling daemon console displaying simulated system notifications, client registrations, and verifier ticks.
                  </p>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() => setIsTerminalLive(!isTerminalLive)}
                    className={`px-3 py-1 font-bold rounded flex items-center gap-1 transition-all cursor-pointer ${
                      isTerminalLive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isTerminalLive ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`}></span>
                    {isTerminalLive ? "FEED LIVE" : "FEED PAUSED"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTerminalLogs([])}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded transition font-bold cursor-pointer"
                  >
                    Clear Screen
                  </button>
                </div>
              </div>

              {/* Terminal Screen Body */}
              <div className="mt-5 bg-slate-950 border border-slate-850 rounded-xl p-4.5 font-mono text-xs text-slate-300 relative overflow-hidden flex flex-col h-64 shadow-inner">
                {/* Simulated Linux Bar */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-slate-900 border-b border-slate-855 px-4 flex items-center justify-between text-[11px] text-slate-500 select-none">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
                    <span className="ml-2">telegram-bot-daemon.log • 10Gbps Tunnel</span>
                  </span>
                  <span>node server.ts - active</span>
                </div>

                {/* Log Line Scroll Container */}
                <div className="flex-1 overflow-y-auto mt-7 mb-2 pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                  {terminalLogs.length === 0 ? (
                    <div className="text-center py-16 text-slate-600 italic select-none">
                      Terminal log stream is empty. Type a command or wait for live daemon processes to post.
                    </div>
                  ) : (
                    terminalLogs.map((log, index) => {
                      let colorClass = "text-slate-300";
                      if (log.includes("[SYSTEM]")) colorClass = "text-indigo-300";
                      else if (log.includes("[BOT]")) colorClass = "text-[#3bf0fa]";
                      else if (log.includes("[SUCCESS]")) colorClass = "text-emerald-400";
                      else if (log.includes("[USER-ADMIN]")) colorClass = "text-slate-200 font-bold";
                      else if (log.includes("[ADMINCMD]")) colorClass = "text-pink-400 font-bold";
                      else if (log.includes("[BOT-ROUTER]")) colorClass = "text-amber-400";

                      return (
                        <div key={index} className={`leading-relaxed whitespace-pre-wrap ${colorClass}`}>
                          {log}
                        </div>
                      );
                    })
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </div>

              {/* Custom Command Prompt Form */}
              <form onSubmit={handleSendTerminalCmd} className="mt-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 flex items-center gap-2 text-xs font-mono">
                  <span className="text-indigo-400 font-bold shrink-0 select-none">admin@datastore:~$</span>
                  <input
                    type="text"
                    value={customBotCmd}
                    onChange={(e) => setCustomBotCmd(e.target.value)}
                    placeholder="Type custom command or bot query (e.g. /status, /restart, hello bot)..."
                    className="flex-1 bg-transparent text-slate-100 outline-none w-full placeholder-slate-700 border-none p-0 focus:ring-0"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow shadow-indigo-500/10 shrink-0"
                  >
                    Execute Command
                  </button>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => { setCustomBotCmd('/status'); }}
                      className="px-2.5 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-indigo-300 rounded-lg text-[10px] lowercase font-mono transition cursor-pointer"
                    >
                      /status
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCustomBotCmd('/restart'); }}
                      className="px-2.5 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-indigo-300 rounded-lg text-[10px] lowercase font-mono transition cursor-pointer"
                    >
                      /restart
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCustomBotCmd('/sendbroadcast'); }}
                      className="px-2.5 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-indigo-300 rounded-lg text-[10px] lowercase font-mono transition cursor-pointer"
                    >
                      /broadcast
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER METADATA AND COPYRIGHT COGNIZANT */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-20 shrink-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-4">
              <span className="text-md font-bold tracking-tight text-white font-mono flex items-center gap-1">
                <Shield className="w-5 h-5 text-indigo-400" /> DATA STORE PLATFORMS
              </span>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Cloned as specified from unlimiteddata.shop, integrating full stack high speed tunnel verifiers, dynamic automated Telegram Bot state simulators mapping 10Gbps uplinks.
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                System Time UTC: 2026-05-27 • Server: Active Node Gateway
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">VPN Subscriptions</h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={() => setActiveTab('packages')} className="hover:text-indigo-400 cursor-pointer text-left">WireGuard Premium Configs</button></li>
                <li><button onClick={() => setActiveTab('packages')} className="hover:text-indigo-400 cursor-pointer text-left">Stealth Vmess Channels</button></li>
                <li><button onClick={() => setActiveTab('packages')} className="hover:text-indigo-400 cursor-pointer text-left">Custom Inject SSH SSHD</button></li>
                <li><button onClick={() => setActiveTab('packages')} className="hover:text-indigo-400 cursor-pointer text-left">V2Ray dynamic obfuscators</button></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">Security Standards</h5>
              <div className="text-xs text-slate-400 space-y-2">
                <p>Protected with standard SHA-2 Hash algorithms. End-to-end socket tunneling is enforced with AES-256-GCM cipher standards.</p>
              </div>
            </div>

          </div>

          <div className="pt-8 mt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 Janu Cyber Pack Network. Implemented with extreme cybernetics. All Rights Reserved.</p>
            <div className="flex gap-4 font-mono text-[10px]">
              <span className="text-emerald-500">🛡️ SECURITY COMPLIANT CERTIFICATE</span>
              <span className="text-slate-600">|</span>
              <span className="text-indigo-400">BOT API TELEGRAM SECURED</span>
            </div>
          </div>
        </div>
      </footer>

      </div> {/* CLOSE RIGHT SIDE MAIN VIEW WRAPPER */}

      {/* POPUP 1: BANK SLIPS FILE UPLOAD ATTACHMENT MODAL */}
      <AnimatePresence>
        {selectedPackForSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-905 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative bg-slate-900"
            >
              <button 
                onClick={() => { setSelectedPackForSlip(null); setBase64Slip(''); setSlipFeedback(null); }}
                className="absolute top-4 right-4 p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-md font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                Submit Verification Receipt Slip
              </h3>
              <p className="text-xs text-slate-400 mt-1">Submit bank slip for <span className="text-indigo-300 font-bold">{selectedPackForSlip.title}</span></p>

              <div className="mt-5 space-y-4">
                
                {/* Cost Tag */}
                <div className="bg-slate-950 p-3 rounded-xl flex justify-between items-center text-xs font-mono border border-slate-800">
                  <span className="text-slate-400">Service Fee Due:</span>
                  <span className="text-lg font-black text-white">{selectedPackForSlip.priceCurrency} {selectedPackForSlip.price.toLocaleString()}</span>
                </div>

                {/* Package Tier Dropdown Selection */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] text-slate-400 font-semibold font-mono uppercase tracking-wider">Select VPN Subscription Tier:</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500/50 font-sans"
                  >
                    <option value="LITE - 100GB">LITE - 100GB</option>
                    <option value="GO - 200GB">GO - 200GB</option>
                    <option value="PRO - 300GB">PRO - 300GB</option>
                    <option value="PRIME - 500GB">PRIME - 500GB</option>
                    <option value="PREMIUM - 100GB">PREMIUM - 100GB</option>
                  </select>
                </div>

                {/* Bank transfer coordinates display */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/85 text-xs">
                  <p className="font-bold text-indigo-400 uppercase tracking-widest font-mono mb-2 flex items-center gap-1 text-[11px]">
                    🏦 Bank Transfer Information
                  </p>
                  <p className="text-slate-400 mb-3 text-[10px] leading-normal font-sans">
                    Please transfer the subscription fee to the official store banking coordinate details below, then upload the receipt/slip below.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800/30">
                      <span className="text-slate-500 block text-[8px] uppercase">Bank Name</span>
                      <span className="text-slate-200 font-bold">{contact?.bankName || 'Commercial Bank Of Ceylon'}</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800/30">
                      <span className="text-slate-500 block text-[8px] uppercase">Branch</span>
                      <span className="text-slate-200 font-bold">{contact?.bankBranch || 'Colombo Fort'}</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded col-span-2 border border-slate-800/30">
                      <span className="text-slate-500 block text-[8px] uppercase">Account Owner Name</span>
                      <span className="text-slate-200 font-bold">{contact?.bankAccountName || 'DataStore VPN Router Group'}</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded col-span-2 flex justify-between items-center pr-2 border border-slate-800/30">
                      <div>
                        <span className="text-slate-500 block text-[8px] uppercase">Account Number</span>
                        <span className="text-indigo-400 font-bold text-xs">{contact?.bankAccountNo || '800021398'}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const num = contact?.bankAccountNo || '800021398';
                          navigator.clipboard.writeText(num);
                        }}
                        className="text-[9px] bg-slate-800 hover:bg-slate-750 hover:text-white text-slate-300 px-2 py-1 rounded transition"
                        type="button"
                      >
                        Copy No.
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upload drag-n-drop panel as requested by Guidelines */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('slip-file-input')?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                    dragActive ? 'border-indigo-550 bg-indigo-500/[0.03]' : 'border-slate-800 bg-slate-950 hover:border-indigo-500/30'
                  }`}
                >
                  <input 
                    id="slip-file-input" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />

                  {base64Slip ? (
                    <div className="space-y-3">
                      <div className="h-28 w-fit mx-auto relative group">
                        <img src={base64Slip} alt="Target slip thumbnail" className="h-full object-contain rounded border border-slate-800" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white">
                          Change file
                        </div>
                      </div>
                      <p className="text-xs text-emerald-400 font-mono flex items-center justify-center gap-1">
                        <Check className="w-4 h-4" /> Slip attachment active!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-indigo-450">
                        <Upload className="w-5 h-5 text-indigo-400" />
                      </div>
                      <p className="text-xs text-slate-300 font-bold">Drag and drop bank receipt image here, or <span className="text-indigo-400 underline">browse computer</span></p>
                      <p className="text-[10px] text-slate-500 font-mono">Accepts PNG, JPG format bank transfer screenshots</p>
                    </div>
                  )}
                </div>

                {slipFeedback && (
                  <div className={`p-3.5 rounded-lg flex items-start gap-2 text-xs ${
                    slipFeedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}>
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{slipFeedback.message}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSlipSubmission}
                    disabled={!base64Slip || isSubmittingSlip}
                    className="flex-1 py-3 font-bold text-xs text-white bg-indigo-500 hover:bg-indigo-650 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    {isSubmittingSlip ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying Receipt Data...
                      </>
                    ) : (
                      'Send Attachment to Backend'
                    )}
                  </button>
                  <button
                    onClick={() => { setSelectedPackForSlip(null); setBase64Slip(''); setSlipFeedback(null); }}
                    className="px-4 py-3 text-xs text-slate-400 hover:text-white hover:bg-slate-850 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg text-center text-[10px] text-slate-500 font-mono border border-slate-850">
                  🔒 Encrypted attachment router keys compiled safe.
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP 2: AUTH SIGN-IN MODAL - DEPRECATED IN FAVOR OF MAIN SECURE GATEWAY ENTRANCE */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative"
            >
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <span className="inline-block p-2 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-2">
                  <Shield className="w-6 h-6" />
                </span>
                <h3 className="text-lg font-bold text-white font-mono uppercase tracking-tight">Access Gate Identity</h3>
                <p className="text-xs text-slate-400">Connect to your secure dashboard</p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                {(['email', 'google', 'facebook'] as const).map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => {
                      setLoginProvider(prov);
                      setAuthError('');
                      if (prov === 'google') {
                        setLoginEmail('gmail-user@gmail.com');
                        setLoginName('Google Account Client');
                      } else if (prov === 'facebook') {
                        setLoginEmail('fb-user@facebook.com');
                        setLoginName('Facebook Identity Account');
                      } else {
                        setLoginEmail('');
                        setLoginName('');
                      }
                    }}
                    className={`py-2 text-xs font-bold rounded-lg uppercase transition cursor-pointer ${
                      loginProvider === prov ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAuthSignIn} className="mt-5 space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">EMAIL ID ADDRESS:</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. user@domain.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2.5 text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                {loginProvider === 'email' && (
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">SECURE ACCESS PASSWORD:</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2.5 text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full py-3 font-bold bg-indigo-500 hover:bg-indigo-600 text-white text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isLoginLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Keys...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" /> Sign In {loginProvider.toUpperCase()}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

