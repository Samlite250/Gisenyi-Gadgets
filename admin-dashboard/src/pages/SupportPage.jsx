import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, User } from 'lucide-react';
import { supabase } from '../services/supabase';

const fmtDate = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function SupportPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();

  // 1. Fetch active chat sessions (unique users who sent messages)
  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('user_id, profiles(full_name, avatar_url)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch chats error:', error);
        return;
      }

      // Group by user_id to get unique chats
      const uniqueChats = [];
      const seen = new Set();
      data.forEach(msg => {
        if (!seen.has(msg.user_id)) {
          seen.add(msg.user_id);
          uniqueChats.push({
            user_id: msg.user_id,
            name: msg.profiles?.full_name || 'Anonymous User',
            avatar: msg.profiles?.avatar_url
          });
        }
      });
      setChats(uniqueChats);
      setLoading(false);
    };

    fetchChats();

    // Real-time subscription for new chats
    const channel = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => {
        fetchChats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 2. Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', selectedChat.user_id)
        .order('created_at', { ascending: true });

      if (error) console.error(error);
      else setMessages(data);
    };

    fetchMessages();

    // Subscribe to messages for THIS user
    const channel = supabase
      .channel(`chat:${selectedChat.user_id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `user_id=eq.${selectedChat.user_id}` 
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedChat]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedChat) return;

    const msg = {
      user_id: selectedChat.user_id,
      text: input,
      sender: 'support',
      is_read: false
    };

    const tempInput = input;
    setInput('');

    const { error } = await supabase.from('chat_messages').insert(msg);
    if (error) {
      alert(error.message);
      setInput(tempInput);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Support Center...</div>;

  return (
    <div className="support-container" style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: 20 }}>
      {/* Sidebar: Chat List */}
      <div className="card" style={{ width: 300, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div className="card-header" style={{ padding: '12px 16px' }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Conversations</h3>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.map(chat => (
            <div 
              key={chat.user_id}
              className={`chat-list-item ${selectedChat?.user_id === chat.user_id ? 'active' : ''}`}
              onClick={() => setSelectedChat(chat)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderBottom: '1px solid var(--border)',
                background: selectedChat?.user_id === chat.user_id ? 'var(--primary-blue-alpha)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {chat.avatar ? <img src={chat.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : <User size={20} />}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Online</div>
              </div>
            </div>
          ))}
          {chats.length === 0 && <div className="p-8 text-center text-muted">No active chats</div>}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedChat ? (
          <>
            <div className="card-header" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} />
              </div>
              <div style={{ fontWeight: 700 }}>{selectedChat.name}</div>
            </div>
            
            <div 
              ref={scrollRef}
              style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: '#f8fafc' }}
            >
              {messages.map(m => (
                <div 
                  key={m.id} 
                  className={`msg-bubble ${m.sender === 'support' ? 'msg-support' : 'msg-user'}`}
                >
                  {m.text}
                  <div className="msg-time">
                    {fmtDate(m.created_at)}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} style={{ padding: 20, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <input 
                className="input" 
                placeholder="Type your reply..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button className="btn btn-primary btn-icon" type="submit">
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <MessageCircle size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
