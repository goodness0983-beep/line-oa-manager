
import React, { useState, useEffect, useRef } from 'react';
import { Message, UserProfile, AIInsight } from '../types';
import { getMessageInsight } from '../geminiService';

interface ChatWindowProps {
  user: UserProfile;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ user, messages, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
    setInsight(null);
  };

  const analyzeLatest = async () => {
    const lastUserMsg = [...messages].reverse().find(m => m.type === 'user');
    if (!lastUserMsg) return;
    
    setIsAnalyzing(true);
    const result = await getMessageInsight(lastUserMsg.text);
    setInsight(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-10 bg-white">
        <div className="flex items-center gap-3">
          <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt={user.name} />
          <div>
            <h2 className="font-bold text-slate-800 leading-tight">{user.name}</h2>
            <p className="text-xs text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              線上中
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={analyzeLatest} disabled={isAnalyzing} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-2">
            <i className={`fas ${isAnalyzing ? 'fa-spinner fa-spin' : 'fa-wand-sparkles'}`}></i>
            {isAnalyzing ? '分析中...' : 'AI 語意分析'}
          </button>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
              <i className="fas fa-phone"></i>
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
              <i className="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Insight Banner */}
      {insight && (
        <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${insight.sentiment === 'positive' ? 'bg-green-100 text-green-600' : insight.sentiment === 'negative' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
              <i className={`fas ${insight.sentiment === 'positive' ? 'fa-smile' : insight.sentiment === 'negative' ? 'fa-frown' : 'fa-meh'}`}></i>
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-1">AI 客服建議</p>
              <p className="text-sm text-slate-700 font-medium mb-3 italic">「{insight.summary}」</p>
              <div className="flex items-end gap-2">
                <div className="flex-1 p-3 bg-white border border-indigo-50 rounded-xl text-sm text-slate-600">
                  {insight.suggestedReply}
                </div>
                <button 
                  onClick={() => setInputText(insight.suggestedReply)}
                  className="bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-indigo-700 transition-all active:scale-95"
                >
                  套用建議
                </button>
              </div>
            </div>
            <button onClick={() => setInsight(null)} className="text-slate-400 hover:text-slate-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-start' : 'justify-end'} group`}>
            <div className={`flex max-w-[75%] gap-3 ${msg.type === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
              <img src={msg.avatar || `https://picsum.photos/seed/${msg.senderId}/40`} className="w-8 h-8 rounded-full flex-shrink-0 shadow-sm" alt={msg.senderName} />
              <div>
                <div className="flex items-center gap-2 mb-1 px-1">
                   <span className="text-[11px] font-bold text-slate-400">{msg.senderName}</span>
                   <span className="text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.type === 'user' 
                    ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100' 
                    : 'line-green text-white rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center gap-3 max-w-5xl mx-auto">
          <div className="flex gap-1">
            <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
              <i className="fas fa-plus"></i>
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
              <i className="fas fa-smile"></i>
            </button>
          </div>
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="在此輸入訊息..."
              rows={1}
              className="w-full pl-4 pr-12 py-3 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 resize-none transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                inputText.trim() ? 'line-green text-white shadow-md' : 'text-slate-300'
              }`}
            >
              <i className="fas fa-paper-plane text-sm"></i>
            </button>
          </div>
          <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
            <i className="fas fa-microphone"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
