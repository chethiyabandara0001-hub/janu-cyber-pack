/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Shield, Server, Inbox, Settings, Activity, Upload, Check, X, AlertCircle, 
  Send, Phone, Mail, Award, Lock, LogIn, ExternalLink, RefreshCw, Layers,
  ChevronRight, ChevronLeft, Sparkles, Database, Plus, Trash2, Edit2, Volume2, Globe, FileText, CheckCircle, ShieldAlert, MessageSquare, MessagesSquare, RotateCcw,
  Sun, Moon, Loader2, Zap, ArrowRight, Wrench, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Package, Post, PaymentSlip, ContactDetails, HomeAnnouncement, FreePackage, FreeRequest, SupportMessage } from './types';
import { firebaseService } from './services/firebaseService';
import { AdminContactDetails, AdminCustomerChats } from './components/AdminPanels';
import { Sidebar } from './components/Sidebar';
import { LiveChatModal } from './components/LiveChatModal';
import { BankSlipUpload } from './components/BankSlipUpload';
import { HomeView } from './components/HomeView';
import { PackagesView } from './components/PackagesView';
import { UserDashboardView } from './components/UserDashboardView';
import { FreeVpnView } from './components/FreeVpnView';
import { PrivacyView } from './components/PrivacyView';
import { TermsView } from './components/TermsView';
import { SitemapsView } from './components/SitemapsView';
// import { customFetch as fetch } from './services/clientBackend';

const getTierPriceDisplay = (tierInput: string): string => {
  const normalized = (tierInput || '').trim().toLowerCase();
  if (normalized.includes('1000lkr')) return 'LKR 1,000';
  if (normalized.includes('200lkr')) return 'LKR 200';
  if (normalized.includes('300lkr')) return 'LKR 300';
  if (normalized.includes('400lkr')) return 'LKR 400';
  if (normalized.includes('500lkr')) return 'LKR 500';

  const match = normalized.match(/for\s+(\d+)\s*lkr/);
  if (match) {
    return `LKR ${Number(match[1]).toLocaleString()}`;
  }
  return 'LKR 200';
};

// Initialize and render standard Google Sign-In button
const googleBtnInitialized = { current: false };

