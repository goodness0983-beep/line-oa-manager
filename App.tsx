
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import { UserProfile, Message } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users and messages
  const fetchData = async () => {
    try {
      const usersResponse = await fetch('/api/messages');
      const userIds: string[] = await usersResponse.json();

      const newUsers: UserProfile[] = userIds.map(id => ({
        id: id,
        name: `LINE 用戶 (${id.substring(0, 4)})`,
        avatar: `https://picsum.photos/seed/${id}/100`,
        unreadCount: 0,
        labels: [],
        lastMessage: '點擊查看訊息'
      }));

      setUsers(newUsers);
      if (!selectedUser && newUsers.length > 0) {
        setSelectedUser(newUsers[0]);
      }

      // Fetch messages for each user (optional, or just for selected)
      if (selectedUser) {
        const msgResponse = await fetch(`/api/messages?userId=${selectedUser.id}`);
        const userMessages = await msgResponse.json();
        setMessages(prev => ({
          ...prev,
          [selectedUser.id]: userMessages
        }));
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [selectedUser?.id]);

  const handleSendMessage = async (text: string) => {
    if (!selectedUser) return;

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

    // In a real app, you'd call a send-message API here
    console.log("Sending message to LINE:", text);
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-500 font-bold">
        載入中...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'chats' ? (
        <>
          <ChatList
            users={users}
            selectedUserId={selectedUser?.id || ''}
            onSelectUser={setSelectedUser}
          />
          {selectedUser ? (
            <ChatWindow
              user={selectedUser}
              messages={messages[selectedUser.id] || []}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 italic">
              尚未收到任何訊息
            </div>
          )}

          {selectedUser && (
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
                    點擊用戶查看訊息紀錄
                  </div>
                </section>
              </div>
            </div>
          )}
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
