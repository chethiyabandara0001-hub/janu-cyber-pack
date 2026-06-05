import React from 'react';
import { motion } from 'motion/react';
import { User, PaymentSlip, Package, Post, ContactDetails } from '../types';
import { Phone, Send, ExternalLink, MessagesSquare } from 'lucide-react';

interface HomeViewProps {
  user: User | null;
  userSlips: PaymentSlip[];
  packages: Package[];
  posts: Post[];
  contact: ContactDetails | null;
  setShowLoginModal: (show: boolean) => void;
  setIsSupportModalOpen: (show: boolean) => void;
  handleInitiateLogin?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  userSlips,
  packages,
  posts,
  contact,
  setShowLoginModal,
  setIsSupportModalOpen,
  handleInitiateLogin
}) => {
  return (
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
            <h2 className="text-2xl font-bold tracking-tight text-white font-display">Latest Announcements & Guides</h2>
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
            
            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">Hotline Support</p>
                  <p className="text-slate-400 font-mono">{contact.phone}</p>
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
                    className="text-indigo-400 font-mono flex items-center gap-1 hover:underline text-xs"
                  >
                    Channel Link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>


            </div>
          </div>
        )}

        {/* FLOATING DIRECT DEEP CHAT ICON WIDGET */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => {
              if (!user) {
                if (handleInitiateLogin) {
                  handleInitiateLogin();
                } else {
                  setShowLoginModal(true);
                }
              } else {
                setIsSupportModalOpen(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-500/30 hover:scale-105 transition-all cursor-pointer font-sans text-xs font-bold font-mono tracking-wider"
            title="Chat Directly to Admin"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <MessagesSquare className="w-4 h-4 text-white" />
            <span>Support Line</span>
          </button>
        </div>

      </div>

    </div>

    </div>
  );
};
