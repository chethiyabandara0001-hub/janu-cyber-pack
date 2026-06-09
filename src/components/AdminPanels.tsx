import React from 'react';
import { 
  Phone, Mail, Lock, RefreshCw, MessagesSquare, MessageSquare, Send 
} from 'lucide-react';
import { ContactDetails, SupportMessage } from '../types';

interface AdminContactDetailsProps {
  contact: ContactDetails | null;
  editingContact: Partial<ContactDetails> | null;
  setEditingContact: (val: Partial<ContactDetails> | null) => void;
  handleSaveContactDetails: (e: React.FormEvent) => void;
}

export const AdminContactDetails: React.FC<AdminContactDetailsProps> = ({
  contact,
  editingContact,
  setEditingContact,
  handleSaveContactDetails
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
        📞 Configure Store Public Contact Details
      </h3>

      {!editingContact && contact && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-4 text-xs">
          <div>
            <p className="font-bold text-indigo-400 font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5 pb-1 border-b border-slate-855 text-[11px]">
              📞 Core Public Support Info
            </p>
            <div className="space-y-1.5 font-sans">
              <div className="flex justify-between py-1 border-b border-slate-855/40">
                <span className="text-slate-400">Phone Support:</span>
                <span className="text-white font-mono font-semibold">{contact.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-855/40">
                <span className="text-slate-400">Admin Email:</span>
                <span className="text-white font-mono font-semibold">{contact.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-855/40">
                <span className="text-slate-400">Telegram Channel:</span>
                <span className="text-indigo-400 font-mono font-semibold truncate max-w-[150px]" title={contact.telegramChannel}>{contact.telegramChannel || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Telegram Bot USER:</span>
                <span className="text-indigo-400 font-mono font-bold">@{contact.telegramBotUser || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="font-bold text-yellow-500 font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5 pb-1 border-b border-slate-855 text-[11px]">
              🏦 Registered Store Bank Accounts
            </p>
            <div className="space-y-1.5 font-sans">
              <div className="flex justify-between py-1 border-b border-slate-855/40">
                <span className="text-slate-400">Bank Name:</span>
                <span className="text-slate-200 font-semibold">{contact.bankName || 'Commercial Bank Of Ceylon'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-855/40">
                <span className="text-slate-400">Branch Name:</span>
                <span className="text-slate-200 font-semibold">{contact.bankBranch || 'Colombo Fort'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-855/40">
                <span className="text-slate-400">Account Owner Name:</span>
                <span className="text-slate-200 font-semibold">{contact.bankAccountName || 'DataStore VPN Router Group'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Account Number:</span>
                <span className="text-indigo-400 font-mono font-bold text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{contact.bankAccountNo || '800021398'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setEditingContact(contact || {phone: '', email: '', telegramChannel: '', telegramBotUser: '', address: '', workingHours: '', bankName: '', bankBranch: '', bankAccountNo: '', bankAccountName: ''})}
        className="mt-4 w-full px-4 py-2.5 font-bold text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-slate-850 transition cursor-pointer text-center block"
      >
        {editingContact ? 'Cancel & Close Settings' : '✏️ Configure Company Contacts & Banking Credentials'}
      </button>

      {editingContact && (
        <form onSubmit={handleSaveContactDetails} className="mt-4 space-y-3 text-xs animate-fade-in">
          <div>
            <label className="block text-slate-400">Phone Hotline:</label>
            <input
              type="text"
              value={editingContact.phone || ''}
              onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})}
              className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-slate-400">Public Administrative Email:</label>
            <input
              type="text"
              value={editingContact.email || ''}
              onChange={(e) => setEditingContact({...editingContact, email: e.target.value})}
              className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-slate-400">Telegram Channel link:</label>
            <input
              type="text"
              value={editingContact.telegramChannel || ''}
              onChange={(e) => setEditingContact({...editingContact, telegramChannel: e.target.value})}
              className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-slate-400">Telegram Verification Bot username:</label>
            <input
              type="text"
              value={editingContact.telegramBotUser || ''}
              onChange={(e) => setEditingContact({...editingContact, telegramBotUser: e.target.value})}
              className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="border-t border-slate-800 pt-3 mt-3">
            <p className="font-bold text-indigo-300 mb-2 font-mono uppercase tracking-wide">🏦 Store Admin Bank Transfer Coordinates</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400">Bank Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Commercial Bank"
                  value={editingContact.bankName || ''}
                  onChange={(e) => setEditingContact({...editingContact, bankName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-slate-400">Branch Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Colombo Fort"
                  value={editingContact.bankBranch || ''}
                  onChange={(e) => setEditingContact({...editingContact, bankBranch: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-slate-400">Account Owner Name:</label>
                <input
                  type="text"
                  placeholder="e.g. DataStore VPN (Pvt) Ltd"
                  value={editingContact.bankAccountName || ''}
                  onChange={(e) => setEditingContact({...editingContact, bankAccountName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-slate-400">Account Number:</label>
                <input
                  type="text"
                  placeholder="e.g. 800021398"
                  value={editingContact.bankAccountNo || ''}
                  onChange={(e) => setEditingContact({...editingContact, bankAccountNo: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded cursor-pointer transition shadow">
              Save Contacts & Bank Details
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

interface AdminCustomerChatsProps {
  supportMessages: SupportMessage[];
  users?: any[];
  activeUserChatId: string | null;
  setActiveUserChatId: (val: string | null) => void;
  currentChatInput: string;
  setCurrentChatInput: (val: string) => void;
  isFetchingSupportMsgs: boolean;
  isSendingSupportMsg: boolean;
  fetchSupportMessages: (activeChatId?: string) => void;
  handleSendSupportMessage: (
    sender: 'user' | 'admin', 
    customUserId?: string, 
    customUserName?: string, 
    customUserEmail?: string
  ) => void;
}

export const AdminCustomerChats: React.FC<AdminCustomerChatsProps> = ({
  supportMessages,
  users = [],
  activeUserChatId,
  setActiveUserChatId,
  currentChatInput,
  setCurrentChatInput,
  isFetchingSupportMsgs,
  isSendingSupportMsg,
  fetchSupportMessages,
  handleSendSupportMessage
}) => {
  const chatThreadsMap: { [userId: string]: { userName: string, userEmail: string, messages: SupportMessage[], lastMsgAt: string } } = {};
  
  users.forEach(u => {
    chatThreadsMap[u.uid] = {
      userName: u.displayName || 'Anonymous User',
      userEmail: u.email || 'anonymous@datastore.shop',
      messages: [],
      lastMsgAt: ''
    };
  });

  supportMessages.forEach(msg => {
    const uid = msg.userId;
    if (!chatThreadsMap[uid]) {
      chatThreadsMap[uid] = {
        userName: msg.userName || 'Anonymous User',
        userEmail: msg.userEmail || 'anonymous@datastore.shop',
        messages: [],
        lastMsgAt: msg.timestamp || ''
      };
    }
    chatThreadsMap[uid].messages.push(msg);
    if ((msg.timestamp || '') > chatThreadsMap[uid].lastMsgAt) {
      chatThreadsMap[uid].lastMsgAt = msg.timestamp || '';
    }
  });

  const sortedThreads = Object.keys(chatThreadsMap).map(uid => {
    const thread = chatThreadsMap[uid];
    const isUnread = thread.messages.length > 0 && thread.messages[thread.messages.length - 1].sender === 'user';
    return {
      userId: uid,
      isUnread,
      ...thread
    };
  }).sort((a, b) => {
    if (a.isUnread && !b.isUnread) return -1;
    if (!a.isUnread && b.isUnread) return 1;
    if (!a.lastMsgAt && !b.lastMsgAt) return a.userName.localeCompare(b.userName);
    if (!a.lastMsgAt) return 1;
    if (!b.lastMsgAt) return -1;
    return b.lastMsgAt.localeCompare(a.lastMsgAt);
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6 shadow-xl">
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <MessagesSquare className="w-4 h-4 text-indigo-400" />
            💬 8. CUSTOMER CHATS & PRIVACY SUPPORT LOGS
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Read and reply privately of direct support inquiries submitted by registered customers and guest clients.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchSupportMessages(activeUserChatId || undefined)}
          className="px-3 py-1.5 bg-slate-950 border border-slate-855 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg text-xs font-mono transition flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isFetchingSupportMsgs ? 'animate-spin' : ''}`} />
          <span>Refresh Chats</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[400px]">
        {/* Left Pane - Active Threads List */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex flex-col max-h-[450px]">
          <div className="p-3 bg-slate-900 border-b border-slate-850">
            <p className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider">Active Conversations ({sortedThreads.length})</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-855 scrollbar-thin scrollbar-thumb-slate-800">
            {sortedThreads.length === 0 ? (
              <p className="p-8 text-xs text-slate-550 text-center italic">No customer chats initialized yet.</p>
            ) : (
              sortedThreads.map(thr => {
                const isSelected = activeUserChatId === thr.userId;
                const unreplied = thr.messages[thr.messages.length - 1]?.sender === 'user';
                return (
                  <button
                    key={thr.userId}
                    type="button"
                    onClick={() => setActiveUserChatId(thr.userId)}
                    className={`w-full p-3.5 text-left transition-all flex items-start gap-2.5 text-xs select-none block hover:bg-slate-950/60 ${
                      isSelected ? 'bg-slate-900 border-l-2 border-indigo-500' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-slate-200 truncate">{thr.userName}</p>
                        {unreplied && (
                          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" title="Needs reply"></span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-550 font-mono truncate">{thr.userEmail}</p>
                      {thr.messages.length > 0 ? (
                        <p className="text-[10px] text-slate-400 mt-1 truncate italic">
                          "{thr.messages[thr.messages.length - 1]?.message}"
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 mt-1 truncate italic">
                          No messages yet
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane - Chat Window */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex flex-col h-[450px]">
          {activeUserChatId && chatThreadsMap[activeUserChatId] ? (
            (() => {
              const activeThread = chatThreadsMap[activeUserChatId];
              const conversation = [...activeThread.messages].sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));

              return (
                <>
                  <div className="p-3 bg-slate-900 border-b border-slate-850 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white font-sans">{activeThread.userName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{activeThread.userEmail}</p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono rounded">
                      ID: {activeUserChatId.substring(0, 8)}...
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800 flex flex-col animate-fade-in">
                    {conversation.length === 0 ? (
                      <p className="text-center text-slate-500 text-xs mt-10 italic flex-1">No message history with this user yet. You can start a conversation below.</p>
                    ) : (
                      conversation.map(msg => {
                        const isAdminSender = msg.sender === 'admin';
                        return (
                          <div 
                            key={msg.id} 
                            className={`flex flex-col ${isAdminSender ? 'items-end' : 'items-start'}`}
                          >
                            <span className="text-[8px] text-slate-500 mb-0.5 font-mono">
                              {isAdminSender ? 'You (Admin)' : activeThread.userName} • {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                            </span>
                            <div 
                              className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                                isAdminSender 
                                  ? 'bg-indigo-600 text-white rounded-tr-none'
                                  : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendSupportMessage(
                        'admin', 
                        activeUserChatId, 
                        activeThread.userName, 
                        activeThread.userEmail
                      );
                    }}
                    className="p-3 bg-slate-900 border-t border-slate-855 flex gap-2"
                  >
                    <input
                      type="text"
                      value={currentChatInput}
                      onChange={(e) => setCurrentChatInput(e.target.value)}
                      placeholder={`Send confidential response back to ${activeThread.userName}...`}
                      className="flex-1 bg-slate-950 border border-slate-855 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500/55 placeholder-slate-600"
                      disabled={isSendingSupportMsg}
                    />
                    <button
                      type="submit"
                      disabled={isSendingSupportMsg || !currentChatInput.trim()}
                      className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSendingSupportMsg ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              );
            })()
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-800" />
              <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">No Thread Selected</h4>
              <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
                Select a user conversation from the left index panel to view message logs, verify clients, and send private responses securely.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
