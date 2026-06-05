import React from 'react';
import { Package, User } from '../types';
import { Upload } from 'lucide-react';

interface PackagesViewProps {
  packages: Package[];
  user: User | null;
  setShowLoginModal: (show: boolean) => void;
  setSelectedPackForSlip: (pkg: Package) => void;
  handleInitiateLogin?: () => void;
}

export const PackagesView: React.FC<PackagesViewProps> = ({
  packages,
  user,
  setShowLoginModal,
  setSelectedPackForSlip,
  handleInitiateLogin
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1 font-display">Stealth Unlimited Data Subscriptions</h2>
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

              {/* Package details body */}
              <div className="p-6 flex-1 flex flex-col pt-12">
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
                    <p className="text-xs font-semibold text-slate-400 mt-1 uppercase font-mono tracking-wider">
                      Select in Checkout
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (!user) {
                        if (handleInitiateLogin) {
                          handleInitiateLogin();
                        } else {
                          setShowLoginModal(true);
                        }
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
  );
};
