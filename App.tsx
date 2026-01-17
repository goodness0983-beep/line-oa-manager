
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import { UserProfile, Message } from './types';

const MOCK_USERS: UserProfile[] = [
  { id: 'u1', name: '王小明', avatar: 'https://picsum.photos/seed/1/100', statusMessage: '急需售後服務', lastMessage: '請問這個商品還有貨嗎？', unreadCount: 2, labels: ['重要', '新客戶'] },
  { id: 'u2', name: '陳美玲', avatar: 'https://picsum.photos/seed/2/100', statusMessage: '在忙', lastMessage: '謝謝您的回覆，非常滿意！', unreadCount: 0, labels: ['VIP', '老客戶'] },
  { id: 'u3', name: '李阿強', avatar: 'https://picsum.photos/seed/3/100', statusMessage: '尋求合作', lastMessage: '想要詢問大宗採購的報價', unreadCount: 1, labels: ['潛在合作'] },
  { id: 'u4', name: '張家華', avatar: 'https://picsum.photos/seed/4/100', lastMessage: '貼圖已傳送', unreadCount: 0, labels: [] },
  { id: 'u5', name: '林姿妤', avatar: 'https://picsum.photos/seed/5/100', lastMessage: '週五可以過去門市嗎？', unreadCount: 0, labels: ['預約'] },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'u1': [
    { id: 'm1', senderId: 'u1', senderName: '王小明', text: '你好，請問還有在營業嗎？', timestamp: Date.now() - 3600000, type: 'user' },
    { id: 'm2', senderId: 'bot', senderName: '客服機器人', text: '您好！我們營業到晚上 9:00 喔。', timestamp: Date.now() - 3500000, type: 'bot' },
    { id: 'm3', senderId: 'u1', senderName: '王小明', text: '請問這個商品還有貨嗎？（附圖：無線耳機）', timestamp: Date.now() - 1800000, type: 'user' },
  ]
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedUser, setSelectedUser] = useState<UserProfile>(MOCK_USERS[0]);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);

  const handleSendMessage = (text: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: 'agent',
      senderName: '真人客服',
      text,
      timestamp: Date.now(),
      type: 'agent',
      avatar: 'https://picsum.photos/seed/admin/40'
    };

    setMessages(prev => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), newMsg]
    }));
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'chats' ? (
        <>
          <ChatList 
            users={MOCK_USERS} 
            selectedUserId={selectedUser.id} 
            onSelectUser={setSelectedUser} 
          />
          <ChatWindow 
            user={selectedUser} 
            messages={messages[selectedUser.id] || []} 
            onSendMessage={handleSendMessage}
          />
          
          {/* Right Panel - CRM Info */}
          <div className="w-80 bg-white border-l border-slate-200 h-screen sticky top-0 p-6 hidden xl:block">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <i className="fas fa-info-circle text-emerald-500"></i>
              客戶資料卡
            </h3>
            
            <div className="flex flex-col items-center mb-6">
              <img src={selectedUser.avatar} className="w-24 h-24 rounded-3xl shadow-lg border-4 border-white mb-4" alt="" />
              <h2 className="text-lg font-bold text-slate-800">{selectedUser.name}</h2>
              <p className="text-xs text-slate-400 mt-1">LINE ID: @{selectedUser.id}</p>
            </div>

            <div className="space-y-6">
              <section>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">標籤管理</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.labels.map(l => (
                    <span key={l} className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1">
                      {l} <i className="fas fa-times opacity-30 hover:opacity-100 cursor-pointer"></i>
                    </span>
                  ))}
                  <button className="bg-slate-100 text-slate-400 text-[10px] px-2 py-1 rounded-md font-bold hover:bg-slate-200">
                    + 新增標籤
                  </button>
                </div>
              </section>

              <section>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">備註事項</p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 min-h-[100px] text-xs text-slate-500 italic">
                  此客戶偏好晚上諮詢，對電子產品感興趣。上次詢問過藍牙耳機優惠。
                </div>
              </section>

              <section>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">最近購買</p>
                <div className="space-y-2">
                  {[
                    { item: '無線耳機', date: '2024-05-12', price: '$2,980' },
                    { item: '手機殼', date: '2023-11-20', price: '$850' }
                  ].map((order, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-slate-700">{order.item}</p>
                        <p className="text-[10px] text-slate-400">{order.date}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600">{order.price}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center flex-col gap-4 text-slate-400">
          <i className="fas fa-tools text-6xl opacity-20"></i>
          <h2 className="text-xl font-medium">「{activeTab}」功能開發中</h2>
          <button onClick={() => setActiveTab('chats')} className="bg-emerald-500 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-emerald-200 transition-all">
            回到即時聊天
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
