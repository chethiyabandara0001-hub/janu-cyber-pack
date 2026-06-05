import React from 'react';
import { Network, Home, Box, Eye, Scale, FileText, Bot, ArrowUpRight } from 'lucide-react';

interface SitemapsViewProps {
  onNavigate: (tab: 'home' | 'packages' | 'dashboard' | 'admin' | 'free-vpn' | 'privacy' | 'terms' | 'sitemaps') => void;
}

export const SitemapsView: React.FC<SitemapsViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -transtall-y-6 translate-x-6 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-mono font-bold tracking-wide uppercase">
            <Network className="w-3.5 h-3.5" /> Site Index
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-display">
            Sitemaps Navigation Index
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
            Welcome to the visual crawling sitemap. Below is a structured index of all active pathways, interfaces, and legal schemas registered on the Janu Cyber Pack server.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-4 pt-4 border-t border-slate-800/80">
            <span>INDEX STATUS: <strong className="text-emerald-400">100% HEALTHY</strong></span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span>CRAWL FREQUENCY: <strong className="text-amber-400">WEEKLY</strong></span>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="bg-slate-900/10 border border-slate-850 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Network className="text-indigo-400 w-5 h-5 animate-pulse" /> Accessible Directories
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() => onNavigate('home')}
            className="group text-left p-5 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-indigo-500/40 hover:bg-slate-900 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                <Home className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                Home Dashboard
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <span className="block text-xs text-slate-400 leading-relaxed">Official gateway, operational notices, and latest safety announcements.</span>
          </button>

          <button 
            type="button"
            onClick={() => onNavigate('packages')}
            className="group text-left p-5 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-indigo-500/40 hover:bg-slate-900 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                <Box className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                VPN Subscriptions
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <span className="block text-xs text-slate-400 leading-relaxed">Secure global configurations including WireGuard, Stealth Vmess, and SSH.</span>
          </button>

          <button 
            type="button"
            onClick={() => onNavigate('free-vpn')}
            className="group text-left p-5 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-indigo-500/40 hover:bg-slate-900 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                <Bot className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                Free Tunnel Configs
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <span className="block text-xs text-slate-400 leading-relaxed">Access daily free keys for Dialog, Mobitel, and Hutch networks.</span>
          </button>

          <button 
            type="button"
            onClick={() => onNavigate('privacy')}
            className="group text-left p-5 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-indigo-500/40 hover:bg-slate-900 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                <Eye className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                Privacy Safeguards
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <span className="block text-xs text-slate-400 leading-relaxed">Deep review of our No-Logs pledge, database safety, and cookies.</span>
          </button>

          <button 
            type="button"
            onClick={() => onNavigate('terms')}
            className="group text-left p-5 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-indigo-500/40 hover:bg-slate-900 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                <Scale className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                Terms of Service
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <span className="block text-xs text-slate-400 leading-relaxed">Acceptable network usage rules, refunds agreement, and policies.</span>
          </button>
        </div>
      </div>

      {/* Raw crawler document bridges */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-white font-bold text-sm">Server-Level Robot Metadata</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md">Access raw static configurations designed instantly to guide automated crawling algorithms like Googlebot and Bingbot.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto shrink-0 justify-end">
          <a 
            href="/sitemap.xml" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-emerald-500/30 font-mono text-xs text-slate-300 hover:text-emerald-400 rounded-xl transition duration-300 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> Index XML
          </a>
          <a 
            href="/robots.txt" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-amber-500/30 font-mono text-xs text-slate-300 hover:text-amber-400 rounded-xl transition duration-300 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> robots.txt
          </a>
        </div>
      </div>
    </div>
  );
};