export default function App() {
  // Theme state: 'cyberpunk-dark' | 'cyberpunk-light'
  const [theme, setTheme] = useState<'cyberpunk-dark' | 'cyberpunk-light'>(() => {
    return (localStorage.getItem('janu-cyber-theme') as 'cyberpunk-dark' | 'cyberpunk-light') || 'cyberpunk-dark';
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('janu-sidebar-collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('janu-cyber-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('janu-sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Navigation: 'home' | 'packages' | 'announcements' | 'dashboard' | 'admin' | 'site-settings' | 'free-vpn' | 'privacy' | 'terms' | 'sitemaps'
  const [activeTab, setActiveTab] = useState<'home' | 'packages' | 'dashboard' | 'admin' | 'site-settings' | 'free-vpn' | 'privacy' | 'terms' | 'sitemaps'>(() => {
    const path = window.location.pathname;
    if (path === '/privacy') return 'privacy';
    if (path === '/terms') return 'terms';
    if (path === '/sitemaps') return 'sitemaps';
    if (path === '/packages') return 'packages';
    if (path === '/free-vpn') return 'free-vpn';
    if (path === '/admin') return 'admin';
    if (path === '/site-settings') return 'site-settings';
    return 'home';
  });

  // Keep state tab and address bar URL perfectly and elegantly in sync
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      if (path === '/privacy') {
        setActiveTab('privacy');
      } else if (path === '/terms') {
        setActiveTab('terms');
      } else if (path === '/sitemaps') {
        setActiveTab('sitemaps');
      } else if (path === '/packages') {
        setActiveTab('packages');
      } else if (path === '/free-vpn') {
        setActiveTab('free-vpn');
      } else if (path === '/admin') {
        setActiveTab('admin');
      } else if (path === '/site-settings') {
        setActiveTab('site-settings');
      } else if (path === '/') {
        setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  useEffect(() => {
    const currentPath = window.location.pathname;
    const expectedPath = activeTab === 'home' ? '/' : `/${activeTab}`;
    if (currentPath !== expectedPath) {
      window.history.pushState(null, '', expectedPath);
    }
  }, [activeTab]);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('janu-cyber-user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Failed to parse saved user state", e);
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('janu-cyber-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('janu-cyber-user');
    }
  }, [user]);
  
  // App Data States
  const [packages, setPackages] = useState<Package[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [contact, setContact] = useState<ContactDetails | null>(null);
  const [announcement, setAnnouncement] = useState<HomeAnnouncement | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [userSlips, setUserSlips] = useState<PaymentSlip[]>([]);
  const [freePackages, setFreePackages] = useState<FreePackage[]>([]);
  const [freeRequests, setFreeRequests] = useState<FreeRequest[]>([]);

  // Backup file state variables
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Free VPN Client selection states
  const [selectedFreeIsp, setSelectedFreeIsp] = useState<'Dialog' | 'Mobitel' | 'Hutch' | 'Airtel'>('Dialog');
  const [selectedFreeType, setSelectedFreeType] = useState<'Mobile' | 'Router' | 'Fiber'>('Mobile');
  const [selectedFreePackageId, setSelectedFreePackageId] = useState<string>('');
  const [isClaimingFree, setIsClaimingFree] = useState<boolean>(false);
  const [claimedFreeRequest, setClaimedFreeRequest] = useState<FreeRequest | null>(null);
  const [freeClaimError, setFreeClaimError] = useState<string>('');

  // Free VPN Admin state
  const [adminFreeIsp, setAdminFreeIsp] = useState<'Dialog' | 'Mobitel' | 'Hutch' | 'Airtel'>('Dialog');
  const [adminFreeType, setAdminFreeType] = useState<'Mobile' | 'Router' | 'Fiber'>('Mobile');
  const [adminFreePackageName, setAdminFreePackageName] = useState<string>('');
  const [adminFreeCode, setAdminFreeCode] = useState<string>('');
  const [adminFreePrice, setAdminFreePrice] = useState<string>('Free');
  const [isAdminSavingFree, setIsAdminSavingFree] = useState<boolean>(false);
  const [adminFreeError, setAdminFreeError] = useState<string>('');
  const [confirmDeleteFreeId, setConfirmDeleteFreeId] = useState<string | null>(null);
  const [confirmDeleteFreeRequestId, setConfirmDeleteFreeRequestId] = useState<string | null>(null);

  // Administrative Ad Codes configuration states
  const [adminDayTimeAdCode, setAdminDayTimeAdCode] = useState<string>('');
  const [adminNightTimeAdCode, setAdminNightTimeAdCode] = useState<string>('');
  const [adminSuperAdUrl, setAdminSuperAdUrl] = useState<string>('');
  const [isSavingAdSettings, setIsSavingAdSettings] = useState<boolean>(false);
  const [adSettingsMessage, setAdSettingsMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // User Ad Redirections Tracking State (0 to 10)
  const [adRedirectionCount, setAdRedirectionCount] = useState<number>(0);
  const [isLoadingActiveAd, setIsLoadingActiveAd] = useState<boolean>(false);

  // Private Support Chat System States
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [activeUserChatId, setActiveUserChatId] = useState<string | null>(null);
  const [currentChatInput, setCurrentChatInput] = useState<string>('');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [isSendingSupportMsg, setIsSendingSupportMsg] = useState<boolean>(false);
  const [isFetchingSupportMsgs, setIsFetchingSupportMsgs] = useState<boolean>(false);
  
  // Slip upload popup settings
  const [selectedPackForSlip, setSelectedPackForSlip] = useState<Package | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('Lite 100gb for 200lkr');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [base64Slip, setBase64Slip] = useState<string>('');
  const [isSubmittingSlip, setIsSubmittingSlip] = useState<boolean>(false);
  const [slipFeedback, setSlipFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Authentication Fields (Google & Facebook & Email System Integrator)
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginName, setLoginName] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [loginProvider, setLoginProvider] = useState<'google' | 'email'>('email');
  const [emailAuthMode, setEmailAuthMode] = useState<'login' | 'register'>('login');
  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false);

  const handleInitiateLogin = () => {
    setLoginProvider('email');
    setShowLoginModal(true);
  };
  
  
  // No-op or optional login hook placeholder



  // Admin Dashboard stats & controls
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<boolean>(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState<boolean>(false);
  const [showWipeConfirmDouble, setShowWipeConfirmDouble] = useState<boolean>(false);
  const [slipVerificationFilter, setSlipVerificationFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [customVpnCode, setCustomVpnCode] = useState<string>('');
  
  // Admin Editing state hooks
  const [editingPack, setEditingPack] = useState<Partial<Package> | null>(null);
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

  const userChatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest support chat messages
  useEffect(() => {
    if (userChatEndRef.current) {
      userChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [supportMessages, isSupportModalOpen]);

  // Read initial data from backend API
  const fetchAllData = async () => {
    try {
      const res = await fetch('/api/initial-data');
      const data = await res.json();
      setPackages(data?.packages || []);
      setPosts(data?.posts || []);
      setContact(data?.contact || null);
      setAnnouncement(data?.announcement || null);
      setMaintenanceMode(data?.maintenance?.maintenanceMode || false);
      setFreePackages(data?.freePackages || []);
      setFreeRequests(data?.freeRequests || []);
    } catch (e) {
      console.error("Error loading index data", e);
    }
  };

  // User Free VPN Activation Handler
  const handleClaimFreeVpn = async (pkgId: string) => {
    if (!user) {
      handleInitiateLogin();
      return;
    }

    setIsClaimingFree(true);
    setFreeClaimError('');
    setClaimedFreeRequest(null);

    try {
      const response = await fetch('/api/free-requests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || user.email.split('@')[0],
          freePackageId: pkgId
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request free VPN package');
      }

      setClaimedFreeRequest(data.request);
      if (data.freeRequests) {
        setFreeRequests(data.freeRequests);
      }
    } catch (err: any) {
      setFreeClaimError(err.message || 'An error occurred while activating package.');
    } finally {
      setIsClaimingFree(false);
    }
  };

  // Admin save Free VPN package
  const handleSaveFreePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminFreePackageName || !adminFreeCode) {
      setAdminFreeError('Package Name and Activation Code are required.');
      return;
    }

    setIsAdminSavingFree(true);
    setAdminFreeError('');

    try {
      const response = await fetch('/api/admin/free-packages/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requester-Uid': user?.uid || ''
        },
        body: JSON.stringify({
          isp: adminFreeIsp,
          packageType: adminFreeType,
          packageName: adminFreePackageName,
          code: adminFreeCode,
          price: adminFreePrice || 'Free'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save free VPN package.');
      }

      setFreePackages(data.freePackages || []);
      setAdminFreePackageName('');
      setAdminFreeCode('');
    } catch (err: any) {
      setAdminFreeError(err.message || 'An error occurred while saving.');
    } finally {
      setIsAdminSavingFree(false);
    }
  };

  // Admin delete Free VPN package
  const handleDeleteFreePackage = async (id: string) => {
    try {
      setAdminFreeError('');
      const response = await fetch(`/api/admin/free-packages/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Requester-Uid': user?.uid || ''
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete free VPN package.');
      }

      setFreePackages(data.freePackages || []);
      setConfirmDeleteFreeId(null);
    } catch (err: any) {
      setAdminFreeError(err.message || 'An error occurred while deleting.');
    }
  };

  // Admin delete Free VPN user request log
  const handleDeleteFreeRequest = async (id: string) => {
    if (!user) return;
    try {
      setAdminFreeError('');
      const response = await fetch(`/api/admin/free-requests/${id}?requesterUid=${user.uid}`, {
        method: 'DELETE',
        headers: {
          'X-Requester-Uid': user.uid,
          'Requester-Uid': user.uid
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete free request log.');
      }

      setFreeRequests(data.freeRequests || []);
      setConfirmDeleteFreeRequestId(null);
    } catch (err: any) {
      console.error('[DELETE-LOG-ERROR]', err);
      setAdminFreeError(err.message || 'An error occurred while deleting request log.');
    }
  };

  // Load Ad settings for admin configurations
  const fetchAdSettings = async () => {
    if (!user || user.role !== 'admin') return;
    try {
      const res = await fetch(`/api/admin/ad-settings?email=${encodeURIComponent(user.email)}`, {
        headers: {
          'X-Requester-Uid': user?.uid || ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminDayTimeAdCode(data.dayTimeAdCode || '');
        setAdminNightTimeAdCode(data.nightTimeAdCode || '');
        setAdminSuperAdUrl(data.superAdminAdUrl || '');
      }
    } catch (e) {
      console.error("Failed to load ad settings", e);
    }
  };

  // Save Ad settings to Firestore
  const handleSaveAdSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'admin') return;
    setIsSavingAdSettings(true);
    setAdSettingsMessage(null);
    try {
      const res = await fetch('/api/admin/ad-settings/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requester-Uid': user?.uid || ''
        },
        body: JSON.stringify({
          email: user.email,
          dayTimeAdCode: adminDayTimeAdCode,
          nightTimeAdCode: adminNightTimeAdCode,
          superAdminAdUrl: adminSuperAdUrl
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save ad configurations');
      }
      setAdSettingsMessage({ type: 'success', text: 'Ad settings updated successfully.' });
      if (data.adSettings) {
        setAdminDayTimeAdCode(data.adSettings.dayTimeAdCode || '');
        setAdminNightTimeAdCode(data.adSettings.nightTimeAdCode || '');
        setAdminSuperAdUrl(data.adSettings.superAdminAdUrl || '');
      }
    } catch (err: any) {
      setAdSettingsMessage({ type: 'error', text: err.message || 'Error saving ad configurations' });
    } finally {
      setIsSavingAdSettings(false);
    }
  };

  // Trigger ad redirect check and increment count
  const handleTriggerAdRedirect = async () => {
    if (!selectedFreePackageId) return;
    setIsLoadingActiveAd(true);
    setFreeClaimError('');
    try {
      const res = await fetch('/api/ad-settings/active');
      if (!res.ok) throw new Error('Could not retrieve active ad source.');
      const data = await res.json();
      const adUrl = data.adLink || 'https://t.me/janucyberpack';
      
      // Attempt redirecting
      window.open(adUrl, '_blank', 'noopener,noreferrer');
      
      // Update count
      const currentCount = Number(localStorage.getItem('free_vpn_clicks_' + selectedFreePackageId) || '0');
      const nextCount = Math.min(10, currentCount + 1);
      
      localStorage.setItem('free_vpn_clicks_' + selectedFreePackageId, String(nextCount));
      setAdRedirectionCount(nextCount);
    } catch (e: any) {
      setFreeClaimError('Ad network failed: ' + e.message);
    } finally {
      setIsLoadingActiveAd(false);
    }
  };

  // Support Chat functions for user and admin private communications
  const fetchSupportMessages = async (targetUserId?: string) => {
    setIsFetchingSupportMsgs(true);
    try {
      let url = '/api/support-messages';
      if (targetUserId) {
        url += `?userId=${encodeURIComponent(targetUserId)}`;
      } else if (user && user.role !== 'admin') {
        url += `?userId=${encodeURIComponent(user.uid)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSupportMessages(data);
      }
    } catch (e) {
      console.error("Failed to load support messages", e);
    } finally {
      setIsFetchingSupportMsgs(false);
    }
  };

  const handleSendSupportMessage = async (sender: 'user' | 'admin', customUserId?: string, customUserName?: string, customUserEmail?: string) => {
    if (!currentChatInput.trim()) return;
    setIsSendingSupportMsg(true);
    try {
      let targetUid = '';
      let targetEmail = '';
      let targetName = '';

      if (sender === 'admin') {
        targetUid = customUserId || activeUserChatId || '';
        targetEmail = customUserEmail || '';
        targetName = customUserName || '';
      } else {
        targetUid = user?.uid || 'guest_user';
        targetEmail = user?.email || 'anonymous@datastore.shop';
        targetName = user?.displayName || 'Anonymous';
      }

      if (!targetUid) {
        console.error("No valid thread room ID specified");
        setIsSendingSupportMsg(false);
        return;
      }

      const res = await fetch('/api/support-messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUid,
          userEmail: targetEmail,
          userName: targetName,
          message: currentChatInput,
          sender: sender
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentChatInput('');
        setSupportMessages(data.messages || []);
        fetchSupportMessages(sender === 'admin' ? targetUid : undefined);
      }
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setIsSendingSupportMsg(false);
    }
  };

  // Automatic Support Chat Polling Hooks
  useEffect(() => {
    let intervalId: any;
    if (isSupportModalOpen && user) {
      console.log("Starting support message polling for user...");
      fetchSupportMessages();
      intervalId = setInterval(() => {
        fetchSupportMessages();
      }, 15000);
    }
    return () => {
      if (intervalId) {
        console.log("Stopping support message polling.");
        clearInterval(intervalId);
      }
    };
  }, [isSupportModalOpen, user]);

  useEffect(() => {
    let intervalId: any;
    if (activeTab === 'admin' && user?.role === 'admin') {
      if (activeUserChatId) {
        fetchSupportMessages(activeUserChatId);
        intervalId = setInterval(() => {
          fetchSupportMessages(activeUserChatId);
        }, 15000);
      } else {
        fetchSupportMessages();
        intervalId = setInterval(() => {
          fetchSupportMessages();
        }, 20000);
      }
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab, user, activeUserChatId]);

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
      const res = await fetch('/api/admin/dashboard-stats', {
        headers: {
          'X-Requester-Uid': user?.uid || ''
        }
      });
      const data = await res.json();
      setAdminStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAdminLoading(false);
    }
  };

  // Reset specialized statistics individually (Admin Only)
  const handleResetSpecificStat = async (type: 'users' | 'sales' | 'pending' | 'approved' | 'free_requests', e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!user) {
      alert('Authentication error: User context not found. Please log in again.');
      return;
    }

    if (!window.confirm(`Are you sure you want to reset this specifically? This action is irreversible.`)) return;
    
    setAdminLoading(true);
    try {
      console.log(`[ADMIN-ACTION] Resetting stat: ${type} for User: ${user.uid}`);
      const res = await fetch(`/api/admin/reset-stat?requesterUid=${user.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requester-Uid': user.uid,
          'Requester-Uid': user.uid
        },
        body: JSON.stringify({ type, requesterUid: user.uid })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        alert(data.message || 'Stat reset successfully');
        // Aggressive fetch to update UI immediately
        await Promise.all([
          fetchAdminStats(),
          fetchAllData()
        ]);
      } else {
        alert(`Error: ${data.error || 'Failed to reset stat'}`);
      }
    } catch (err) {
      console.error('[ADMIN-ERROR]', err);
      alert('Network error while resetting stat. Check your internet connection.');
    } finally {
      setAdminLoading(false);
    }
  };

  // Reset metrics / stats on backend
  const handleResetStats = async () => {
    if (!user) return;
    setAdminLoading(true);
    try {
      const res = await fetch(`/api/admin/reset-stats?requesterUid=${user.uid}`, {
        method: 'POST',
        headers: {
          'X-Requester-Uid': user.uid,
          'Requester-Uid': user.uid
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowResetConfirm(false);
        await fetchAdminStats();
        alert('Statistics reset successfully.');
      } else {
        alert('Failed to reset statistics: ' + (data.error || 'Unknown error'));
      }
    } catch (e: any) {
      console.error(e);
      alert('Network error during reset.');
    } finally {
      setAdminLoading(false);
    }
  };

  // Reset & Restore initial default packages, free packages, and posts from the server database
  const handleRestoreDefaults = async () => {
    if (!user) return;
    setAdminLoading(true);
    setAdminManageMessage(null);
    try {
      const res = await fetch(`/api/admin/restore-defaults?requesterUid=${user.uid}`, {
        method: 'POST',
        headers: {
          'X-Requester-Uid': user.uid,
          'Requester-Uid': user.uid
        }
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setShowRestoreConfirm(false);
        setAdminManageMessage({
          type: 'success',
          text: 'Database successfully restored to original factory default packages, posts, and free VPN listings!'
        });
        alert('Database restored to factory defaults.');
        await fetchAllData();
        await fetchAdminStats();
      } else {
        alert('Failed to restore defaults.');
        setAdminManageMessage({
          type: 'error',
          text: data.error || 'Failed to restore default configuration.'
        });
      }
    } catch (e: any) {
      console.error(e);
      alert('Network error during restore.');
      setAdminManageMessage({
        type: 'error',
        text: 'Network error connecting to administrative restore module: ' + (e?.message || String(e))
      });
    } finally {
      setAdminLoading(false);
    }
  };

  // Deep Wipe the database to nothing
  const handleWipeDatabase = async () => {
    setAdminLoading(true);
    setAdminManageMessage(null);
    try {
      const res = await fetch('/api/admin/wipe-database', {
        method: 'POST',
        headers: {
          'X-Requester-Uid': user?.uid || ''
        }
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setShowWipeConfirm(false);
        setAdminManageMessage({
          type: 'success',
          text: 'Database successfully cleared entirely to nothing!'
        });
        await fetchAllData();
        await fetchAdminStats();
      } else {
        setAdminManageMessage({
          type: 'error',
          text: data.error || 'Failed to wipe database.'
        });
      }
    } catch (e: any) {
      console.error(e);
      setAdminManageMessage({
        type: 'error',
        text: 'Network error connecting to administrative database wipe module: ' + (e?.message || String(e))
      });
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin' && user?.role === 'admin') {
      fetchAdminStats();
      fetchAdSettings();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (selectedFreePackageId) {
      const savedClicks = Number(localStorage.getItem('free_vpn_clicks_' + selectedFreePackageId) || '0');
      setAdRedirectionCount(savedClicks);
    } else {
      setAdRedirectionCount(0);
    }
  }, [selectedFreePackageId]);

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
      
      let data: any;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error(`Invalid JSON response from server. Status: ${response.status}. Response: ${text.substring(0, 150)}`);
      }

      if (response.ok && data.status === 'success') {
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
    } catch (error: any) {
      console.error("Auth server error", error);
      setAuthError(`Could not reach secure authentication servers: ${error?.message || error || 'Unknown network error'}`);
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

      let data: any;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error(`Invalid JSON response from server. Status: ${response.status}. Response: ${text.substring(0, 150)}`);
      }

      if (response.ok && data.status === 'success') {
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
    } catch (error: any) {
      console.error("Auth server error", error);
      setAuthError(`Could not reach secure authentication servers: ${error?.message || error || 'Unknown network error'}`);
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Real Google Sign-In Identity callback JWT decoder and authenticator
  const handleGoogleCredentialResponse = async (response: any) => {
    try {
      const token = response.credential;
      if (!token) return;

      let decoded: any;
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padLength = (4 - (base64.length % 4)) % 4;
        const paddedBase64 = base64 + '='.repeat(padLength);
        const jsonPayload = decodeURIComponent(window.atob(paddedBase64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        decoded = JSON.parse(jsonPayload);
      } catch (jwtErr: any) {
        console.error("Google token decode error", jwtErr);
        setAuthError(`Error decoding secure google identity keys: ${jwtErr.message}`);
        return;
      }

      if (!decoded.email) {
        setAuthError("Google account has no associated email address.");
        return;
      }

      setIsLoginLoading(true);
      setAuthError('');

      let resObj: Response;
      try {
        resObj = await fetch('/api/auth/sign-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: decoded.email,
            displayName: decoded.name || decoded.given_name,
            provider: 'google'
          })
        });
      } catch (netErr: any) {
        console.error("Auth routing network error", netErr);
        setAuthError(`Could not reach secure authentication servers: ${netErr.message}`);
        return;
      }

      let data: any;
      try {
        const text = await resObj.text();
        try {
          data = JSON.parse(text);
        } catch (jsonErr) {
          throw new Error(`Invalid JSON response from server. Status: ${resObj.status}. Response: ${text.substring(0, 150)}`);
        }
      } catch (parseErr: any) {
        console.error("Server return parsing error", parseErr);
        setAuthError(`Authentication verification error: ${parseErr.message}`);
        return;
      }

      if (resObj.ok && data.status === 'success' && data.user) {
        setUser(data.user);
        localStorage.setItem('janu-cyber-user', JSON.stringify(data.user));
        loadUserSlips(data.user.uid);
        setShowLoginModal(false);
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
        setAuthError(data.error || 'Google login verification failed on server.');
      }
    } catch (e: any) {
      console.error("Unhandled auth error", e);
      setAuthError(`Secure login error: ${e?.message || String(e)}`);
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Initialize and render standard Google Sign-In button
  useEffect(() => {
    const googleObj = (window as any).google;
    if (!googleObj?.accounts?.id) return;

    const win = window as any;
    if (!win.__google_gsi_initialized && !googleBtnInitialized.current) {
      try {
        console.log("Initializing Google Sign-In singleton...");
        googleObj.accounts.id.initialize({
          client_id: (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || "1081766323785-o7vdqe5lqqjpl01psororlv1s8ctggjs.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        win.__google_gsi_initialized = true;
        googleBtnInitialized.current = true;
      } catch(e) {
        console.warn("GSI Logger override catch", e);
      }
    }

    const renderButtons = () => {
      // Try to render standard button on landing page if element exists
      const btnLanding = document.getElementById("google-signin-btn");
      if (btnLanding && !btnLanding.hasChildNodes()) {
        googleObj.accounts.id.renderButton(btnLanding, {
          theme: "outline",
          shape: "pill",
          size: "large",
          width: 320,
          text: "signin_with"
        });
      }

      // Try to render standard button on login modal if element exists
      const btnModal = document.getElementById("google-signin-btn-modal");
      if (btnModal && !btnModal.hasChildNodes()) {
        googleObj.accounts.id.renderButton(btnModal, {
          theme: "outline",
          shape: "pill",
          size: "large",
          width: 320,
          text: "signin_with"
        });
      }
    };

    renderButtons();
    // Re-check after small delay for modal transitions
    const timer = setTimeout(renderButtons, 500);
    return () => clearTimeout(timer);
  }, [user, showLoginModal, loginProvider]); // Removed handleGoogleCredentialResponse to avoid re-init

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

  // Helper to compress and downscale images on the client side before saving to Firestore (guards against 1MB document limit)
  const compressClientImage = (file: File, maxWidth: number, maxHeight: number, quality: number, callback: (base64: string) => void) => {
    if (!file.type.startsWith('image/')) {
      callback('');
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", quality);
          callback(compressed);
        } else {
          callback(event.target?.result as string);
        }
      };
    };
    reader.onerror = () => {
      console.error("Image compression failure");
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    // Compress bank slips down matching ideal client footprint (<100KB)
    compressClientImage(file, 800, 800, 0.7, (compressedBase64) => {
      if (compressedBase64) {
        setBase64Slip(compressedBase64);
      } else {
        // Fallback
        const reader = new FileReader();
        reader.onload = () => {
          setBase64Slip(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // User submits Slip to backend
  const handleSlipSubmission = async () => {
    if (!user) {
      handleInitiateLogin();
      return;
    }
    if (!selectedPackForSlip || !base64Slip) return;

    setIsSubmittingSlip(true);
    setSlipFeedback(null);

    try {
      // Direct high-performance server-side handling: pass base64 directly to the backend
      const publicStorageUrl = base64Slip;

      const data = await firebaseService.submitPaymentSlip({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        packageId: selectedPackForSlip.id,
        bankSlipBase64: publicStorageUrl, // save only the clean cloud text URL string
        tier: selectedTier
      });

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
        headers: { 
          'Content-Type': 'application/json',
          'X-Requester-Uid': user?.uid || ''
        },
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

  // Admin save package API
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPack) return;

    try {
      const data = await firebaseService.savePackage(editingPack);
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
        method: 'DELETE',
        headers: {
          'X-Requester-Uid': user?.uid || ''
        }
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
        headers: { 
          'Content-Type': 'application/json',
          'X-Requester-Uid': user?.uid || ''
        },
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
        method: 'DELETE',
        headers: {
          'X-Requester-Uid': user?.uid || ''
        }
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
        headers: { 
          'Content-Type': 'application/json',
          'X-Requester-Uid': user?.uid || ''
        },
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
        headers: { 
          'Content-Type': 'application/json',
          'X-Requester-Uid': user?.uid || ''
        },
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
    setAdminManageMessage(null);
    try {
      const res = await fetch('/api/admin/users/demote', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requester-Uid': user?.uid || ''
        },
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
        headers: { 
          'Content-Type': 'application/json',
          'X-Requester-Uid': user?.uid || ''
        },
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
        headers: { 
          'Content-Type': 'application/json',
          'X-Requester-Uid': user?.uid || ''
        },
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

  // Admin toggle Site Maintenance Mode
  const handleToggleMaintenance = async () => {
    try {
      const nextMode = !maintenanceMode;
      const res = await fetch('/api/admin/maintenance/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requester-Uid': user?.uid || ''
        },
        body: JSON.stringify({ maintenanceMode: nextMode })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin trigger data backup to local JSON file
  const handleSaveBackupToFile = async () => {
    setIsBackingUp(true);
    setBackupMessage(null);
    try {
      const res = await fetch('/api/admin/backup/save-to-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requester-Uid': user?.uid || ''
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setBackupMessage({
          type: 'success',
          text: `Data successfully saved and updated in 'src/data-backup.json'! File size is now ${JSON.stringify(data.data).length} bytes.`
        });
      } else {
        setBackupMessage({
          type: 'error',
          text: data.error || 'Failed to save data backup.'
        });
      }
    } catch (e: any) {
      setBackupMessage({
        type: 'error',
        text: 'Connection or system error during backup write: ' + (e?.message || String(e))
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  // Admin trigger backup download directly
  const handleDownloadBackupFile = async () => {
    try {
      const res = await fetch('/api/admin/backup/download', {
        headers: {
          'X-Requester-Uid': user?.uid || ''
        }
      });
      const data = await res.json();
      const filename = "data-backup.json";
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setBackupMessage({
        type: 'error',
        text: 'Failed to stream files: ' + (e?.message || String(e))
      });
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans flex flex-col md:flex-row selection:bg-indigo-500 selection:text-white">
      <Helmet>
        <title>{
          activeTab === 'home' ? "Janu Cyber Pack | No.1 Ultra-Fast Premium & Free VPN Store" :
          activeTab === 'packages' ? "Buy Premium VPN Packages & Secure Configs | Janu Cyber Pack" :
          activeTab === 'dashboard' ? "My Secure VPN Dashboard | Janu Cyber Pack" :
          activeTab === 'free-vpn' ? "Get Free Daily VPN Configs (Dialog, Mobitel, Hutch) | Janu Cyber Pack" :
          activeTab === 'admin' ? "Admin Portal | Janu Cyber Pack" :
          activeTab === 'site-settings' ? "Site Settings & Configurations | Janu Cyber Pack" :
          activeTab === 'privacy' ? "Privacy Policy & No-Logs Commitment | Janu Cyber Pack" :
          activeTab === 'terms' ? "Terms of Service & Usage Standards | Janu Cyber Pack" :
          activeTab === 'sitemaps' ? "Sitemaps Navigation Index | Janu Cyber Pack" :
          "Janu Cyber Pack"
        }</title>
        <meta name="description" content="Looking to buy premium high-speed VPN configs? Janu Cyber Pack offers ultra-fast WireGuard profiles, Stealth Vmess, and SSH custom tunnels at the cheapest rates globally in LKR, USD, and AUD. Experience unthrottled low-latency gaming and seamless streaming today. Get started for free!" />
        <link rel="canonical" href="https://janucyber.store/" />
        
        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Janu Cyber Pack",
            "operatingSystem": "iOS, Android, Windows, macOS",
            "applicationCategory": "SecurityApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "LKR"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "1250"
            }
          })}
        </script>
      </Helmet>

      {/* Hidden H1 for SEO robots */}
      <h1 className="sr-only">Janu Cyber Pack - Fast, Secure and Free VPN Service worldwide</h1>
      {/* SIDEBAR NAVIGATION - VISIBLE ON DESKTOP */}
      <Sidebar 
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        setLoginProvider={setLoginProvider}
        setShowLoginModal={setShowLoginModal}
        handleInitiateLogin={handleInitiateLogin}
      />

      {/* RIGHT SIDE MAIN VIEW WRAPPER */}
      <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden w-full">
        
        {/* HEADER BAR */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 sm:px-8 bg-slate-950 sticky top-0 z-40 shrink-0 backdrop-blur">
          <div className="flex items-center gap-3">
            {/* Mobile block logo */}
            <div className="flex md:hidden items-center gap-2 cursor-pointer" onClick={() => {
              if (!user) {
                handleInitiateLogin();
              } else {
                setActiveTab('home');
              }
            }}>
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-md">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            
            {/* Removed mobile loading overlay, it's now global */}
            
            <h2 className="hidden md:block text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
              {activeTab === 'home' && "DASHBOARD"}
              {activeTab === 'packages' && "VPN PACKAGES"}
              {activeTab === 'free-vpn' && "FREE VPN"}
              {activeTab === 'dashboard' && "MY ACCOUNT"}
              {activeTab === 'admin' && "ADMIN PANEL"}
              {activeTab === 'site-settings' && "SITE CONFIGURER"}
              {activeTab === 'privacy' && "PRIVACY POLICY"}
              {activeTab === 'terms' && "TERMS OF SERVICE"}
              {activeTab === 'sitemaps' && "SITEMAPS VISUAL DIRECTORY"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Inline Theme Selection Controls */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-850 p-1 rounded-xl">
              <button
                onClick={() => setTheme('cyberpunk-dark')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  theme === 'cyberpunk-dark'
                    ? 'bg-indigo-500 text-white shadow shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Solid Charm Dark Mode"
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('cyberpunk-light')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  theme === 'cyberpunk-light'
                    ? 'bg-indigo-500 text-white shadow shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Solid Charm Light Mode"
              >
                <Sun className="w-4 h-4" />
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
                onClick={() => handleInitiateLogin()}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl text-white bg-indigo-500 hover:bg-indigo-600 transition-all flex items-center gap-2 cursor-pointer shadow-indigo-900/50 shadow-md border border-indigo-400/20 active:scale-95"
              >
                <LogIn className="w-4 h-4 text-indigo-200" />
                Login or Sign Up
              </button>
            )}
          </div>
        </header>

        {/* MOBILE NAVIGATION PILLS */}
        <div className="md:hidden flex gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800 overflow-x-auto scrollbar-hide snap-x items-center">
          <button 
            onClick={() => setActiveTab('home')}
            className={`shrink-0 px-4 py-2 text-[10px] sm:text-xs font-bold rounded-xl transition tracking-wide font-mono snap-center ${activeTab === 'home' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-950/40' : 'text-slate-400 border border-transparent'}`}
          >
            DASHBOARD
          </button>
          <button 
            onClick={() => setActiveTab('packages')}
            className={`shrink-0 px-4 py-2 text-[10px] sm:text-xs font-bold rounded-xl transition tracking-wide font-mono snap-center ${activeTab === 'packages' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-950/40' : 'text-slate-400 border border-transparent'}`}
          >
            PACKAGES
          </button>
          {user && (
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`shrink-0 px-4 py-2 text-[10px] sm:text-xs font-semibold rounded-xl transition font-mono snap-center ${activeTab === 'dashboard' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-950/40' : 'text-slate-400 border border-transparent'}`}
            >
              ACCOUNT
            </button>
          )}
          <button 
            onClick={() => setActiveTab('free-vpn')}
            className={`shrink-0 px-4 py-2 text-[10px] sm:text-xs font-bold rounded-xl transition font-mono snap-center ${activeTab === 'free-vpn' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-950/40' : 'text-slate-400 border border-transparent'}`}
          >
            FREE VPN
          </button>
          {user?.role === 'admin' && (
            <>
              <button 
                onClick={() => setActiveTab('admin')}
                className={`shrink-0 px-4 py-2 text-[10px] sm:text-xs font-bold rounded-xl transition snap-center font-mono ${activeTab === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm shadow-amber-950/40' : 'text-amber-500/60 border border-transparent'}`}
              >
                ADMIN ⭐
              </button>
              <button 
                onClick={() => setActiveTab('site-settings')}
                className={`shrink-0 px-4 py-2 text-[10px] sm:text-xs font-bold rounded-xl transition snap-center font-mono ${activeTab === 'site-settings' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-950/40' : 'text-slate-400 border border-transparent'}`}
              >
                SETTINGS ⚙️
              </button>
            </>
          )}
        </div>

        {/* SITE MAINTENANCE MODE BANNER */}
        {maintenanceMode && (activeTab === 'home' || activeTab === 'dashboard') && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 animate-fade-in">
            <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
                  <Wrench className="w-5 h-5 animate-bounce" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Site maintenance is going on, we'll be back soon.
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    We are performing routine server upgrades. Service performance might be temporarily affected.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block px-2.5 py-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full uppercase tracking-wider font-mono">
                UNDER MAINTENANCE
              </span>
            </div>
          </div>
        )}

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

        {/* RECOMMENDED / PROMOTED: FREE HIGH SPEED VPN FILES */}
        {activeTab === 'home' && (
          <div className="bg-emerald-950/20 border-b border-emerald-500/15 py-4">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl shrink-0 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    GET FREE VPN FILE FOR FREE
                  </h3>
                  <p className="text-xs text-slate-400/90 mt-0.5 leading-relaxed">
                    Download 100% free daily high-speed working configurations for Dialog, Mobitel, and Hutch networks.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('free-vpn')}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shrink-0 transition-all shadow-md shadow-emerald-400/10 flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-emerald-400/50 cursor-pointer font-sans"
              >
                Get Free Unlimited High-Speed VPN File
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      {/* APP CONTENT BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full overflow-x-auto lg:overflow-x-visible scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* TAB 1: OVERVIEW & NEW POSTS */}
        {activeTab === 'home' && (
          <HomeView
            user={user}
            userSlips={userSlips}
            packages={packages}
            posts={posts}
            contact={contact}
            setShowLoginModal={setShowLoginModal}
            setIsSupportModalOpen={setIsSupportModalOpen}
            handleInitiateLogin={handleInitiateLogin}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {/* TAB 2: VPN SUBSCRIPTIONS & PACKAGE CARDS */}
        {activeTab === 'packages' && (
          <PackagesView
            packages={packages}
            user={user}
            setShowLoginModal={setShowLoginModal}
            setSelectedPackForSlip={setSelectedPackForSlip}
            handleInitiateLogin={handleInitiateLogin}
          />
        )}

        {/* TAB: GET FREE VPN INTERACTIVE GATEWAY */}
        {activeTab === 'free-vpn' && (
          <FreeVpnView
            user={user}
            setLoginProvider={setLoginProvider}
            setShowLoginModal={setShowLoginModal}
            handleInitiateLogin={handleInitiateLogin}
            selectedFreeIsp={selectedFreeIsp}
            setSelectedFreeIsp={setSelectedFreeIsp}
            selectedFreeType={selectedFreeType}
            setSelectedFreeType={setSelectedFreeType}
            selectedFreePackageId={selectedFreePackageId}
            setSelectedFreePackageId={setSelectedFreePackageId}
            freePackages={freePackages}
            freeRequests={freeRequests}
            claimedFreeRequest={claimedFreeRequest}
            setClaimedFreeRequest={setClaimedFreeRequest}
            freeClaimError={freeClaimError}
            setFreeClaimError={setFreeClaimError}
            adRedirectionCount={adRedirectionCount}
            setAdRedirectionCount={setAdRedirectionCount}
            isLoadingActiveAd={isLoadingActiveAd}
            handleTriggerAdRedirect={handleTriggerAdRedirect}
            isClaimingFree={isClaimingFree}
            handleClaimFreeVpn={handleClaimFreeVpn}
          />
        )}

        {/* TAB 3: USER SUBSCRIPTIONS AND STATE MONITOR */}
        {activeTab === 'dashboard' && user && (
          <UserDashboardView
            user={user}
            userSlips={userSlips}
          />
        )}

        {/* TAB: PRIVACY POLICY */}
        {activeTab === 'privacy' && (
          <PrivacyView onBackToHome={() => setActiveTab('home')} />
        )}

        {/* TAB: TERMS OF SERVICE */}
        {activeTab === 'terms' && (
          <TermsView onBackToHome={() => setActiveTab('home')} />
        )}

        {/* TAB: SITEMAPS VISUAL DIRECTORY */}
        {activeTab === 'sitemaps' && (
          <SitemapsView onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {/* TAB 4: ADMINISTRATIVE COMMAND CENTER */}
        {activeTab === 'admin' && user?.role === 'admin' && (
          <div className="space-y-8 animate-fade-in w-full max-w-full overflow-x-auto lg:overflow-x-visible scrollbar-thin scrollbar-thumb-slate-800 pb-4">
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-display">
                  <Database className="w-5 h-5 text-indigo-400" />
                  DATA STORE CONTROL PANEL
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Track analytical user logs, verify slip triggers, create dynamic news and manager packages</p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={fetchAdminStats}
                  className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${adminLoading ? 'animate-spin' : ''}`} /> Reload Stats
                </button>

                {!showResetConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="px-3 py-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Stats
                  </button>
                ) : (
                  <div className="flex gap-1.5 items-center bg-rose-950/20 border border-rose-500/20 rounded-lg px-2 py-0.5">
                    <span className="text-[10px] text-rose-400 font-mono">Reset?</span>
                    <button
                      type="button"
                      onClick={handleResetStats}
                      className="px-2 py-1 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition cursor-pointer"
                    >
                      Yes, Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2 py-1 text-[10px] text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick KPI stats row */}
            {adminStats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Estimated Users Total</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{adminStats.totalUsers}</p>
                    </div>
                    <button 
                      onClick={(e) => handleResetSpecificStat('users', e)}
                      className="text-slate-600 hover:text-rose-500 transition-colors p-1"
                      title="Reset Users"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Total Sales Approved</p>
                      <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">LKR {(adminStats?.totalSales || 0).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={(e) => handleResetSpecificStat('sales', e)}
                      className="text-slate-600 hover:text-rose-500 transition-colors p-1"
                      title="Reset Sales"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">Pending Slips Queue</p>
                      <p className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1">{adminStats.pendingCount}</p>
                    </div>
                    <button 
                      onClick={(e) => handleResetSpecificStat('pending', e)}
                      className="text-slate-600 hover:text-rose-500 transition-colors p-1"
                      title="Clear Pending Queue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-indigo-450 text-indigo-400 font-mono uppercase tracking-wider">Approved Deliveries</p>
                      <p className="text-2xl sm:text-3xl font-bold text-indigo-400 mt-1">{adminStats.approvedCount}</p>
                    </div>
                    <button 
                      onClick={(e) => handleResetSpecificStat('approved', e)}
                      className="text-slate-600 hover:text-rose-500 transition-colors p-1"
                      title="Clear Approved List"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 1. VERIFY SLIPS QUEUE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                  🚨 Bank Slips Queue for Manual Check
                </h3>

                {/* Filter pills */}
                <div className="flex flex-wrap gap-1.5 font-mono">
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
                      <div key={slip.id} className="bg-slate-950 border border-slate-850 rounded-xl p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                        
                        {/* Slip Image Thumbnail */}
                        <div className="lg:col-span-3 col-span-1">
                          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-wider mb-2 font-semibold">Uploaded Receipt Image</p>
                          <a href={slip.bankSlipBase64} target="_blank" rel="noreferrer" className="block relative h-48 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden group">
                            <img src={slip.bankSlipBase64} alt="Slip" className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition">
                              Click to fullsize <ExternalLink className="w-3.5 h-3.5 ml-1" />
                            </div>
                          </a>
                        </div>

                        {/* Slip analytical data fields */}
                        <div className="lg:col-span-4 col-span-1 space-y-2 text-xs font-mono">
                          <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Transaction Attributes</p>
                          <div className="flex flex-col sm:flex-row justify-between py-1 border-b border-slate-800/40 gap-1 sm:gap-4">
                            <span className="text-slate-400 font-sans min-w-[80px]">Slip ID:</span>
                            <span className="text-white hover:underline break-all sm:text-right">{slip.id}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between py-1 border-b border-slate-800/40 gap-1 sm:gap-4">
                            <span className="text-slate-400 font-sans min-w-[80px]">User Client:</span>
                            <span className="text-indigo-400 font-sans font-semibold break-all sm:text-right">{slip.userName} ({slip.userEmail})</span>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between py-1 border-b border-slate-800/40 gap-1 sm:gap-4">
                            <span className="text-slate-400 font-sans">Target Package:</span>
                            <span className="text-white font-sans font-medium sm:text-right">{slip.packageTitle} ({slip.vpnTypeName})</span>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between py-1 border-b border-slate-800/40 gap-1 sm:gap-4">
                            <span className="text-slate-400 font-sans">Selected Tier:</span>
                            <span className="text-amber-400 font-bold sm:text-right">{slip.tier || 'Not specified'}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between py-1 border-b border-slate-800/40 gap-1 sm:gap-4">
                            <span className="text-slate-400 font-sans">Cost check:</span>
                            <span className="text-indigo-400 font-black sm:text-right">{slip.currency} {(slip.price || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between py-1 gap-1 sm:gap-4">
                            <span className="text-slate-400 font-sans">Submitted at:</span>
                            <span className="text-slate-400 font-sans sm:text-right">{slip.submittedAt ? new Date(slip.submittedAt).toLocaleString() : 'N/A'}</span>
                          </div>
                        </div>

                        {/* Decision & verification workflow actions */}
                        <div className="lg:col-span-5 col-span-1 space-y-4">
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

                              <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                  onClick={() => handleVerifySlip(slip.id, 'approved')}
                                  className="flex-grow py-2.5 px-3 text-xs font-bold bg-indigo-500 hover:bg-slate-100 hover:text-slate-950 text-white rounded flex items-center justify-center gap-1 cursor-pointer transition shadow-lg shadow-indigo-500/10"
                                >
                                  <Check className="w-4 h-4" /> Approve & Activation Config
                                </button>
                                <button
                                  onClick={() => handleVerifySlip(slip.id, 'rejected')}
                                  className="py-2.5 px-4 text-xs font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded cursor-pointer transition-all"
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
                              {slip.verifiedAt && <p className="text-slate-500 text-[10px] font-mono">Timestamp: {slip.verifiedAt ? new Date(slip.verifiedAt).toLocaleString() : 'N/A'}</p>}
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
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
                    isFeatured: true,
                    status: 'active'
                  })}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-md shadow-indigo-500/10"
                >
                  <Plus className="w-3.5 h-3.5" /> Create New VPN Package
                </button>
              </div>

              {editingPack && (
                <form onSubmit={handleSavePackage} className="mt-6 p-4 sm:p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-5 text-xs animate-fade-in text-left">
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                  <div className="pt-2">
                    {/* Featured toggle option */}
                    <div className="select-none">
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
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 sm:p-4 mt-4">
              <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-800">
                <table className="w-full text-left text-xs font-mono min-w-[650px]">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-800">
                        <th className="pb-3 min-w-[150px]">Title ID</th>
                        <th className="pb-3 min-w-[80px]">Type</th>
                        <th className="pb-3 min-w-[100px]">Bandwidth</th>
                        <th className="pb-3 min-w-[80px]">Validity</th>
                        <th className="pb-3 min-w-[80px]">Fee Price</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                      {packages.map((pkg) => (
                        <tr key={pkg.id} className="border-b border-slate-850/40 hover:bg-slate-950/20 text-slate-300">
                          <td className="py-2.5 font-sans font-bold text-white max-w-[140px] truncate" title={pkg.title}>{pkg.title}</td>
                          <td className="py-2.5">
                            <span className="text-[9px] bg-slate-850 px-1.5 py-0.5 rounded text-indigo-400 font-bold uppercase">{pkg.vpnTypeName}</span>
                          </td>
                          <td className="py-2.5">{pkg.bandwidthGB}</td>
                          <td className="py-2.5">{pkg.validityDays} Days</td>
                          <td className="py-2.5 text-emerald-400 font-bold">{pkg.priceCurrency} {pkg.price}</td>
                          <td className="py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => { setEditingPack(pkg); setConfirmDeletePackId(null); }}
                              className="p-1 text-indigo-455 text-indigo-405 hover:text-indigo-300 transition inline-block text-indigo-400"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                </table>
              </div>
              </div>
            </div>

            {/* 3. CONFIGURE STORE PUBLIC CONTACT DETAILS */}
            <AdminContactDetails
              contact={contact}
              editingContact={editingContact}
              setEditingContact={setEditingContact}
              handleSaveContactDetails={handleSaveContactDetails}
            />

            {/* 4. CLIENT PRIVATE SUPPORT CHATS DECK */}
            <AdminCustomerChats
              supportMessages={supportMessages}
              activeUserChatId={activeUserChatId}
              setActiveUserChatId={setActiveUserChatId}
              currentChatInput={currentChatInput}
              setCurrentChatInput={setCurrentChatInput}
              isFetchingSupportMsgs={isFetchingSupportMsgs}
              isSendingSupportMsg={isSendingSupportMsg}
              fetchSupportMessages={fetchSupportMessages}
              handleSendSupportMessage={handleSendSupportMessage}
            />

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
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
                    author: 'Admin Support'
                  })}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-md shadow-indigo-500/10"
                >
                  <Plus className="w-3.5 h-3.5" /> Publish New Post
                </button>
              </div>

              {editingPost && (
                <form onSubmit={handleSavePost} className="mt-6 p-4 sm:p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-4 text-xs animate-fade-in">
                  <p className="font-bold text-indigo-400 uppercase font-mono">Writing desk</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* 4.5 ADMIN ACCESS CONTROL & ROLE DELEGATION */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
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
                  <div className="flex flex-col sm:flex-row gap-2 text-xs">
                    <input
                      type="email"
                      required
                      placeholder="e.g. member@datastore.shop"
                      value={promoteEmail}
                      onChange={(e) => setPromoteEmail(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-850 rounded p-2.5 text-white outline-none focus:border-indigo-500/50"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 font-bold text-white rounded-lg cursor-pointer transition shadow grid place-items-center"
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

            {/* 5. GLOBAL HOME ANNOUNCEMENT BANNER */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
                📢 Home Announcement Banner
              </h3>

              <button
                type="button"
                onClick={() => setEditingAnnounce(announcement || {title: '', subtitle: '', announcementText: '', showAnnouncement: true})}
                className="mt-4 px-4 py-2 font-bold text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-550/20 transition cursor-pointer"
              >
                Configure Global Announcement Popups
              </button>

              {editingAnnounce && (
                <form onSubmit={handleSaveAnnouncement} className="mt-4 space-y-3 text-xs animate-fade-in text-left">
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

            {/* 6. FREE DATA SETTINGS & UPLOAD VOUCHER CODES */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  🎁 6. FREE DATA SETTINGS & TUNNEL MANAGER
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Upload free bypass configuration voucher codes, manage operator classifications, and monitor select-activations submitted by clients.
                </p>
              </div>

              {/* Form and List Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Upload Form (Column 1) */}
                <form onSubmit={handleSaveFreePackage} className="lg:col-span-4 space-y-4 text-xs font-sans">
                  <p className="font-bold text-indigo-400 font-mono uppercase tracking-wider text-[11px] pb-1 border-b border-slate-850">
                    Create New Free Configuration
                  </p>

                  {adminFreeError && (
                    <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded text-red-400 font-mono">
                      {adminFreeError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Select Sri Lankan ISP Operator:</label>
                      <select
                        value={adminFreeIsp}
                        onChange={(e: any) => setAdminFreeIsp(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white outline-none focus:border-indigo-500 font-mono"
                      >
                        <option value="Dialog">Dialog</option>
                        <option value="Mobitel">Mobitel</option>
                        <option value="Hutch">Hutch</option>
                        <option value="Airtel">Airtel</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Select Package connection Interface:</label>
                      <select
                        value={adminFreeType}
                        onChange={(e: any) => setAdminFreeType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white outline-none focus:border-indigo-500 font-mono"
                      >
                        <option value="Mobile">Mobile</option>
                        <option value="Router">Router</option>
                        <option value="Fiber">Fiber</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Package Display Name:</label>
                      <input
                        type="text"
                        placeholder="e.g. Social Media Pack"
                        value={adminFreePackageName}
                        onChange={(e) => setAdminFreePackageName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white outline-none focus:border-indigo-500 placeholder-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Voucher Activation Code / Configuration link:</label>
                      <input
                        type="text"
                        placeholder="e.g. wgrd://dialog-free-unlimited-bypass..."
                        value={adminFreeCode}
                        onChange={(e) => setAdminFreeCode(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white outline-none focus:border-indigo-500 font-mono placeholder-slate-700 text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Price Descriptor:</label>
                      <input
                        type="text"
                        value={adminFreePrice}
                        onChange={(e) => setAdminFreePrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAdminSavingFree}
                    className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all cursor-pointer uppercase font-mono shadow mt-2"
                  >
                    {isAdminSavingFree ? 'Uploading...' : '💾 UPLOAD CONFIG'}
                  </button>
                </form>

                {/* Uploaded codes DB view (Column 2) */}
                <div className="lg:col-span-8 space-y-4">
                  <p className="font-bold text-emerald-400 font-mono uppercase tracking-wider text-[11px] pb-1 border-b border-slate-850">
                    Live Uploaded Free Configs (Active database catalog)
                  </p>

              <div className="max-h-[500px] lg:max-h-[400px] overflow-y-auto border border-slate-850 rounded-xl bg-slate-950 p-3 sm:p-4 space-y-3">
                    {freePackages.length === 0 ? (
                      <p className="text-xs text-slate-400 font-mono text-center py-12 select-none">No active free packages loaded in your Database.</p>
                    ) : (
                      freePackages.map((pkg) => (
                        <div key={pkg.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between gap-4 font-mono text-xs overflow-hidden">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-white font-bold bg-indigo-500/10 px-1.5 py-0.5 border border-indigo-500/20 rounded font-sans uppercase">
                                {pkg.isp}
                              </span>
                              <span className="text-[10px] text-[#3ee260] bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/20 rounded uppercase">
                                {pkg.packageType}
                              </span>
                              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/20 rounded uppercase">
                                {pkg.price}
                              </span>
                            </div>
                            <h4 className="text-white font-sans font-bold leading-none pt-1">{pkg.packageName}</h4>
                            <p className="text-[10px] text-slate-500 truncate" title={pkg.code}>Code: {pkg.code}</p>
                          </div>

                          {confirmDeleteFreeId === pkg.id ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleDeleteFreePackage(pkg.id)}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-slate-950 font-semibold rounded text-[10px] uppercase font-mono cursor-pointer"
                              >
                                CONFIRM
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteFreeId(null)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded text-[10px] uppercase font-mono cursor-pointer"
                              >
                                CANCEL
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteFreeId(pkg.id)}
                              className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded transition shrink-0 cursor-pointer"
                              title="Delete Free Configuration"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              <div className="border-t border-slate-800/60 pt-5 space-y-3">
                <div className="flex items-center justify-between px-1">
                   <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                     <Clock className="w-4 h-4 text-slate-500" />
                     Administrative User claims logs queue
                   </h3>
                   {freeRequests.length > 0 && (
                     <button
                       onClick={(e) => handleResetSpecificStat('free_requests', e)}
                       className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg border border-rose-500/20 text-[10px] font-bold transition-all uppercase tracking-tight"
                     >
                       <Trash2 className="w-3.5 h-3.5" />
                       Clear All Logs
                     </button>
                   )}
                </div>

                <div className="border border-slate-850 rounded-xl bg-slate-950 overflow-hidden">
                  {freeRequests.length === 0 ? (
                    <p className="text-xs text-slate-400 font-mono text-center py-12 select-none">No requests logs submitted by customers yet.</p>
                  ) : (
                    <>
                      {/* Desktop layout: Hidden on screens smaller than large (approx 1024px) */}
                      <div className="hidden lg:block overflow-x-auto w-full text-xs font-mono scrollbar-thin scrollbar-thumb-slate-800">
                        <table className="w-full text-left font-mono text-slate-350 border-collapse min-w-[850px]">
                          <thead>
                            <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 text-[10px] uppercase font-bold">
                              <th className="p-3">Claim Request ID</th>
                              <th className="p-3">User Operator Info</th>
                              <th className="p-3">ISP Target</th>
                              <th className="p-3">Interface Match</th>
                              <th className="p-3">Package Category</th>
                              <th className="p-3">Voucher Delivered</th>
                              <th className="p-3">Claims Date</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {freeRequests.map((req) => (
                              <tr key={req.id} className="border-b border-slate-855 hover:bg-slate-900/40 transition">
                                <td className="p-3 text-slate-400 text-[11px] font-sans">
                                  {req.id}
                                </td>
                                <td className="p-3">
                                  <div>
                                    <p className="text-white font-sans font-bold leading-normal">{req.userName}</p>
                                    <p className="text-[10px] text-slate-500 font-mono">{req.userEmail}</p>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className="text-white font-bold">{req.isp}</span>
                                </td>
                                <td className="p-3 text-slate-400">
                                  {req.packageType}
                                </td>
                                <td className="p-3 font-sans font-semibold text-slate-300">
                                  {req.packageName}
                                </td>
                                <td className="p-3">
                                  <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[10px]">
                                    {req.codeReceived}
                                  </code>
                                </td>
                                <td className="p-3 text-slate-400 text-[11px]">
                                  {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : 'N/A'}
                                </td>
                                <td className="p-3 text-right">
                                  {confirmDeleteFreeRequestId === req.id ? (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteFreeRequest(req.id)}
                                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-slate-950 font-bold rounded text-[10px] uppercase font-mono cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteFreeRequestId(null)}
                                        className="px-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded text-[10px] uppercase font-mono cursor-pointer"
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteFreeRequestId(req.id)}
                                      className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded transition inline-flex cursor-pointer"
                                      title="Delete Log Entry"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile / Portrait / Tablet layout: Displayed as interactive cards */}
                      <div className="block lg:hidden divide-y divide-slate-850">
                        {freeRequests.map((req) => (
                          <div key={req.id} className="p-4 space-y-3 text-xs font-mono">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-[10px] text-indigo-400 font-sans tracking-wide">ID: {req.id}</span>
                              <span className="text-[10px] text-slate-500">
                                {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : 'N/A'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pb-2.5">
                              <div>
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-sans">User Operator</p>
                                <p className="font-sans font-bold text-white text-[12px] truncate">{req.userName}</p>
                                <p className="text-[10px] text-slate-400 truncate">{req.userEmail}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-sans">Config Mapped</p>
                                <p className="font-sans font-semibold text-slate-200 text-[12px] truncate">{req.packageName}</p>
                                <p className="text-[11px] text-[#3ee260] font-bold">
                                  {req.isp} ({req.packageType})
                                </p>
                              </div>
                            </div>

                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] text-slate-500 uppercase font-sans mb-1 font-bold">Voucher / Config String</p>
                                <code className="text-emerald-400 bg-slate-950 p-1 rounded font-mono text-[11.5px] select-all block truncate border border-slate-850">
                                  {req.codeReceived}
                                </code>
                              </div>

                              <div className="shrink-0 pt-2 sm:pt-0">
                                {confirmDeleteFreeRequestId === req.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteFreeRequest(req.id)}
                                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-slate-950 font-bold rounded text-[10px] uppercase cursor-pointer"
                                    >
                                      Confirm Delete
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteFreeRequestId(null)}
                                      className="px-2 py-1 bg-slate-850 text-slate-300 rounded text-[10px] uppercase cursor-pointer"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteFreeRequestId(req.id)}
                                    className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded transition cursor-pointer"
                                    title="Delete Log Entry"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>


            </div>
          </div>
        )}

        {/* TAB 5: SITE SETTINGS & PORTALS CONFIGURATION */}
        {activeTab === 'site-settings' && user?.role === 'admin' && (
          <div className="space-y-8 animate-fade-in w-full max-w-full overflow-x-auto lg:overflow-x-visible scrollbar-thin scrollbar-thumb-slate-800 pb-4">
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-display">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  SYSTEM & PORTALS CONFIGURATION
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage live maintenance status, update bypass gateways, backup schema files, and reload structural parameters</p>
              </div>
            </div>

            {/* Layout grids for Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Site Maintenance Mode Control Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  🛠️ Site Maintenance Mode
                </h3>

                <div className="text-xs text-slate-400 leading-relaxed">
                  <p>Toggle this setting to activate the global site maintenance marquee. If turned on, standard users will see an alert notice at the top of the Home Dashboard and Account screen:</p>
                  <div className="mt-2 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-amber-500 font-medium">
                    "Site maintenance is going on, we'll be back soon."
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleToggleMaintenance}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors duration-150 flex items-center gap-2 border cursor-pointer select-none ${
                      maintenanceMode
                        ? 'bg-amber-500 hover:bg-amber-600 border-amber-500 text-slate-950'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    {maintenanceMode ? 'Turn Off Maintenance Mode' : 'Turn On Maintenance Mode'}
                  </button>

                  <div className="flex items-center gap-2 text-xs">
                    <span className={`w-2.5 h-2.5 rounded-full ${maintenanceMode ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`} />
                    <span className="text-slate-400 font-mono">
                      Status: <strong className={maintenanceMode ? 'text-amber-400 font-bold' : 'text-slate-300'}>{maintenanceMode ? 'ACTIVE' : 'INACTIVE'}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Site Reload Defaults Control Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                  ⚙️ Site Reload Defaults
                </h3>

                <div className="text-xs text-slate-400 leading-relaxed">
                  <p>Restore the application's packages, configurations, and post data back to seed defaults. This action will reload seed records into active Firestore catalogs.</p>
                </div>

                <div className="pt-2">
                  {!showRestoreConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowRestoreConfirm(true)}
                      className="px-4 py-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5" /> Restore Defaults
                    </button>
                  ) : (
                    <div className="flex gap-2 items-center bg-emerald-950/20 border border-emerald-500/20 rounded-lg px-3 py-1.5 inline-flex">
                      <span className="text-[11px] text-emerald-400 font-mono font-bold">Restore packages & posts?</span>
                      <button
                        type="button"
                        onClick={handleRestoreDefaults}
                        className="px-2.5 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition cursor-pointer"
                      >
                        Yes, Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRestoreConfirm(false)}
                        className="px-2.5 py-1 text-[10px] text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Database Backup & Download Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                📦 Database Backup & Download Center
              </h3>

              <div className="text-xs text-slate-400 leading-relaxed">
                <p>Compile a complete full-schema backup of all live Firestore instances directly into the site's local filesystem file <code className="text-indigo-400 px-1 bg-slate-950 rounded border border-slate-850">src/data-backup.json</code>, or stream and download a local client-side copy instantly.</p>
              </div>

              {backupMessage && (
                <div className={`p-3 rounded-lg text-xs leading-normal border ${
                  backupMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {backupMessage.text}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  disabled={isBackingUp}
                  onClick={handleSaveBackupToFile}
                  className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-colors border cursor-pointer select-none flex items-center gap-2 ${
                    isBackingUp
                      ? 'bg-slate-950 border-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-500 hover:bg-indigo-600 border-indigo-500 text-white'
                  }`}
                >
                  {isBackingUp ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Database className="w-3.5 h-3.5" />
                  )}
                  {isBackingUp ? 'Saving Backup...' : 'Save Database to JSON File'}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBackupFile}
                  className="px-4 py-2.5 text-xs font-bold rounded-lg transition-colors border border-slate-800 bg-slate-950 text-slate-350 hover:bg-slate-850 hover:text-white flex items-center gap-2 cursor-pointer select-none"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Download Backup JSON Asset
                </button>
              </div>
            </div>

            {/* Danger Zone: Wipe Database and Clean Slate */}
            <div className="bg-slate-900 border border-red-950/40 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider border-b border-rose-950/25 pb-3 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-500" />
                ⚠️ Danger Zone: Clear Complete Database
              </h3>

              <div className="text-xs text-slate-400 leading-relaxed">
                <p>Erase all packages, news posts, free configuration codes, user subscriptions, slips, and messaging databases permanently. <strong>This action is highly destructive and cannot be undone.</strong></p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                {!showWipeConfirm && !showWipeConfirmDouble ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowWipeConfirm(true);
                      setShowWipeConfirmDouble(false);
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-lg flex items-center gap-2 transition duration-200 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Wipe Entire Database
                  </button>
                ) : showWipeConfirm && !showWipeConfirmDouble ? (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2 w-full max-w-md animate-fade-in">
                    <p className="text-[11px] font-bold text-rose-400 font-mono">⚠️ [FIRST ACTION] Are you absolutely sure? This will delete all users, posts, packages and configs!</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowWipeConfirm(false);
                          setShowWipeConfirmDouble(true);
                        }}
                        className="px-3 py-1.5 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition cursor-pointer"
                      >
                        Yes, I am sure
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowWipeConfirm(false);
                          setShowWipeConfirmDouble(false);
                        }}
                        className="px-3 py-1.5 text-[10px] text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-600/15 border border-red-500/30 rounded-xl space-y-2 w-full max-w-md">
                    <p className="text-[11px] font-extrabold text-red-400 uppercase tracking-wide">🚨 [CRITICAL ACTION] CONFIRM TWICE - CLICK ONCE MORE TO ERASE ALL INSTANCES FOREVER!</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setShowWipeConfirmDouble(false);
                          setShowWipeConfirm(false);
                          await handleWipeDatabase();
                        }}
                        className="px-3 py-1.5 text-[10px] font-black text-white bg-red-600 hover:bg-red-700 rounded transition cursor-pointer"
                      >
                        YES, PERMANENTLY ERASE FOREVER
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowWipeConfirm(false);
                          setShowWipeConfirmDouble(false);
                        }}
                        className="px-3 py-1.5 text-[10px] text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded transition cursor-pointer"
                      >
                        Abort Wipe
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ADVERTISEMENT PORTALS & REDIRECTION CONFIGURATOR */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6">
              {user?.email && (
                (() => {
                  const isSuperAdmin = user.email.toLowerCase() === "chethiyabandara0001@gmail.com";
                  return (
                    <div className="space-y-6">
                      <div className="border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                          <Globe className="w-4 h-4 text-indigo-400" />
                          🛡️ ADVERTISEMENT PORTALS & REDIRECTION CONFIGURATOR
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {isSuperAdmin 
                            ? "Configure day and night bypass advertisement gateways. Subadmins are only permitted to configure the Night Time portals to respect access parameters."
                            : "Configure the active bypass advertisement and verification gateways for all client tunnels."
                          }
                        </p>
                      </div>

                      <div className="space-y-4">
                        {isSuperAdmin && (
                          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-400 font-mono flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse shrink-0" />
                            <span>👑 Master Control Mode: Super-Administrator identity verified. Full write permissions granted for Day & Night codes.</span>
                          </div>
                        )}

                        <form onSubmit={handleSaveAdSettings} className="space-y-4 text-xs font-sans">
                          {adSettingsMessage && (
                            <div className={`p-3 rounded-xl border font-mono text-[11px] ${
                              adSettingsMessage.type === 'success' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                              {adSettingsMessage.text}
                            </div>
                          )}

                          {isSuperAdmin ? (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Day Time Ad Box */}
                                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <label className="block text-white font-bold font-mono">☀️ Day Time Ad Portal (06:00 - 18:00):</label>
                                    <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded font-mono">
                                      Super-Admin Only
                                    </span>
                                  </div>
                                  <input
                                    type="text"
                                    value={adminDayTimeAdCode}
                                    onChange={(e) => setAdminDayTimeAdCode(e.target.value)}
                                    placeholder="e.g. https://best-adsite.com/campaign-day"
                                    className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white outline-none focus:border-indigo-500 font-mono text-[11px]"
                                  />
                                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                                    This portal active link will automatically direct client verification pathways from 06:00 AM to 05:59 PM. Anything regarding this is hidden securely in server headers.
                                  </p>
                                </div>

                                {/* Night Time Ad Box */}
                                <div className="bg-slate-950 p-5 rounded-xl border border-slate-855 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <label className="block text-white font-bold font-mono">🌙 Night Time Ad Portal (18:00 - 06:00):</label>
                                    <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-mono">
                                      Sub-Admin Authorized
                                    </span>
                                  </div>
                                  <input
                                    type="text"
                                    value={adminNightTimeAdCode}
                                    onChange={(e) => setAdminNightTimeAdCode(e.target.value)}
                                    placeholder="e.g. https://best-adsite.com/campaign-night"
                                    className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white outline-none focus:border-indigo-500 font-mono text-[11px]"
                                  />
                                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                                    This active link governs client traffic during night hours (06:00 PM to 05:59 AM). Standard subadministrators possess editing rights.
                                  </p>
                                </div>
                              </div>

                              {/* Super-Admin Custom Ad URL/Bypass Code Entrance Area */}
                              <div className="bg-slate-950 p-5 rounded-xl border border-amber-500/20 space-y-3 max-w-full">
                                <div className="flex items-center justify-between">
                                  <label className="block text-amber-400 font-extrabold font-mono uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                                    👑 Super-Admin Exclsive Ad Campaign URL / Bypass Gateway:
                                  </label>
                                  <span className="text-[10px] text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase">
                                    Root Restricted
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  value={adminSuperAdUrl}
                                  onChange={(e) => setAdminSuperAdUrl(e.target.value)}
                                  placeholder="e.g. https://best-adsite.com/special-super-gateway-bypass"
                                  className="w-full bg-slate-900 border border-amber-500/20 focus:border-amber-500 rounded p-3 text-white outline-none font-mono text-[11px]"
                                />
                                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                                  This special entrance area configures a secondary priority high-authority gateway. Sub-administrators have absolutely no viewing or editing access to this route.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-950 p-5 rounded-xl border border-slate-855 space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="block text-white font-bold font-mono">🔗 Active Verification Ad Campaign URL:</label>
                                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                                  Active Gateway
                                </span>
                              </div>
                              <input
                                type="text"
                                value={adminNightTimeAdCode}
                                onChange={(e) => setAdminNightTimeAdCode(e.target.value)}
                                placeholder="e.g. https://best-adsite.com/campaign"
                                className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white outline-none focus:border-indigo-500 font-mono text-[11px]"
                              />
                              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                                This active link governs verification pathways and validation parameters 24/7. Edit permissions are synchronized globally.
                              </p>
                            </div>
                          )}

                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={isSavingAdSettings}
                              className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-55 text-white font-bold rounded-xl transition font-mono uppercase text-xs cursor-pointer"
                            >
                              {isSavingAdSettings ? 'Saving...' : '💾 UPDATE AD CONFIGS'}
                            </button>
                          </div>

                        </form>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

          </div>
        )}
      </div>

      {/* FOOTER METADATA AND COPYRIGHT COGNIZANT */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-20 shrink-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-3">
              <span className="text-md font-bold tracking-tight text-white font-mono flex items-center gap-1.5">
                <Shield className="w-5 h-5 text-indigo-400" /> JANU CYBER PACK
              </span>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                High-performance encryption tunnels, custom proxy configurations, and unthrottled unlimited bandwidth tunnels for security and speed.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">VPN PACKAGES</h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={() => setActiveTab('packages')} className="hover:text-indigo-400 cursor-pointer text-left">WireGuard Premium Configs</button></li>
                <li><button onClick={() => setActiveTab('packages')} className="hover:text-indigo-400 cursor-pointer text-left">Stealth Vmess Channels</button></li>
                <li><button onClick={() => setActiveTab('packages')} className="hover:text-indigo-400 cursor-pointer text-left">Custom Inject SSH SSHD</button></li>
                <li><button onClick={() => setActiveTab('packages')} className="hover:text-indigo-400 cursor-pointer text-left">V2Ray dynamic obfuscators</button></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 mt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Janu Cyber Pack. All rights reserved.</p>
            <div className="flex gap-4">
              <a 
                href="/privacy" 
                onClick={(e) => { e.preventDefault(); setActiveTab('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className="hover:text-indigo-400 transition-colors cursor-pointer"
              >
                Privacy
              </a>
              <a 
                href="/terms" 
                onClick={(e) => { e.preventDefault(); setActiveTab('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className="hover:text-indigo-400 transition-colors cursor-pointer"
              >
                Terms
              </a>
              <a 
                href="/sitemaps" 
                onClick={(e) => { e.preventDefault(); setActiveTab('sitemaps'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className="hover:text-indigo-400 transition-colors cursor-pointer"
              >
                Sitemaps
              </a>
              <a href="https://janucyber.store" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">Official Domain</a>
            </div>
            <p className="text-[11px] text-slate-600">Created by <a href="https://ace-10.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 font-semibold transition-colors cursor-pointer underline decoration-indigo-500/40 underline-offset-2">ACE10</a></p>
          </div>
        </div>
      </footer>

      {/* POPUP 1: BANK SLIPS FILE UPLOAD ATTACHMENT MODAL */}
      <AnimatePresence>
      <BankSlipUpload 
        selectedPackForSlip={selectedPackForSlip}
        setSelectedPackForSlip={setSelectedPackForSlip}
        selectedTier={selectedTier}
        setSelectedTier={setSelectedTier}
        contact={contact}
        dragActive={dragActive}
        handleDrag={handleDrag}
        handleDrop={handleDrop}
        handleFileChange={handleFileChange}
        base64Slip={base64Slip}
        setBase64Slip={setBase64Slip}
        slipFeedback={slipFeedback}
        setSlipFeedback={setSlipFeedback}
        handleSlipSubmission={handleSlipSubmission}
        isSubmittingSlip={isSubmittingSlip}
        getTierPriceDisplay={getTierPriceDisplay}
      />
      </AnimatePresence>

      {/* PRIVATE LIVE CHAT SUPPORT INBOX MODAL */}
      <LiveChatModal 
        isSupportModalOpen={isSupportModalOpen}
        setIsSupportModalOpen={setIsSupportModalOpen}
        user={user}
        fetchSupportMessages={fetchSupportMessages}
        isFetchingSupportMsgs={isFetchingSupportMsgs}
        supportMessages={supportMessages}
        currentChatInput={currentChatInput}
        setCurrentChatInput={setCurrentChatInput}
        isSendingSupportMsg={isSendingSupportMsg}
        handleSendSupportMessage={handleSendSupportMessage}
        userChatEndRef={userChatEndRef}
      />

      {/* GLOBAL LOADING OVERLAY */}
      <AnimatePresence>
        {isGlobalLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md"
          >
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              <div className="absolute w-16 h-16 bg-indigo-600/40 rounded-xl border border-indigo-400/50 -rotate-12 animate-pulse" />
              <div className="absolute w-16 h-16 bg-purple-600/40 rounded-xl border border-purple-400/50 rotate-12 animate-pulse delay-75" />
              <div className="relative z-10 w-20 h-20 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center shadow-2xl shadow-indigo-900/50">
                <Globe className="w-10 h-10 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-widest uppercase text-white font-mono mb-2">Connecting</h2>
            <p className="text-sm font-mono text-indigo-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Establishing secure link...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP 2: AUTH SIGN-IN MODAL - UNIFIED ENTRANCE FOR ALL CREDENTIALS */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md my-auto overflow-hidden shadow-2xl p-4 sm:p-6 relative font-sans"
            >
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2 mb-4">
                <span className="inline-block p-2 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-1">
                  <Shield className="w-6 h-6" />
                </span>
                <h3 className="text-lg font-bold text-white font-mono uppercase tracking-tight">Access Gate Identity</h3>
                <p className="text-xs text-slate-400">Connect securely using your credentials or Google integration</p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-xl flex items-start gap-2 text-xs font-mono mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="font-medium">{authError}</p>
                </div>
              )}

              {/* Email Authentication Mode Selector Tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setEmailAuthMode('login');
                    setLoginProvider('email');
                    setAuthError('');
                  }}
                  className={`py-2 text-[11px] font-bold rounded-lg uppercase transition-all cursor-pointer ${
                    emailAuthMode === 'login'
                      ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/10 shadow-sm font-mono'
                      : 'text-slate-500 hover:text-slate-400 font-mono'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailAuthMode('register');
                    setLoginProvider('email');
                    setAuthError('');
                  }}
                  className={`py-2 text-[11px] font-bold rounded-lg uppercase transition-all cursor-pointer ${
                    emailAuthMode === 'register'
                      ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-505/10 shadow-sm font-mono'
                      : 'text-slate-500 hover:text-slate-400 font-mono'
                  }`}
                >
                  Register
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setLoginProvider('email');
                  if (emailAuthMode === 'login') {
                    handleAuthSignIn(e);
                  } else {
                    handleAuthRegister(e);
                  }
                }} 
                className="space-y-4 text-xs font-mono"
              >
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px] font-bold">
                    {emailAuthMode === 'login' ? 'SECURE ACCOUNT EMAIL:' : 'REGISTRATION EMAIL ADDRESS:'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. user@domain.com"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      setLoginProvider('email');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2.5 text-white focus:border-indigo-500 outline-none rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px] font-bold">
                    {emailAuthMode === 'login' ? 'SECURE ACCESS PASSWORD:' : 'CREATE SECURE PASSWORD:'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginProvider('email');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2.5 text-white focus:border-indigo-500 outline-none rounded-xl"
                  />
                </div>

                {emailAuthMode === 'register' && (
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px] font-bold">DISPLAY NICKNAME (OPTIONAL):</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2.5 text-white focus:border-indigo-500 outline-none rounded-xl"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full py-3 font-bold bg-indigo-500 hover:bg-indigo-600 text-white text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isLoginLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> VERIFYING ACCESS...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" /> 
                      {emailAuthMode === 'login' ? 'Secure Account Login' : 'Register New Account'}
                    </>
                  )}
                </button>
              </form>

              {/* Direct Unification: No Separation of Providers */}
              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-[10px] tracking-widest uppercase font-mono">Or connect with</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <div className="flex justify-center w-full pb-2">
                <div id="google-signin-btn-modal" className="w-[320px] h-[40px] flex justify-center" style={{ minHeight: '40px' }}></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>{/* CLOSE RIGHT SIDE MAIN VIEW WRAPPER */}

    </div>
  );
}

