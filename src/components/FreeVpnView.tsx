import React from 'react';
import { User, FreePackage, FreeRequest } from '../types';
import { ChevronRight, ShieldAlert, Layers, AlertCircle, Check, RefreshCw, ExternalLink, Lock, CheckCircle } from 'lucide-react';

interface FreeVpnViewProps {
  user: User | null;
  setLoginProvider: (provider: 'email' | 'google') => void;
  setShowLoginModal: (show: boolean) => void;
  handleInitiateLogin?: () => void;
  selectedFreeIsp: 'Dialog' | 'Mobitel' | 'Hutch' | 'Airtel';
  setSelectedFreeIsp: (val: 'Dialog' | 'Mobitel' | 'Hutch' | 'Airtel') => void;
  selectedFreeType: 'Mobile' | 'Router' | 'Fiber';
  setSelectedFreeType: (val: 'Mobile' | 'Router' | 'Fiber') => void;
  selectedFreePackageId: string;
  setSelectedFreePackageId: (val: string) => void;
  freePackages: FreePackage[];
  freeRequests: FreeRequest[];
  claimedFreeRequest: FreeRequest | null;
  setClaimedFreeRequest: (val: FreeRequest | null) => void;
  freeClaimError: string;
  setFreeClaimError: (val: string) => void;
  adRedirectionCount: number;
  setAdRedirectionCount: (val: number) => void;
  isLoadingActiveAd: boolean;
  handleTriggerAdRedirect: () => void;
  isClaimingFree: boolean;
  handleClaimFreeVpn: (id: string) => void;
}

