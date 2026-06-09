import React from 'react';
import { User, PaymentSlip } from '../types';
import { Inbox, CheckCircle, ExternalLink } from 'lucide-react';

interface UserDashboardViewProps {
  user: User;
  userSlips: PaymentSlip[];
  superAdminAdUrl?: string;
  dashboardAdPlayCount: number;
  onTriggerDashboardAd: () => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  user,
  userSlips,
  superAdminAdUrl,
  dashboardAdPlayCount,
  onTriggerDashboardAd
}) => {
  return (
    <div className="space-y-8 animate-fade-in text-slate-200">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1 font-display">User Subscriptions & Usage Tracker</h2>
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

        <div className="mt-6">
          {userSlips.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No bank slips submitted from your user account yet.</p>
          ) : (
            <>
              {/* Desktop table view */}
              <div className="hidden sm:block overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-800">
                <table className="w-full text-left text-xs min-w-[700px]">
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
              </div>

              {/* Mobile responsive card list */}
              <div className="block sm:hidden space-y-4">
                {userSlips.map((s) => (
                  <div key={s.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 text-xs font-sans">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-mono text-[10px]">ID: {s.id.split('_')[1] || s.id}</span>
                      <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold text-[10px] ${
                        s.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                        s.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{s.packageTitle}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">Submitted: {new Date(s.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-900 text-xs text-slate-300">
                      <p className="font-bold text-emerald-400 font-mono">{s.currency} {s.price}</p>
                      <a 
                        href={s.bankSlipBase64} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-indigo-400 hover:underline text-[11px] font-mono inline-flex items-center gap-1 cursor-pointer"
                      >
                        Open Slip File <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
};
