import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, Phone, MoreVertical, CheckCheck, User } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const INITIAL_MESSAGES = [
  { id: 1, content: 'Hello! Welcome to Gisenyi Gadgets Support.', is_admin: true, created_at: new Date().toISOString() },
  { id: 2, content: 'How can we help you today?', is_admin: true, created_at: new Date().toISOString() },
];

export default function ChatSupportScreen({ navigation }) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const scrollRef = useRef();

  // 1. Fetch history and setup real-time
  useEffect(() => {
    if (!profile?.id) return;

    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: true });

      if (error) console.warn(error);
      else setMessages(data || []);
      setLoading(false);
    };

    fetchHistory();

    // Subscribe to new messages for this user
    const channel = supabase
      .channel(`chat:${profile.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `user_id=eq.${profile.id}` 
      }, (payload) => {
        // Only add if not already in state
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  const handleSend = async () => {
    if (!input.trim() || !profile?.id) return;
    
    const newMessage = {
      user_id: profile.id,
      content: input.trim(),
      is_admin: false,
    };

    const tempInput = input;
    const replyId = replyTo?.id;
    setInput('');
    setReplyTo(null);

    const { error } = await supabase.from('chat_messages').insert({
      ...newMessage,
      reply_to_id: replyId
    });
    if (error) {
      alert(error.message);
      setInput(tempInput);
    }
  };

  const handleReact = async (msgId, emoji) => {
    const msg = messages.find(m => String(m.id) === String(msgId));
    if (!msg || msg.is_admin === false) return; // Customers only react to admin messages

    const newReactions = { ...(msg.reactions || {}) };
    const userKey = profile.id;
    
    if (newReactions[userKey] === emoji) {
      delete newReactions[userKey];
    } else {
      newReactions[userKey] = emoji;
    }

    const { error } = await supabase
      .from('chat_messages')
      .update({ reactions: newReactions })
      .eq('id', msgId);

    if (error) console.warn(error);
  };

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatarWrap}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primaryBlue, alignItems: 'center', justifyContent: 'center' }}>
               <User size={24} color="#fff" />
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.headerName}>Gadgets Support</Text>
            <Text style={styles.headerStatus}>Active Now</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}><Phone size={20} color={COLORS.textPrimary} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><MoreVertical size={20} color={COLORS.textPrimary} /></TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          ref={scrollRef}
          contentContainerStyle={styles.chatScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.dateDivider}>Today</Text>
          
          {messages.map((m) => {
            const quotedMsg = m.reply_to_id ? messages.find(msg => String(msg.id) === String(m.reply_to_id)) : null;
            const reactionCounts = m.reactions ? Object.values(m.reactions).reduce((acc, emoji) => {
              acc[emoji] = (acc[emoji] || 0) + 1;
              return acc;
            }, {}) : {};

            return (
              <View 
                key={m.id} 
                style={[
                  styles.messageRow, 
                  !m.is_admin ? styles.userRow : styles.supportRow
                ]}
              >
                <View style={[
                  styles.bubbleContainer,
                  !m.is_admin ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }
                ]}>
                  <View style={[
                    styles.bubble, 
                    !m.is_admin ? styles.userBubble : styles.supportBubble
                  ]}>
                    {quotedMsg && (
                      <View style={[
                        styles.quoteContainer,
                        !m.is_admin ? styles.userQuote : styles.supportQuote
                      ]}>
                        <Text style={[styles.quoteName, !m.is_admin && { color: '#fff' }]}>
                          {quotedMsg.is_admin ? 'Support' : 'You'}
                        </Text>
                        <Text style={[styles.quoteText, !m.is_admin && { color: 'rgba(255,255,255,0.8)' }]} numberOfLines={1}>
                          {quotedMsg.content}
                        </Text>
                      </View>
                    )}
                    <Text style={[
                      styles.messageText,
                      !m.is_admin ? styles.userText : styles.supportText
                    ]}>
                      {m.content}
                    </Text>
                    <View style={styles.bubbleFooter}>
                      <Text style={[styles.timeText, m.is_admin && { color: COLORS.textMuted }]}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      {!m.is_admin && <CheckCheck size={12} color="#fff" style={{ opacity: 0.8 }} />}
                    </View>

                    {/* Reactions Display */}
                    {Object.keys(reactionCounts).length > 0 && (
                      <View style={styles.reactionsBadge}>
                        {Object.entries(reactionCounts).map(([emoji, count]) => (
                          <Text key={emoji} style={styles.reactionEmoji}>{emoji} {count > 1 ? count : ''}</Text>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Actions: Reply & React */}
                  <View style={styles.messageActions}>
                    <TouchableOpacity onPress={() => setReplyTo(m)}>
                      <Text style={styles.actionLink}>Reply</Text>
                    </TouchableOpacity>
                    
                    {m.is_admin && (
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity onPress={() => handleReact(m.id, '👍')}>
                          <Text style={styles.actionLink}>👍</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleReact(m.id, '🎉')}>
                          <Text style={styles.actionLink}>🎉</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Reply Preview */}
        {replyTo && (
          <View style={styles.replyPreview}>
            <View style={{ borderLeftWidth: 4, borderLeftColor: COLORS.primaryBlue, paddingLeft: 8 }}>
              <Text style={styles.replyTitle}>Replying to {replyTo.is_admin ? 'Support' : 'yourself'}</Text>
              <Text style={styles.replyText} numberOfLines={1}>{replyTo.content}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Text style={{ fontSize: 18, color: COLORS.textMuted }}>×</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !input.trim() && { backgroundColor: '#E5E7EB' }]} 
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: SIZES.md,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 8 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  onlineDot: { 
    position: 'absolute', bottom: 0, right: 0, 
    width: 12, height: 12, borderRadius: 6, 
    backgroundColor: '#10B981', borderSize: 2, borderColor: '#fff', borderWidth: 2
  },
  headerName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  headerStatus: { fontSize: 12, color: '#10B981', fontWeight: '600' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 8 },

  chatScroll: { padding: SIZES.lg, gap: 16 },
  dateDivider: { 
    textAlign: 'center', fontSize: 12, color: COLORS.textMuted, 
    fontWeight: '600', marginVertical: 10, backgroundColor: '#E5E7EB',
    alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10
  },
  messageRow: { flexDirection: 'row', width: '100%' },
  userRow: { justifyContent: 'flex-end' },
  supportRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '90%', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  userBubble: { backgroundColor: COLORS.primaryBlue, borderBottomRightRadius: 6 },
  supportBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 6, ...SHADOWS.sm, borderWidth: 1, borderColor: '#E5E7EB' },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  supportText: { color: COLORS.textPrimary },
  quoteContainer: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  userQuote: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderLeftColor: '#fff',
  },
  supportQuote: {
    backgroundColor: '#F3F4F6',
    borderLeftColor: COLORS.primaryBlue,
  },
  quoteName: { fontSize: 11, fontWeight: '700', marginBottom: 2, color: COLORS.primaryBlue },
  quoteText: { fontSize: 12, color: COLORS.textMuted },
  bubbleContainer: { maxWidth: '90%' },
  messageActions: { flexDirection: 'row', gap: 12, marginTop: 4, paddingHorizontal: 4 },
  actionLink: { fontSize: 11, fontWeight: '700', color: COLORS.primaryBlue },
  reactionsBadge: {
    position: 'absolute', bottom: -10, right: 0,
    backgroundColor: '#fff', borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 2,
    flexDirection: 'row', gap: 4,
    ...SHADOWS.sm, borderWidth: 1, borderColor: '#E5E7EB'
  },
  reactionEmoji: { fontSize: 10 },
  replyPreview: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, backgroundColor: '#F9FAFB', borderTopWidth: 1, borderTopColor: '#E5E7EB'
  },
  replyTitle: { fontSize: 12, fontWeight: '700', color: COLORS.primaryBlue },
  replyText: { fontSize: 12, color: COLORS.textMuted },
  bubbleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 },
  timeText: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  supportBubbleFooter: { color: COLORS.textMuted },

  inputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: SIZES.md, paddingBottom: Platform.OS === 'ios' ? 30 : SIZES.md,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  textInput: {
    flex: 1, backgroundColor: '#F3F4F6', borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 8, maxHeight: 100,
    fontSize: 14, color: COLORS.textPrimary
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: 'center', alignItems: 'center'
  }
});