export const FreeVpnView: React.FC<FreeVpnViewProps> = ({
  user,
  setLoginProvider,
  setShowLoginModal,
  handleInitiateLogin,
  selectedFreeIsp,
  setSelectedFreeIsp,
  selectedFreeType,
  setSelectedFreeType,
  selectedFreePackageId,
  setSelectedFreePackageId,
  freePackages,
  freeRequests,
  claimedFreeRequest,
  setClaimedFreeRequest,
  freeClaimError,
  setFreeClaimError,
  adRedirectionCount,
  setAdRedirectionCount,
  isLoadingActiveAd,
  handleTriggerAdRedirect,
  isClaimingFree,
  handleClaimFreeVpn
}) => {
  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="border-b border-slate-800 pb-4">
        <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          ⚡ Complimentary bypass tunnel gateway
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-white mt-3 mb-1">
          Get Free Unlimited High-Speed VPN
        </h2>
        <p className="text-xs text-slate-400">
          Choose your local Sri Lankan internet service provider (ISP), select your preferred connection interface, and unlock complimentary high-speed bypass codes configuration logs.
        </p>
      </div>

      {/* MAIN SELECTIONS AND CLASSIFICATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* STEP 1: CHOOSE ISP & CONNECTION TYPES */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* ISP CHOOSER SELECTOR CARDS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-bold">
              Line 1: Pick Telecom Operator ( श्रीलंका ISP )
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Dialog' as const, color: 'border-red-500/40 text-red-400 bg-red-500/5', desc: 'Sri Lanka #1' },
                { name: 'Mobitel' as const, color: 'border-green-500/40 text-green-400 bg-green-500/5', desc: 'National Carrier' },
                { name: 'Hutch' as const, color: 'border-orange-500/40 text-orange-400 bg-orange-500/5', desc: 'True Unlimited' },
                { name: 'Airtel' as const, color: 'border-amber-500/40 text-amber-500 bg-amber-500/5', desc: 'High Speed 5G' }
              ].map((isp) => (
                <button
                  key={isp.name}
                  onClick={() => {
                    setSelectedFreeIsp(isp.name);
                    setSelectedFreePackageId('');
                  }}
                  className={`p-3 rounded-xl border flex flex-col text-left transition-all cursor-pointer relative ${
                    selectedFreeIsp === isp.name
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 scale-[1.02] shadow-lg shadow-indigo-950/20 ring-1 ring-indigo-500/50'
                      : 'border-slate-800 text-slate-400 bg-slate-950/40 hover:border-slate-750 hover:text-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs">{isp.name}</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">{isp.desc}</span>
                  
                  {selectedFreeIsp === isp.name && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* INTERFACE TYPE SELECTOR CARDS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-bold">
              Line 2: Pick Interface Interface
            </p>

            <div className="space-y-2">
              {[
                { type: 'Mobile' as const, desc: 'Optimized for Mobile zoom, tik tok & social packets' },
                { type: 'Router' as const, desc: 'Bypass router restrictions with custom WAN tunnels' },
                { type: 'Fiber' as const, desc: 'Direct ultra-high speed Fiber optic configuration codes' }
              ].map((intf) => (
                <button
                  key={intf.type}
                  onClick={() => {
                    setSelectedFreeType(intf.type);
                    setSelectedFreePackageId('');
                  }}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between transition text-left cursor-pointer ${
                    selectedFreeType === intf.type
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 font-bold'
                      : 'border-slate-800 text-slate-400 bg-slate-950/40 hover:border-slate-750'
                  }`}
                >
                  <div>
                    <p className="text-xs font-mono">{intf.type}</p>
                    <p className="text-[9px] text-slate-500 font-sans mt-0.5">{intf.desc}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* STEP 2: SHOW MATCHING FREE PACKAGES */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Guest Account Prompt */}
          {!user && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-4 items-start">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">Client Session is Anonymous</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  You can view all packages and operators, but you must be signed in to submit your request and view your personal free bypass credentials history. Unlocked credentials will sync automatically with your cloud profile.
                </p>
                <button
                  onClick={() => {
                    if (handleInitiateLogin) {
                      handleInitiateLogin();
                    } else {
                      setLoginProvider('email');
                      setShowLoginModal(true);
                    }
                  }}
                  className="mt-3 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-[10px] font-bold text-slate-950 rounded-lg cursor-pointer transition uppercase"
                >
                  🔑 Sign In Now
                </button>
              </div>
            </div>
          )}

          {/* Filter and Match list */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                🌐 Match Result and Available VPN Bundles
              </h3>
              <span className="text-[10px] text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded font-mono border border-slate-850">
                ISP: {selectedFreeIsp} • TYPE: {selectedFreeType}
              </span>
            </div>

            {/* Filtered lists of FreePackages */}
            {freePackages.filter(p => p.isp === selectedFreeIsp && p.packageType === selectedFreeType).length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-slate-950/40 rounded-xl border border-slate-850/60 border-dashed">
                <Layers className="w-8 h-8 text-slate-600 mx-auto opacity-50" />
                <p className="text-xs text-slate-400 font-mono select-none">No free packages uploaded yet for this specific configurations combo.</p>
                {user?.role === 'admin' && (
                  <p className="text-[10px] text-indigo-400 select-none">You can add codes below in administrative parameters!</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {freePackages
                  .filter(p => p.isp === selectedFreeIsp && p.packageType === selectedFreeType)
                  .map((pkg) => {
                    const isSelected = selectedFreePackageId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => {
                          setSelectedFreePackageId(pkg.id);
                          setClaimedFreeRequest(null);
                          setFreeClaimError('');
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30'
                            : 'border-slate-800/80 bg-slate-950/30 hover:border-slate-700 hover:bg-slate-950/50'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase py-0.5 px-2 bg-emerald-500/10 border border-emerald-500/20 rounded">
                              {pkg.price || 'Free'}
                            </span>
                            {isSelected && (
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 antialiased"></span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white mt-2">{pkg.packageName}</h4>
                          <p className="text-[10px] text-slate-400">Sri Lankan ISP tunnel bypass protocols matched.</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-mono">Matched Core DB: {pkg.id}</span>
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 font-mono">
                            LKR 0 LKR
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Submission and loading action center */}
            {selectedFreePackageId && (
              <div className="pt-4 border-t border-slate-800/60 space-y-4">
                
                {freeClaimError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {freeClaimError}
                  </div>
                )}

                {/* Display successful claiming info */}
                {claimedFreeRequest && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-3 animate-fade-in font-mono">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-1">
                      <Check className="w-4 h-4" />
                      Complementary Free VPN Activated Successfully!
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      Your server bypass config has been mapped. Copy this activation token and paste it directly inside your Shadowsocks, V2Ray or Wireguard Client application:
                    </p>
                    <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg flex items-center justify-between gap-4">
                      <span className="text-white text-xs select-all truncate break-all block flex-1 font-mono">{claimedFreeRequest.codeReceived}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(claimedFreeRequest.codeReceived);
                          alert('Activation code copied to clipboard!');
                        }}
                        className="px-2.5 py-1.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold rounded text-[10px] transition shrink-0 uppercase cursor-pointer"
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>
                )}

                {/* Advertisement redirection verification engine */}
                <div className="bg-slate-950/80 border border-slate-850 p-5 rounded-2xl space-y-4 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                      🛡️ Ads Redirection Verification
                    </span>
                    <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      {adRedirectionCount} / 10 Completed
                    </span>
                  </div>

                  <p className="text-slate-400 font-sans leading-relaxed">
                    To authorize secure Sri Lankan telecom bypass keys and deliver configuration log protocols, please complete authentication by opening the active advertisement portal ten (10) times. Overriding limits triggers server sync instantly.
                  </p>

                  {/* Staggered progress grid nodes */}
                  <div className="grid grid-cols-10 gap-1.5">
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const isCompleted = idx < adRedirectionCount;
                      const isActive = idx === adRedirectionCount;
                      return (
                        <div
                          key={idx}
                          className={`h-2 rounded transition-all duration-300 ${
                            isCompleted
                              ? 'bg-emerald-500 shadow-md shadow-emerald-500/20'
                              : isActive
                              ? 'bg-indigo-500 animate-pulse'
                              : 'bg-slate-800'
                          }`}
                          title={`Step ${idx + 1}`}
                        />
                      );
                    })}
                  </div>

                  {/* Interactive Click triggers */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500">
                        Current Mode: {new Date().getHours() >= 6 && new Date().getHours() < 18 ? '☀️ Day Time Ads Active' : '🌙 Night Time Ads Active'}
                      </p>
                      {adRedirectionCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem('free_vpn_clicks_' + selectedFreePackageId, '0');
                            setAdRedirectionCount(0);
                          }}
                          className="text-[9px] text-red-400/80 hover:text-red-400 underline cursor-pointer"
                        >
                          Reset verification counter
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleTriggerAdRedirect}
                      disabled={isLoadingActiveAd || adRedirectionCount >= 10}
                      className={`px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-1.5 transition cursor-pointer ${
                        adRedirectionCount >= 10
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                          : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                      }`}
                    >
                      {isLoadingActiveAd ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Connecting Portal...
                        </>
                      ) : adRedirectionCount >= 10 ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Ad Gate Cleared
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-3.5 h-3.5" />
                          🚀 Redirect & Verify [Step {adRedirectionCount + 1}/10]
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Main activation trigger button */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <p className="text-[10px] text-slate-500 font-mono max-w-sm">
                    {adRedirectionCount < 10 
                      ? `⚠️ Please complete all 10 redirections to unlock complementary VPN files. (Remaining: ${10 - adRedirectionCount})`
                      : '⚡ Tunnel verified successfully! Click to fetch and deploy keys.'}
                  </p>
                  
                  <button
                    onClick={() => handleClaimFreeVpn(selectedFreePackageId)}
                    disabled={isClaimingFree || adRedirectionCount < 10}
                    className={`px-6 py-2.5 text-xs font-bold rounded-xl transition uppercase flex items-center gap-2 shrink-0 cursor-pointer shadow-lg ${
                      isClaimingFree || adRedirectionCount < 10
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750/30'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-950/30 font-extrabold'
                    }`}
                  >
                    {isClaimingFree ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        activating Tunnels...
                      </>
                    ) : adRedirectionCount < 10 ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        CONFIRM & GET CODE
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        CONFIRM & GET CODE
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* CLAIM HISTORY TRACKER (USER DATA COGNIZANT) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
            📁 Your Free Claims & Activation History
          </h3>
          <p className="text-[11px] text-slate-500 font-serif mt-0.5">
            Synchronous logs displaying all your claimed data packets. You can access previously claim vouchers anytime.
          </p>
        </div>

        {!user ? (
          <p className="text-xs text-slate-400 font-mono py-6 text-center">
            Anonymous Session. Please log in to view your claiming logs.
          </p>
        ) : freeRequests.filter(r => r.userId === user.uid).length === 0 ? (
          <p className="text-xs text-slate-400 font-mono py-8 text-center">
            You have not claimed any complimentary VPN packages yet. Try picking your local ISP toClaim your first!
          </p>
        ) : (
          <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-800">
            <table className="w-full text-left text-xs font-mono text-slate-300 border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">ISP</th>
                  <th className="py-2.5">Type</th>
                  <th className="py-2.5">Package</th>
                  <th className="py-2.5">Delivered Voucher Code</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {freeRequests
                  .filter(r => r.userId === user.uid)
                  .map((req) => (
                    <tr key={req.id} className="border-b border-slate-850/60 hover:bg-slate-950/20 transition-all">
                      <td className="py-3 text-slate-400 text-[11px]">
                        {new Date(req.requestedAt).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-white">{req.isp}</span>
                      </td>
                      <td className="py-3 text-slate-400">
                        {req.packageType}
                      </td>
                      <td className="py-3 font-sans font-medium text-slate-200">
                        {req.packageName}
                      </td>
                      <td className="py-3">
                        <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850 text-[11px]" title={req.codeReceived}>
                          {req.codeReceived.substring(0, 16)}...
                        </code>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(req.codeReceived);
                            alert('Copied claimed code to clipboard!');
                          }}
                          className="px-2 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-750 text-indigo-400 text-[10px] rounded transition uppercase cursor-pointer"
                        >
                          Copy Code
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
