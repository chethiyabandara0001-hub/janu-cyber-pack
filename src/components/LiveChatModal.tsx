import React from 'react';
import { MessagesSquare, RefreshCw, X, MessageSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, SupportMessage } from '../types';

interface LiveChatModalProps {
  isSupportModalOpen: boolean;
  setIsSupportModalOpen: (val: boolean) => void;
  user: User | null;
  fetchSupportMessages: () => void;
  isFetchingSupportMsgs: boolean;
  supportMessages: SupportMessage[];
  currentChatInput: string;
  setCurrentChatInput: (val: string) => void;
  isSendingSupportMsg: boolean;
  handleSendSupportMessage: (sender: 'user' | 'admin') => void;
  userChatEndRef: React.RefObject<HTMLDivElement | null>;
}

export const LiveChatModal: React.FC<LiveChatModalProps> = ({
  isSupportModalOpen,
  setIsSupportModalOpen,
  user,
  fetchSupportMessages,
  isFetchingSupportMsgs,
  supportMessages,
  currentChatInput,
  setCurrentChatInput,
  isSendingSupportMsg,
  handleSendSupportMessage,
  userChatEndRef
}) => {
  return (
    <AnimatePresence>
      {isSupportModalOpen && user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg h-[85vh] sm:h-[550px] my-auto overflow-hidden shadow-2xl flex flex-col relative"
          >
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/20">
                  <MessagesSquare className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Private Support Chat</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    <span className="text-[10px] text-slate-450 font-mono">Direct Admin Bridge • Active</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchSupportMessages()}
                  className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                  title="Refresh Chat history"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingSupportMsgs ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(false)}
                  className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
              {supportMessages.length === 0 ? (
                <div className="text-center py-24 px-4 space-y-3">
                  <MessageSquare className="w-10 h-10 text-slate-700 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wide">Start Secure Thread</h4>
                  <p className="text-xs text-slate-550 max-w-xs mx-auto leading-relaxed">
                    Send a message below. Our systems support desk will review and provide confidential updates right here.
                  </p>
                </div>
              ) : (
                supportMessages.map((msg) => {
                  const isMe = msg.sender === 'user';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 text-[9px] text-slate-500 mb-1 font-mono">
                        <span>{isMe ? 'You' : 'System Admin'}</span>
                        <span>•</span>
                        <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                      <div 
                        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed font-sans ${
                          isMe 
                            ? 'bg-indigo-600 text-white rounded-tr-none border border-indigo-500 shadow'
                            : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={userChatEndRef} />
            </div>

            {/* Input Footer Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendSupportMessage('user');
              }}
              className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2"
            >
              <input
                type="text"
                value={currentChatInput}
                onChange={(e) => setCurrentChatInput(e.target.value)}
                placeholder="Type your confidential inquiry or support question..."
                className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50 placeholder-slate-600"
                disabled={isSendingSupportMsg}
              />
              <button
                type="submit"
                disabled={isSendingSupportMsg || !currentChatInput.trim()}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSendingSupportMsg ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
