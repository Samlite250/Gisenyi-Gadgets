import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Image, ActivityIndicator, Linking, Modal, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft, Send, Phone, ImageIcon, X,
  CheckCheck, User, PhoneCall, MessageCircle,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';

export default function ChatSupportScreen({ navigation }) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(true);
  const [replyTo, setReplyTo]         = useState(null);
  const [sendError, setSendError]     = useState(null);
  const [sendingImage, setSendingImage] = useState(false);
  const [supportPhone, setSupportPhone] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [previewImage, setPreviewImage]   = useState(null);

  const scrollRef  = useRef();
  const isMounted  = useRef(true);

  useEffect(() => { return () => { isMounted.current = false; }; }, []);

  // Fetch support phone from settings
  useEffect(() => {
    supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'supportPhone')
      .single()
      .then(({ data }) => {
        if (data?.value) setSupportPhone(data.value);
      });
  }, []);

  // Fetch chat history + real-time
  useEffect(() => {
    if (!profile?.id) return;

    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: true });

      if (!error) setMessages(data || []);
      setLoading(false);
    };

    fetchHistory();

    const channel = supabase
      .channel(`chat:${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `user_id=eq.${profile.id}`,
      }, (payload) => {
        setMessages(prev => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    return () => clearTimeout(t);
  }, [messages]);

  // ── Send text ────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || !profile?.id) return;
    const tempInput = input;
    const replyId   = replyTo?.id;
    setInput('');
    setReplyTo(null);

    const { error } = await supabase.from('chat_messages').insert({
      user_id: profile.id,
      content: input.trim(),
      is_admin: false,
      reply_to_id: replyId ?? null,
    });

    if (error && isMounted.current) {
      setSendError(t('chat.sendFailed'));
      setInput(tempInput);
      setTimeout(() => { if (isMounted.current) setSendError(null); }, 3000);
    }
  };

  // ── Pick & upload image ──────────────────────────────────────
  const handleImagePick = useCallback(async () => {
    if (!profile?.id) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setSendError(t('chat.photoPermissionRequired'));
      setTimeout(() => { if (isMounted.current) setSendError(null); }, 3000);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setSendingImage(true);

    try {
      // Download blob via XHR to get proper MIME type (same approach as checkout)
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = reject;
        xhr.open('GET', asset.uri);
        xhr.send();
      });

      const mimeType = (blob.type && blob.type !== 'application/octet-stream')
        ? blob.type
        : (asset.mimeType || 'image/jpeg');
      const ext      = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
      const fileName = `chat-${profile.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, blob, { contentType: mimeType, upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      // Insert as a message with image_url field
      const { error: msgError } = await supabase.from('chat_messages').insert({
        user_id:  profile.id,
        content:  '',
        image_url: publicUrl,
        is_admin: false,
        reply_to_id: replyTo?.id ?? null,
      });

      if (msgError) throw msgError;
      setReplyTo(null);
    } catch (err) {
      if (isMounted.current) {
        setSendError(t('chat.imageSendFailed'));
        setTimeout(() => { if (isMounted.current) setSendError(null); }, 3500);
      }
    } finally {
      if (isMounted.current) setSendingImage(false);
    }
  }, [profile?.id, replyTo]);

  // ── React to message ─────────────────────────────────────────
  const handleReact = async (msgId, emoji) => {
    const msg = messages.find(m => String(m.id) === String(msgId));
    if (!msg || !msg.is_admin) return;

    const reactions = { ...(msg.reactions || {}) };
    if (reactions[profile.id] === emoji) delete reactions[profile.id];
    else reactions[profile.id] = emoji;

    await supabase.from('chat_messages').update({ reactions }).eq('id', msgId);
  };

  // ── Call support ─────────────────────────────────────────────
  const handleCall = () => {
    if (!supportPhone) return;
    setShowPhoneModal(true);
  };

  const dialNumber = () => {
    setShowPhoneModal(false);
    Linking.openURL(`tel:${supportPhone}`);
  };

  // ── Helpers ──────────────────────────────────────────────────
  const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <User size={22} color="#fff" />
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.headerName}>{t('chat.title')}</Text>
            <Text style={styles.headerStatus}>● {t('chat.online')}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Phone button — shows number modal */}
          <TouchableOpacity
            style={[styles.iconBtn, supportPhone && styles.iconBtnActive]}
            onPress={handleCall}
            disabled={!supportPhone}
          >
            <Phone size={19} color={supportPhone ? COLORS.primaryBlue : '#C0C0C0'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Messages ───────────────────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.chatScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <View style={styles.dateDividerWrap}>
          <View style={styles.dateDividerLine} />
          <Text style={styles.dateDivider}>{t('chat.today')}</Text>
          <View style={styles.dateDividerLine} />
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primaryBlue} style={{ marginTop: 40 }} />
        ) : (
          messages.map((m) => {
            const quotedMsg = m.reply_to_id
              ? messages.find(msg => String(msg.id) === String(m.reply_to_id))
              : null;
            const reactionCounts = m.reactions
              ? Object.values(m.reactions).reduce((acc, e) => { acc[e] = (acc[e] || 0) + 1; return acc; }, {})
              : {};
            const isUser = !m.is_admin;

            return (
              <View key={m.id} style={[styles.messageRow, isUser ? styles.userRow : styles.supportRow]}>
                {/* Support avatar */}
                {!isUser && (
                  <View style={styles.supportAvatar}>
                    <MessageCircle size={14} color="#fff" />
                  </View>
                )}

                <View style={[styles.bubbleContainer, isUser ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
                  <View style={[styles.bubble, isUser ? styles.userBubble : styles.supportBubble]}>

                    {/* Quoted message */}
                    {quotedMsg && (
                      <View style={[styles.quote, isUser ? styles.userQuote : styles.supportQuote]}>
                        <Text style={[styles.quoteName, isUser && { color: 'rgba(255,255,255,0.9)' }]}>
                          {quotedMsg.is_admin ? t('chat.support') : t('chat.you')}
                        </Text>
                        <Text style={[styles.quoteText, isUser && { color: 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>
                          {quotedMsg.content || `📷 ${t('chat.image')}`}
                        </Text>
                      </View>
                    )}

                    {/* Image message */}
                    {m.image_url ? (
                      <TouchableOpacity onPress={() => setPreviewImage(m.image_url)} activeOpacity={0.9}>
                        <Image
                          source={{ uri: m.image_url }}
                          style={styles.chatImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ) : (
                      <Text style={[styles.messageText, isUser ? styles.userText : styles.supportText]}>
                        {m.content}
                      </Text>
                    )}

                    {/* Footer: time + ticks */}
                    <View style={styles.bubbleFooter}>
                      <Text style={[styles.timeText, !isUser && { color: COLORS.textMuted }]}>
                        {fmtTime(m.created_at)}
                      </Text>
                      {isUser && <CheckCheck size={12} color="rgba(255,255,255,0.75)" />}
                    </View>

                    {/* Reaction badges */}
                    {Object.keys(reactionCounts).length > 0 && (
                      <View style={styles.reactionsBadge}>
                        {Object.entries(reactionCounts).map(([emoji, count]) => (
                          <Text key={emoji} style={styles.reactionEmoji}>{emoji}{count > 1 ? ` ${count}` : ''}</Text>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Reply & react actions */}
                  <View style={styles.messageActions}>
                    <TouchableOpacity onPress={() => setReplyTo(m)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.actionLink}>{t('chat.reply')}</Text>
                    </TouchableOpacity>
                    {m.is_admin && (
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {['👍', '🎉'].map(e => (
                          <TouchableOpacity key={e} onPress={() => handleReact(m.id, e)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Text style={styles.actionLink}>{e}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ── Reply preview ───────────────────────────────────────── */}
      {replyTo && (
        <View style={styles.replyPreview}>
          <View style={styles.replyBar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.replyTitle}>
              {replyTo.is_admin ? t('chat.replyingToSupport') : t('chat.replyingToYourself')}
            </Text>
            <Text style={styles.replyText} numberOfLines={1}>
              {replyTo.image_url ? `📷 ${t('chat.image')}` : replyTo.content}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyTo(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Send error ──────────────────────────────────────────── */}
      {sendError && (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{sendError}</Text>
        </View>
      )}

      {/* ── Input bar ───────────────────────────────────────────── */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
        {/* Image attach button */}
        <TouchableOpacity
          style={styles.attachBtn}
          onPress={handleImagePick}
          disabled={sendingImage}
        >
          {sendingImage
            ? <ActivityIndicator size="small" color={COLORS.primaryBlue} />
            : <ImageIcon size={22} color={COLORS.primaryBlue} />
          }
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder={t('chat.inputPlaceholder')}
          placeholderTextColor={COLORS.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300)}
        />

        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || sendingImage}
        >
          <Send size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Phone modal ─────────────────────────────────────────── */}
      <Modal visible={showPhoneModal} transparent animationType="fade" onRequestClose={() => setShowPhoneModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowPhoneModal(false)}>
          <Pressable style={styles.phoneModal} onPress={e => e.stopPropagation()}>
            <View style={styles.phoneModalHeader}>
              <View style={styles.phoneModalIcon}>
                <PhoneCall size={26} color={COLORS.primaryBlue} />
              </View>
              <Text style={styles.phoneModalTitle}>{t('chat.callSupport')}</Text>
              <Text style={styles.phoneModalSub}>{t('chat.callSupportSubtitle')}</Text>
            </View>

            <View style={styles.phoneNumberRow}>
              <Phone size={16} color={COLORS.textMuted} />
              <Text style={styles.phoneNumberText} selectable>{supportPhone}</Text>
            </View>

            <TouchableOpacity style={styles.dialBtn} onPress={dialNumber}>
              <PhoneCall size={18} color="#fff" />
              <Text style={styles.dialBtnText}>{t('chat.callNow')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPhoneModal(false)}>
              <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Full-screen image preview ────────────────────────────── */}
      <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <Pressable style={styles.previewOverlay} onPress={() => setPreviewImage(null)}>
          <Image
            source={{ uri: previewImage }}
            style={styles.previewImage}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewImage(null)}>
            <X size={22} color="#fff" />
          </TouchableOpacity>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.md, paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    ...SHADOWS.sm,
  },
  backBtn:     { padding: 4, marginRight: 4 },
  headerInfo:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap:  { position: 'relative' },
  avatarCircle: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: COLORS.primaryBlue,
    alignItems: 'center', justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 13, height: 13, borderRadius: 7,
    backgroundColor: '#10B981', borderWidth: 2, borderColor: '#fff',
  },
  headerName:    { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  headerStatus:  { fontSize: 11, color: '#10B981', fontWeight: '600', marginTop: 1 },
  headerActions: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: '#F8FAFC',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  iconBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },

  // Chat
  chatScroll: { padding: SIZES.md, paddingBottom: 20, gap: 4 },
  dateDividerWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  dateDividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dateDivider:     { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },

  messageRow:   { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', gap: 8 },
  userRow:      { justifyContent: 'flex-end' },
  supportRow:   { justifyContent: 'flex-start' },
  supportAvatar: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: COLORS.primaryBlue,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 18, flexShrink: 0,
  },

  bubbleContainer: { maxWidth: '78%' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, overflow: 'hidden' },
  userBubble: {
    backgroundColor: COLORS.primaryBlue,
    borderBottomRightRadius: 5,
  },
  supportBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 5,
    borderWidth: 1, borderColor: '#EFEFEF',
    ...SHADOWS.sm,
  },

  messageText: { fontSize: 14, lineHeight: 21 },
  userText:    { color: '#fff' },
  supportText: { color: COLORS.textPrimary },

  chatImage: {
    width: 200, height: 150, borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },

  // Quote
  quote: { borderRadius: 10, padding: 8, marginBottom: 8, borderLeftWidth: 3 },
  userQuote:    { backgroundColor: 'rgba(255,255,255,0.15)', borderLeftColor: 'rgba(255,255,255,0.8)' },
  supportQuote: { backgroundColor: '#F3F4F6', borderLeftColor: COLORS.primaryBlue },
  quoteName: { fontSize: 11, fontWeight: '700', color: COLORS.primaryBlue, marginBottom: 2 },
  quoteText: { fontSize: 11, color: COLORS.textMuted },

  // Footer
  bubbleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 5 },
  timeText:     { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },

  // Reactions
  reactionsBadge: {
    position: 'absolute', bottom: -12, right: 6,
    backgroundColor: '#fff', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 3,
    flexDirection: 'row', gap: 4,
    ...SHADOWS.sm, borderWidth: 1, borderColor: '#E5E7EB',
  },
  reactionEmoji: { fontSize: 12 },

  // Actions
  messageActions: { flexDirection: 'row', gap: 12, marginTop: 5, paddingHorizontal: 2 },
  actionLink:     { fontSize: 11, fontWeight: '700', color: COLORS.primaryBlue, opacity: 0.8 },

  // Reply preview
  replyPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  replyBar:   { width: 3, height: 36, borderRadius: 2, backgroundColor: COLORS.primaryBlue },
  replyTitle: { fontSize: 11, fontWeight: '700', color: COLORS.primaryBlue, marginBottom: 2 },
  replyText:  { fontSize: 12, color: COLORS.textMuted },

  // Error
  errorBar:  { backgroundColor: '#FEF2F2', paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#FECACA' },
  errorText: { fontSize: 12, color: '#DC2626', fontWeight: '600' },

  // Input bar
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  attachBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },
  textInput: {
    flex: 1, backgroundColor: '#F3F4F6', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    maxHeight: 100, fontSize: 14, color: COLORS.textPrimary,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.primaryBlue,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#D1D5DB' },

  // Phone modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  phoneModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 28, paddingBottom: 36,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  phoneModalHeader: { alignItems: 'center', marginBottom: 20 },
  phoneModalIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  phoneModalTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.3 },
  phoneModalSub:   { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  phoneNumberRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F8FAFC', borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 14,
    marginBottom: 20, width: '100%',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  phoneNumberText: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 1 },
  dialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 16, paddingVertical: 15,
    width: '100%', marginBottom: 10,
  },
  dialBtnText:   { color: '#fff', fontSize: 16, fontWeight: '800' },
  cancelBtn:     { paddingVertical: 12, width: '100%', alignItems: 'center' },
  cancelBtnText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },

  // Image preview
  previewOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },
  previewImage: { width: '100%', height: '80%' },
  previewClose: {
    position: 'absolute', top: 52, right: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
});
