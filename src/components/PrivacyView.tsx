import React from 'react';
import { Shield, EyeOff, Lock, FileText, ChevronRight } from 'lucide-react';

interface PrivacyViewProps {
  onBackToHome: () => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ onBackToHome }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -transtall-y-6 translate-x-6 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-mono font-bold tracking-wide uppercase">
            <Shield className="w-3.5 h-3.5" /> SECURITY CERTIFIED
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
            Your telemetry digital footprint is yours alone. At Janu Cyber Pack, privacy is not a feature—it is our absolute architectural foundation. Learn how we handle your information securely.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-4 pt-4 border-t border-slate-800/80">
            <span>EFFECTIVE DATE: <strong className="text-slate-200">JUNE 05, 2026</strong></span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span>VERSION: <strong className="text-indigo-400">V4.9.0 (STABLE)</strong></span>
          </div>
        </div>
      </div>

      {/* Core Privacy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-850 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm tracking-tight">No-Logs Architecture</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We never record, track, or save any metadata concerning your destination IP, web searches, payload, or DNS lookups.
          </p>
        </div>

        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-850 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm tracking-tight">High-Grade Encryption</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All user payloads are tunneled under robust military-grade military AES-256-GCM configurations with forward secrecy.
          </p>
        </div>

        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-850 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm tracking-tight">Data Minimization</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We store only the bare technical requirement like email credentials to register subscriptions, nothing more.
          </p>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-6 md:p-10 space-y-8 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xs text-indigo-400 font-mono font-bold bg-indigo-550/15 px-2 py-0.5 rounded border border-indigo-500/20">01</span>
            Introduction
          </h2>
          <p>
            Welcome to Janu Cyber Pack. We offer top-tier Virtual Private Network (VPN) and tunnel proxy products internationally. We are dedicated to delivering peerless system safety, secure connectivity, and extreme data minimization practices. By joining our network, you place your trust in us, and we work to honor that commitment daily.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xs text-indigo-400 font-mono font-bold bg-indigo-550/15 px-2 py-0.5 rounded border border-indigo-500/20">02</span>
            No-Logs Philosophy & Zero Network Traces
          </h2>
          <p>
            We enforce a strict physical <strong className="text-white">No-Logs System</strong>. We do not inspect or maintain packet logs during network tunneling.
          </p>
          <p>
            Neither our hosting provider setups, VPS hypervisors, nor internal logging queues have persistent capacity to trace user interaction records to physical endpoints. Our software stack uses ephemeral RAM allocations to support dynamic routing speeds.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xs text-indigo-400 font-mono font-bold bg-indigo-550/15 px-2 py-0.5 rounded border border-indigo-500/20">03</span>
            Technical Data & Personal Information We Collect
          </h2>
          <p>
            To activate and control premium subscriptions, we collect limited structural data, defined as follows:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2 text-slate-400">
            <li><strong className="text-slate-200">Email Address:</strong> Used solely to log in, associate premium licenses, and prevent service disruptions.</li>
            <li><strong className="text-slate-200">Verification Slips:</strong> Digital bank slips uploaded for package activation are held securely on Google Cloud storage for order validation and auditing.</li>
            <li><strong className="text-slate-200">Server Metrics:</strong> Realtime anonymous system performance data like active payload bandwidth indices, aggregated to load-balance server clusters worldwide.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xs text-indigo-400 font-mono font-bold bg-indigo-550/15 px-2 py-0.5 rounded border border-indigo-500/20">04</span>
            Cookie and Ad policy
          </h2>
          <p>
            We make use of extremely simple local storage tokens on the client client side to remember login parameters and sidebar preferences. Our ads system processes an anonymous click counter (bounded up to 10 redirect validations) to let users unlock completely free daily premium configurations without financial charges.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xs text-indigo-400 font-mono font-bold bg-indigo-550/15 px-2 py-0.5 rounded border border-indigo-500/20">05</span>
            Data Protection Rights
          </h2>
          <p>
            You are fully authorized to request the permanent deletion of your account and related transactional logs. Simply open our Live Chat Panel or coordinate directly with our Support Engineers to erase email and transaction data completely from our database cluster within 24 hours.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xs text-indigo-400 font-mono font-bold bg-indigo-550/15 px-2 py-0.5 rounded border border-indigo-500/20">06</span>
            Policy Revisions
          </h2>
          <p>
            We reserve the right to revise this Privacy Policy periodically. We will push notifications through our Home Dashboard announcements system when significant upgrades take effect.
          </p>
        </section>
      </div>

      {/* Footer Return Call */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onBackToHome}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 hover:scale-102 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-950/50 cursor-pointer flex items-center gap-2"
        >
          Return to Dashboard <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
