import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, User, MessageCircle, MoreHorizontal, Phone, Video } from 'lucide-react';
import { supabase } from '../services/supabase';

const fmtDate = (iso) => {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function SupportPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const scrollRef = useRef();

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Fetch active chat sessions
  useEffect(() => {
    const fetchChats = async () => {
      // Fetch all messages to group them by user
      const { data, error } = await supabase
        .from('chat_messages')
        .select('user_id, content, created_at, profiles(full_name, avatar_url)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Critical Fetch Chats Error:', error.message);
        setLoading(false);
        return;
      }

      const uniqueChats = [];
      const seen = new Set();
      data?.forEach(msg => {
        if (!seen.has(msg.user_id)) {
          seen.add(msg.user_id);
          const profile = Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles;
          const realName = profile?.full_name || profile?.name || `User #${msg.user_id.slice(0, 5)}`;
          uniqueChats.push({
            user_id: msg.user_id,
            name: realName,
            avatar: profile?.avatar_url || null,
            lastMsg: msg.content,
            time: msg.created_at
          });
        }
      });
      setChats(uniqueChats);
      setLoading(false);
    };

    fetchChats();

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

      if (error) {
        console.error('Fetch messages error:', error.message);
      } else {
          setMessages(data || []);
      }
    };

    fetchMessages();

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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedChat) return;

    const msgContent = input.trim();
    const replyId = replyTo?.id;
    setInput('');
    setReplyTo(null);

    const { error } = await supabase.from('chat_messages').insert({
      user_id: selectedChat.user_id,
      content: msgContent,
      is_admin: true,
      reply_to_id: replyId
    });

    if (error) {
      setInput(msgContent);
    }
  };

  const handleReact = async (msgId, emoji) => {
    const msg = messages.find(m => String(m.id) === String(msgId));
    if (!msg || msg.is_admin === true) return; // Admins don't react to their own messages

    const newReactions = { ...(msg.reactions || {}) };
    const userKey = 'admin'; // For simplicity, admin reactions are grouped
    
    if (newReactions[userKey] === emoji) {
      delete newReactions[userKey];
    } else {
      newReactions[userKey] = emoji;
    }

    const { error } = await supabase
      .from('chat_messages')
      .update({ reactions: newReactions })
      .eq('id', msgId);

    if (error) console.error(error);
  };

  if (loading) return (
    <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
      <div className="loader">Loading conversations...</div>
    </div>
  );

  return (
    <div className="support-wrapper" style={{
      height: isMobile ? '100vh' : 'calc(100vh - 160px)',
      display: 'flex',
      background: '#fff',
      borderRadius: isMobile ? 0 : 24,
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      border: '1px solid var(--border)',
      flexDirection: isMobile ? 'column' : 'row',
      position: isMobile ? 'fixed' : 'relative',
      top: isMobile ? 0 : 'auto',
      left: isMobile ? 0 : 'auto',
      right: isMobile ? 0 : 'auto',
      bottom: isMobile ? 0 : 'auto',
      zIndex: isMobile ? 100 : 'auto'
    }}>

      {/* Sidebar */}
      <div style={{
        width: isMobile ? '100%' : 350,
        borderRight: isMobile ? 'none' : '1px solid var(--border)',
        borderBottom: isMobile && selectedChat ? '1px solid var(--border)' : 'none',
        display: isMobile && selectedChat ? 'none' : 'flex',
        flexDirection: 'column',
        background: '#F8FAFC',
        height: isMobile ? '100%' : 'auto'
      }}>
        <div style={{ padding: 24, borderBottom: '1px solid var(--border)', background: '#fff' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Messages</h2>
          <div className="search-wrap" style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            <input 
              className="form-input" 
              placeholder="Search customers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36, background: '#F1F5F9', border: 'none', height: 40 }} 
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(chat => (
            <div 
              key={chat.user_id}
              onClick={() => setSelectedChat(chat)}
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: selectedChat?.user_id === chat.user_id ? '#fff' : 'transparent',
                borderLeft: `4px solid ${selectedChat?.user_id === chat.user_id ? 'var(--primary-blue)' : 'transparent'}`
              }}
            >
              <div style={{ 
                width: 48, height: 48, borderRadius: 14, 
                background: 'var(--primary-blue)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 18, flexShrink: 0,
                overflow: 'hidden'
              }}>
                {chat.avatar ? <img src={chat.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : chat.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(chat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {chat.lastMsg}
                </div>
              </div>
            </div>
          ))}
          {chats.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 14 }}>No active customer chats</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{
        flex: 1,
        display: isMobile && !selectedChat ? 'none' : 'flex',
        flexDirection: 'column',
        background: '#fff',
        width: isMobile ? '100%' : 'auto',
        height: isMobile ? '100%' : 'auto',
        overflow: 'hidden'
      }}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: isMobile ? '12px 16px' : '16px 32px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {isMobile && (
                  <button
                    onClick={() => setSelectedChat(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 24,
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      padding: 0,
                      marginRight: 8
                    }}
                  >
                    ←
                  </button>
                )}
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="#64748B" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{selectedChat.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
                    <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 600 }}>Active Now</span>
                  </div>
                </div>
              </div>
              <div style={{ display: isMobile ? 'none' : 'flex', gap: 16, color: 'var(--text-muted)' }}>
                <Phone size={20} style={{ cursor: 'pointer' }} />
                <Video size={20} style={{ cursor: 'pointer' }} />
                <MoreHorizontal size={20} style={{ cursor: 'pointer' }} />
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '16px' : '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                background: '#F1F5F9'
              }}
            >
              {messages.map((m, idx) => {
                const isAdmin = m.is_admin;
                const quotedMsg = m.reply_to_id ? messages.find(msg => String(msg.id) === String(m.reply_to_id)) : null;
                const reactionCounts = m.reactions ? Object.values(m.reactions).reduce((acc, emoji) => {
                  acc[emoji] = (acc[emoji] || 0) + 1;
                  return acc;
                }, {}) : {};
                
                return (
                  <div key={m.id || idx} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                    <div
                      className="msg-bubble-wrap"
                      style={{
                        maxWidth: isMobile ? '85%' : '70%',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isAdmin ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div 
                        style={{ 
                          padding: '12px 18px',
                          borderRadius: isAdmin ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                          background: isAdmin ? 'var(--primary-blue)' : '#fff',
                          color: isAdmin ? '#fff' : 'var(--text-primary)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                          position: 'relative',
                          border: isAdmin ? 'none' : '1px solid rgba(0,0,0,0.05)'
                        }}
                      >
                        {quotedMsg && (
                          <div style={{ 
                            background: 'rgba(0,0,0,0.05)', 
                            padding: '8px 12px', 
                            borderRadius: 8, 
                            marginBottom: 8, 
                            fontSize: 12, 
                            borderLeft: `4px solid ${isAdmin ? '#fff' : 'var(--primary-blue)'}`,
                            opacity: 0.8
                          }}>
                            <div style={{ fontWeight: 700, marginBottom: 2 }}>{quotedMsg.is_admin ? 'Support' : selectedChat.name}</div>
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{quotedMsg.content}</div>
                          </div>
                        )}
                        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{m.content}</div>
                        <div style={{ 
                          fontSize: 10, 
                          marginTop: 4, 
                          textAlign: 'right', 
                          opacity: 0.7,
                          fontWeight: 600
                        }}>
                          {fmtDate(m.created_at)}
                        </div>

                        {/* Reaction Badges */}
                        {Object.keys(reactionCounts).length > 0 && (
                          <div style={{ 
                            position: 'absolute', bottom: -12, right: isAdmin ? 0 : 'auto', left: isAdmin ? 'auto' : 0,
                            background: '#fff', padding: '2px 6px', borderRadius: 10, fontSize: 10,
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)', border: '1px solid var(--border)',
                            display: 'flex', gap: 4, zIndex: 1
                          }}>
                            {Object.entries(reactionCounts).map(([emoji, count]) => (
                              <span key={emoji}>{emoji} {count > 1 ? count : ''}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button onClick={() => setReplyTo(m)} style={{ fontSize: 11, color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, opacity: 0.8 }}>Reply</button>
                        
                        {!isAdmin && (
                          <div style={{ display: 'flex', gap: 4, opacity: 0.6 }}>
                            {['👍', '🎉'].map(emoji => (
                              <button key={emoji} onClick={() => handleReact(m.id, emoji)} style={{ fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}>{emoji}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Preview */}
            {replyTo && (
              <div style={{
                padding: isMobile ? '12px 16px' : '12px 32px',
                background: '#F8FAFC',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ borderLeft: '4px solid var(--primary-blue)', paddingLeft: 12, flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-blue)' }}>Replying to {replyTo.is_admin ? 'yourself' : selectedChat.name}</div>
                  <div style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: isMobile ? '200px' : '400px'
                  }}>{replyTo.content}</div>
                </div>
                <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
              </div>
            )}

            {/* Input Bar */}
            <div style={{
              padding: isMobile ? '12px 16px 12px 16px' : '24px 32px',
              borderTop: '1px solid var(--border)',
              background: '#fff',
              flexShrink: 0,
              paddingBottom: isMobile ? 'max(12px, env(safe-area-inset-bottom))' : '24px'
            }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, background: '#F1F5F9', padding: '6px 10px', borderRadius: 16 }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    padding: '8px',
                    fontSize: 14,
                    minWidth: 0
                  }}
                />
                <button type="submit" style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'var(--primary-blue)',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
            <div style={{ width: 100, height: 100, borderRadius: 50, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <MessageCircle size={40} color="var(--primary-blue)" style={{ opacity: 0.5 }} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Customer Support Center</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 300 }}>Select a customer from the left to start a real-time conversation and provide assistance.</p>
          </div>
        )}
      </div>
    </div>
  );
}
