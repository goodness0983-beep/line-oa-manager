
import React from 'react';
import { UserProfile } from '../types';

interface ChatListProps {
  users: UserProfile[];
  selectedUserId: string | null;
  onSelectUser: (user: UserProfile) => void;
}

const ChatList: React.FC<ChatListProps> = ({ users, selectedUserId, onSelectUser }) => {
  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-slate-100">
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            placeholder="搜尋對話或好友..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={`flex items-center gap-3 p-4 cursor-pointer border-b border-slate-50 transition-all ${
              selectedUserId === user.id ? 'bg-emerald-50 border-r-4 border-r-emerald-500' : 'hover:bg-slate-50'
            }`}
          >
            <div className="relative">
              <img src={user.avatar} className="w-12 h-12 rounded-full object-cover shadow-sm" alt={user.name} />
              {user.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {user.unreadCount}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-slate-800 text-sm truncate">{user.name}</h3>
                <span className="text-[10px] text-slate-400">12:30</span>
              </div>
              <p className="text-xs text-slate-500 truncate">{user.lastMessage}</p>
              <div className="flex gap-1 mt-1">
                {user.labels.map(l => (
                  <span key={l} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{l}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
