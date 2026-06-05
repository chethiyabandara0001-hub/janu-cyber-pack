import React, { useState } from 'react';
import { 
  Inbox, Layers, Server, Sparkles, Database, ChevronRight, ChevronLeft, Globe, LogIn, Loader2 
} from 'lucide-react';
import { User } from '../types';
import { AnimatePresence, motion } from 'motion/react';

interface SidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
  activeTab: 'home' | 'packages' | 'dashboard' | 'admin' | 'free-vpn';
  setActiveTab: (tab: 'home' | 'packages' | 'dashboard' | 'admin' | 'free-vpn') => void;
  user: User | null;
  setLoginProvider: (provider: 'google' | 'email') => void;
  setShowLoginModal: (show: boolean) => void;
  handleInitiateLogin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  activeTab,
  setActiveTab,
  user,
  setLoginProvider,
  setShowLoginModal,
  handleInitiateLogin
}) => {
  const handleLogoClick = () => {
    if (!user) {
      if (handleInitiateLogin) {
        handleInitiateLogin();
      } else {
        setLoginProvider('email');
        setShowLoginModal(true);
      }
    } else {
      setActiveTab('home');
    }
  };

  return (
    <>
      <aside className={`hidden md:flex ${sidebarCollapsed ? 'w-20' : 'w-64'} bg-slate-900 border-r border-slate-800 flex-col shrink-0 min-h-screen text-slate-400 transition-all duration-300 ease-in-out relative`}>
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3.5 top-8 z-50 bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-800 text-slate-400 p-1.5 rounded-full cursor-pointer transition-all duration-200 shadow-lg group"
          id="sidebar-toggle-btn"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform text-indigo-400 group-hover:text-white" />
          ) : (
            <ChevronLeft className="w-4 h-4 group-hover:scale-110 transition-transform text-indigo-400 group-hover:text-white" />
          )}
        </button>

        <div className={`p-6 ${sidebarCollapsed ? 'px-2 flex flex-col items-center justify-center' : ''}`} id="sidebar-header">
          <div className="flex items-center gap-3 group/logo cursor-pointer" onClick={handleLogoClick} title={!user ? "Sign In to Client Portal" : "Go to Dashboard"}>
            <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
              <div className="absolute w-7 h-7 bg-indigo-600/40 rounded-lg border border-indigo-400/50 -rotate-12 transition-all duration-500 group-hover/logo:-rotate-[25deg] group-hover/logo:scale-110" />
              <div className="absolute w-7 h-7 bg-purple-600/40 rounded-lg border border-purple-400/50 rotate-12 transition-all duration-500 group-hover/logo:rotate-[25deg] group-hover/logo:scale-110" />
              <div className="relative z-10 w-8 h-8 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center shadow-lg shadow-indigo-900/50 backdrop-blur-md">
                <Globe className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.8)] animate-pulse group-hover/logo:scale-110 transition-transform" />
              </div>
            </div>
            {!sidebarCollapsed && (
              <div className="animate-fade-in whitespace-nowrap overflow-hidden">
                <h1 className="text-lg font-extrabold tracking-tight text-white font-display group-hover/logo:text-indigo-400 transition-colors">Janu Cyber Pack</h1>
              </div>
            )}
          </div>
        </div>
      
      <nav className={`flex-1 px-4 space-y-1.5 ${sidebarCollapsed ? 'px-2 flex flex-col items-center' : ''}`} id="sidebar-nav">
        <button
          onClick={() => setActiveTab('home')}
          className={`w-full py-2.5 rounded-lg flex items-center transition text-left cursor-pointer text-xs ${
            sidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'
          } ${
            activeTab === 'home' 
              ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/10' 
              : 'hover:bg-slate-800/60 hover:text-slate-200 text-slate-400 border border-transparent'
          }`}
          title="DASHBOARD"
        >
          <Inbox className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && <span className="animate-fade-in font-semibold tracking-wider">DASHBOARD</span>}
        </button>
        
        <button
          onClick={() => setActiveTab('packages')}
          className={`w-full py-2.5 rounded-lg flex items-center transition text-left cursor-pointer text-xs ${
            sidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'
          } ${
            activeTab === 'packages' 
              ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/10' 
              : 'hover:bg-slate-800/60 hover:text-slate-200 text-slate-400 border border-transparent'
          }`}
          title="VPN PACKAGES"
        >
          <Layers className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && <span className="animate-fade-in font-semibold tracking-wider">VPN PACKAGES</span>}
        </button>

        {user && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full py-2.5 rounded-lg flex items-center transition text-left cursor-pointer text-xs ${
              sidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'
            } ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/10' 
                : 'hover:bg-slate-800/60 hover:text-slate-200 text-slate-400 border border-transparent'
            }`}
            title="My Account"
          >
            <Server className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="animate-fade-in">My Account</span>}
          </button>
        )}

        <button
          onClick={() => setActiveTab('free-vpn')}
          className={`w-full py-2.5 rounded-lg flex items-center transition text-left cursor-pointer text-xs ${
            sidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'
          } ${
            activeTab === 'free-vpn' 
              ? 'bg-emerald-550/10 text-emerald-400 font-bold border border-emerald-500/10 font-mono' 
              : 'hover:bg-slate-800/60 hover:text-slate-200 text-slate-400 border border-transparent'
          }`}
          title="Get Free VPN"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          {!sidebarCollapsed && <span className="animate-fade-in font-mono">get free vpn</span>}
        </button>

        {user?.role === 'admin' && (
          <div className={`pt-6 ${sidebarCollapsed ? 'w-full flex flex-col items-center' : 'w-full'}`}>
            {!sidebarCollapsed ? (
              <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-fade-in">Admin Tools</p>
            ) : (
              <span className="block h-px w-8 bg-slate-800 my-2" />
            )}
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full py-2.5 rounded-lg flex items-center transition text-left cursor-pointer text-xs ${
                sidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'
              } ${
                activeTab === 'admin' 
                  ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/10' 
                  : 'hover:bg-slate-800/60 hover:text-slate-200 text-slate-400 border border-transparent'
              }`}
              title="Admin Control Panel"
            >
              <Database className="w-4 h-4 text-amber-500 shrink-0" />
              {!sidebarCollapsed && <span className="animate-fade-in">Admin Panel ⭐</span>}
            </button>
          </div>
        )}
      </nav>

      {/* Sidebar Footer User Info */}
      <div className={`p-4 border-t border-slate-800 mt-auto ${sidebarCollapsed ? 'px-2 flex justify-center' : ''}`}>
        {user ? (
          <div className={`flex items-center px-2 ${sidebarCollapsed ? 'justify-center px-0' : 'gap-3'}`}>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs uppercase shadow-sm shrink-0">
              {user.displayName.substring(0, 2)}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1 animate-fade-in">
                <p className="text-xs font-bold text-slate-200 truncate">{user.displayName}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
        ) : (
          <div className={`px-2 ${sidebarCollapsed ? 'px-0 text-center' : ''}`}>
            {!sidebarCollapsed ? (
              <>
                <p className="text-[10px] text-slate-500">Guest Session Mode</p>
                <button
                  onClick={handleLogoClick}
                  className="mt-1 text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign in to start
                </button>
              </>
            ) : (
              <button
                onClick={handleLogoClick}
                className="p-1 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/20 flex items-center justify-center cursor-pointer"
                title="Sign In"
              >
                <LogIn className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
    </>
  );
};
