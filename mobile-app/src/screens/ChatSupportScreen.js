import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, Phone, MoreVertical, CheckCheck } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const INITIAL_MESSAGES = [
  { id: 1, text: 'Hello! Welcome to Gisenyi Gadgets Support.', sender: 'support', time: '09:00 AM' },
  { id: 2, text: 'How can we help you today?', sender: 'support', time: '09:00 AM' },
];

export default function ChatSupportScreen({ navigation }) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef();

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newUserMsg = {
      id: Date.now(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newUserMsg]);
    setInput('');

    // Simulate support reply
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        text: "Thanks for reaching out! One of our agents will be with you in a moment. We're currently helping other customers in Gisenyi.",
        sender: 'support',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
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
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100' }} 
              style={styles.avatar} 
            />
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.headerName}>Support Agent</Text>
            <Text style={styles.headerStatus}>Online</Text>
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
          
          {messages.map((m) => (
            <View 
              key={m.id} 
              style={[
                styles.messageRow, 
                m.sender === 'user' ? styles.userRow : styles.supportRow
              ]}
            >
              <View style={[
                styles.bubble, 
                m.sender === 'user' ? styles.userBubble : styles.supportBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  m.sender === 'user' ? styles.userText : styles.supportText
                ]}>
                  {m.text}
                </Text>
                <View style={styles.bubbleFooter}>
                  <Text style={styles.timeText}>{m.time}</Text>
                  {m.sender === 'user' && <CheckCheck size={12} color="#fff" style={{ opacity: 0.8 }} />}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

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
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 20 },
  userBubble: { backgroundColor: COLORS.primaryBlue, borderBottomRightRadius: 4 },
  supportBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, ...SHADOWS.sm },
  messageText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#fff' },
  supportText: { color: COLORS.textPrimary },
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
