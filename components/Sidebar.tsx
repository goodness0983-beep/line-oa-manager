
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'chats', icon: 'fa-comments', label: '即時聊天' },
    { id: 'broadcast', icon: 'fa-bullhorn', label: '訊息廣播' },
    { id: 'users', icon: 'fa-users', label: '好友管理' },
    { id: 'analytics', icon: 'fa-chart-line', label: '數據統計' },
    { id: 'settings', icon: 'fa-cog', label: '帳號設定' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 line-green rounded-lg flex items-center justify-center text-white">
          <i className="fa-brands fa-line text-xl"></i>
        </div>
        <span className="font-bold text-slate-800 tracking-tight text-lg">LINE OA Pro</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-emerald-50 text-emerald-600 font-semibold shadow-sm shadow-emerald-100'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
          <img src="https://picsum.photos/seed/admin/40" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Admin" />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-800 truncate">帳號管理員</p>
            <p className="text-xs text-slate-500 truncate">admin@line-oa.tw</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
