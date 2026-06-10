import React from 'react';
import { Lock, RefreshCw, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';

interface FeatureLockViewProps {
  adRedirectionCount: number;
  setAdRedirectionCount: (val: number) => void;
  isLoadingActiveAd: boolean;
  handleTriggerAdRedirect: () => void;
  user: any;
  customHeading?: string;
  customDescription?: string;
}

export const FeatureLockView: React.FC<FeatureLockViewProps> = ({
  adRedirectionCount,
  setAdRedirectionCount,
  isLoadingActiveAd,
  handleTriggerAdRedirect,
  user,
  customHeading = "🔒 Premium Security Verification Required",
  customDescription = "To prevent automated scraping and network congestion, standard users must verify 10 secure ad redirections to access this premium feature."
}) => {

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset your verification progress to Stage 0?")) {
      localStorage.setItem('free_vpn_global_clicks', '0');
      setAdRedirectionCount(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-12 animate-fade-in font-sans px-4">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl shadow-indigo-950/20 relative overflow-hidden text-slate-200">
        <div className="absolute top-0 right-0 -translate-y-8 translate-x-8 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="text-center space-y-3 pb-6 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/35 text-indigo-400 flex items-center justify-center mx-auto text-xl shadow-lg animate-pulse">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight font-display">{customHeading}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {customDescription}
          </p>
        </div>

        {/* Verification Board */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
              🛡️ Gateway Verification Index
            </span>
            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-bold">
              {adRedirectionCount} / 10 Stages Completed
            </span>
          </div>

          <div className="text-[10px] text-slate-400 bg-slate-900/40 border border-slate-850/60 p-2.5 rounded-lg text-center font-sans">
            {adRedirectionCount >= 10 ? (
              <span className="text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> All 10 Stages fully authorized. Locked state removed!
              </span>
            ) : (
              <span>
                Current Status: <strong className="text-indigo-400 font-mono">Stage {adRedirectionCount + 1} Pending</strong>
              </span>
            )}
          </div>

          {/* Staggered progress grid nodes */}
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 10 }).map((_, idx) => {
              const isCompleted = idx < adRedirectionCount;
              const isActive = idx === adRedirectionCount;
              return (
                <div
                  key={idx}
                  className={`h-2.5 rounded transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 shadow-md shadow-emerald-500/20'
                      : isActive
                      ? 'bg-indigo-500 animate-pulse'
                      : 'bg-slate-800'
                  }`}
                  title={`Stage ${idx + 1}`}
                />
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              {adRedirectionCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="text-[9px] text-red-500/80 hover:text-red-400 underline cursor-pointer"
                >
                  Reset Verification progress
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isLoadingActiveAd || adRedirectionCount >= 10}
                onClick={handleTriggerAdRedirect}
                className={`px-4 py-2 font-sans font-bold text-xs uppercase rounded-lg flex items-center gap-1.5 transition select-none cursor-pointer ${
                  adRedirectionCount >= 10
                    ? 'bg-slate-800 text-slate-500 border border-slate-750/30 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/20 hover:scale-[1.01]'
                }`}
              >
                {isLoadingActiveAd ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Loading Gateway...
                  </>
                ) : adRedirectionCount >= 10 ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    Verify Stage {adRedirectionCount + 1}/10
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
