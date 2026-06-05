import React from 'react';
import { Scale, HeartHandshake, AlertCircle, ShieldAlert, ChevronRight } from 'lucide-react';

interface TermsViewProps {
  onBackToHome: () => void;
}

export const TermsView: React.FC<TermsViewProps> = ({ onBackToHome }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -transtall-y-6 translate-x-6 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-full text-xs font-mono font-bold tracking-wide uppercase">
            <Scale className="w-3.5 h-3.5" /> LEGAL AGREEMENT
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
            Please read these terms carefully before accessing or executing security procedures on our network. By utilizing Janu Cyber Pack, you agree to these transparent usage standards.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-4 pt-4 border-t border-slate-800/80">
            <span>LAST MODIFIED: <strong className="text-slate-200">JUNE 05, 2026</strong></span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span>LICENSE ENFORCEMENT: <strong className="text-pink-400">ACTIVE</strong></span>
          </div>
        </div>
      </div>

      {/* Terms Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-850 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm tracking-tight">Acceptable Usage</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All bandwidth allocations must comply with fair network standards, respecting intellectual boundaries and local guidelines.
          </p>
        </div>

        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-850 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm tracking-tight">Zero Malicious Activity</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Any attempt to deploy malware, perform distributed brute-force scans, or execute botnet exploits will trigger automatic terminal block.
          </p>
        </div>

        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-850 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm tracking-tight">Honest Order Verification</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All client activation slips must prove legitimate bank transfers. Duplicate, altered, or fraudulent slip uploads automatically ban user profiles.
          </p>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-6 md:p-10 space-y-8 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xs text-pink-400 font-mono font-bold bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">01</span>
            Acceptance of Service Terms
          </h2>
          <p>
            By establishing connections to the Janu Cyber Pack, you represent that you have read, processed, and aligned yourself with this agreement. If you differ from any specification written here, you must cease all tunneling procedures and close our client systems immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xs text-pink-400 font-mono font-bold bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">02</span>
            Eligibility & Client Responsibilities
          </h2>
          <p>
            You are entirely responsible for local regulatory requirements while accessing proxy networks. Our systems obfuscate traffic parameters to guard confidential digital assets, but we do not encourage or condone illegal acts on the internet.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xs text-pink-400 font-mono font-bold bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">03</span>
            Prohibited Technical Conduct
          </h2>
          <p>
            Users are explicitly prohibited from performing these technical operations over our tunnel nodes:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2 text-slate-400">
            <li>Initiating mass outbound email streams (Spamming) or SMTP relays.</li>
            <li>Inundating external hosts with DDoS bursts or port scans.</li>
            <li>Re-selling premium keys, system links, or WireGuard credentials without formal developer permissions.</li>
            <li>Bypassing administrative restrictions or launching exploits against internal core databases.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xs text-pink-400 font-mono font-bold bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">04</span>
            Premium Packages, Billing & Manual Verify
          </h2>
          <p>
            Our premium servers require financial fuel to stay sustained. Package subscription activations are validated manually when you upload local bank slips. 
          </p>
          <p>
            Our financial administrators verify claims chronologically during active windows. Uploading forged bank receipt graphics triggers standard verification failure and immediately flags the associated profile for automated administrative deletion.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xs text-pink-400 font-mono font-bold bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">05</span>
            Uptime & Connection Speeds Disclaimer
          </h2>
          <p>
            We deploy configurations on optimized Linux environments across multiple coordinates. Uptime goals are 99.9%. However, because international ISP networks, sub-sea cables, and carrier gateway nodes are outside of our physical boundary, we cannot issue speed guarantees. Service is offered on an "as-is" and "as available" basis.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xs text-pink-400 font-mono font-bold bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">06</span>
            Account Suspension Procedures
          </h2>
          <p>
            We reserve absolute discretion to suspend active sessions or delete accounts flagged for network abuse. No refunds will be calculated or distributed in instances of policy violations.
          </p>
        </section>
      </div>

      {/* Footer Return Call */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onBackToHome}
          className="px-6 py-3 bg-pink-600 hover:bg-pink-500 hover:scale-102 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-950/50 cursor-pointer flex items-center gap-2"
        >
          I Accept & Agree <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
