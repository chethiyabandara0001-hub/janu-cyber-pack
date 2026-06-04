import React from 'react';
import { Package, ContactDetails } from '../types';
import { X, Upload, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BankSlipUploadProps {
  selectedPackForSlip: Package | null;
  setSelectedPackForSlip: (pack: Package | null) => void;
  selectedTier: string;
  setSelectedTier: (tier: string) => void;
  contact: ContactDetails | null;
  dragActive: boolean;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  base64Slip: string;
  setBase64Slip: (val: string) => void;
  slipFeedback: { type: 'success' | 'error', message: string } | null;
  setSlipFeedback: (val: { type: 'success' | 'error', message: string } | null) => void;
  handleSlipSubmission: () => void;
  isSubmittingSlip: boolean;
  getTierPriceDisplay: (tierInput: string) => string;
}

export const BankSlipUpload: React.FC<BankSlipUploadProps> = ({
  selectedPackForSlip,
  setSelectedPackForSlip,
  selectedTier,
  setSelectedTier,
  contact,
  dragActive,
  handleDrag,
  handleDrop,
  handleFileChange,
  base64Slip,
  setBase64Slip,
  slipFeedback,
  setSlipFeedback,
  handleSlipSubmission,
  isSubmittingSlip,
  getTierPriceDisplay
}) => {
  return (
    <AnimatePresence>
      {selectedPackForSlip && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ duration: 0.15 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md my-auto shadow-2xl p-4 sm:p-5 relative"
          >
            <button 
              onClick={() => { setSelectedPackForSlip(null); setBase64Slip(''); setSlipFeedback(null); }}
              className="absolute top-4 right-4 p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              Submit Verification Receipt Slip
            </h3>
            <p className="text-xs text-slate-400 mt-1">Submit bank slip for <span className="text-indigo-300 font-bold">{selectedPackForSlip.title}</span></p>

            <div className="mt-4 space-y-3 font-sans">
              
              {/* Package Tier Dropdown Selection */}
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-semibold font-mono uppercase tracking-wider">Select VPN Subscription Tier:</label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500/50 font-sans cursor-pointer"
                >
                  <option value="Lite 100gb for 200lkr">Lite 100gb for 200lkr</option>
                  <option value="Go 200gb for 300lkr">Go 200gb for 300lkr</option>
                  <option value="Pro 300gb for 400lkr">Pro 300gb for 400lkr</option>
                  <option value="Prime 500gb for 500lkr">Prime 500gb for 500lkr</option>
                  <option value="Premium 1000gb for 1000lkr">Premium 1000gb for 1000lkr</option>
                </select>
              </div>

              {/* Cost Tag */}
              <div className="bg-slate-950 px-3 py-2 rounded-lg flex justify-between items-center text-xs font-mono border border-slate-800 animate-fade-in">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Service Fee Due:</span>
                <span className="text-md font-black text-indigo-400 font-mono">{getTierPriceDisplay(selectedTier)}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850/85 text-xs">
                <p className="font-bold text-indigo-400 uppercase tracking-widest font-mono mb-1.5 flex items-center gap-1 text-[10px]">
                  🏦 Bank Transfer Information
                </p>
                <p className="text-slate-400 mb-2 text-[9px] leading-normal font-sans">
                  Please transfer the subscription fee to the official store banking coordinate details below, then upload the receipt/slip below.
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800/30">
                    <span className="text-slate-500 block text-[7px] uppercase">Bank Name</span>
                    <span className="text-slate-200 font-bold">{contact?.bankName || 'Commercial Bank Of Ceylon'}</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800/30">
                    <span className="text-slate-500 block text-[7px] uppercase">Branch</span>
                    <span className="text-slate-200 font-bold">{contact?.bankBranch || 'Colombo Fort'}</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded col-span-2 border border-slate-800/30">
                    <span className="text-slate-500 block text-[7px] uppercase">Account Owner Name</span>
                    <span className="text-slate-200 font-bold">{contact?.bankAccountName || 'DataStore VPN Router Group'}</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded col-span-2 flex justify-between items-center pr-1.5 border border-slate-800/30">
                    <div>
                      <span className="text-slate-500 block text-[7px] uppercase">Account Number</span>
                      <span className="text-indigo-400 font-bold text-[11px]">{contact?.bankAccountNo || '800021398'}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const num = contact?.bankAccountNo || '800021398';
                        navigator.clipboard.writeText(num);
                      }}
                      className="text-[8px] bg-slate-800 hover:bg-slate-750 hover:text-white text-slate-300 px-1.5 py-0.5 rounded transition cursor-pointer"
                      type="button"
                    >
                      Copy No.
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload drag-n-drop panel as requested by Guidelines */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('slip-file-input')?.click()}
                className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                  dragActive ? 'border-indigo-550 bg-indigo-500/[0.03]' : 'border-slate-850 bg-slate-950 hover:border-indigo-500/35'
                }`}
              >
                <input 
                  id="slip-file-input" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />

                {base64Slip ? (
                  <div className="space-y-1.5">
                    <div className="h-16 w-fit mx-auto relative group flex justify-center">
                      <img src={base64Slip} alt="Target slip thumbnail" className="h-full object-contain rounded border border-slate-800" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white">
                        Change file
                      </div>
                    </div>
                    <p className="text-xs text-emerald-400 font-mono flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Slip attachment active!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-indigo-450 animate-pulse">
                      <Upload className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-xs text-slate-200 font-bold">Drag and drop bank receipt image here, or <span className="text-indigo-400 underline">browse</span></p>
                    <p className="text-[9px] text-slate-500 font-mono">Accepts PNG, JPG format bank transfer screenshots</p>
                  </div>
                )}
              </div>

              {slipFeedback && (
                <div className={`p-2.5 rounded-lg flex items-start gap-1.5 text-xs ${
                  slipFeedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                }`}>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <p>{slipFeedback.message}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSlipSubmission}
                  disabled={!base64Slip || isSubmittingSlip}
                  className="flex-1 py-2.5 font-bold text-xs text-white bg-indigo-500 hover:bg-indigo-650 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  {isSubmittingSlip ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
                    </>
                  ) : (
                    'Send Attachment to Backend'
                  )}
                </button>
                <button
                  onClick={() => { setSelectedPackForSlip(null); setBase64Slip(''); setSlipFeedback(null); }}
                  className="px-3.5 py-2.5 text-xs text-slate-400 hover:text-white hover:bg-slate-850 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="bg-slate-950 p-2 rounded-lg text-center text-[9px] text-slate-500 font-mono border border-slate-850">
                🔒 Encrypted attachment router keys compiled safe.
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
