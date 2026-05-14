import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { X, Star, Camera, Send, ImageIcon } from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { COLORS, SIZES } from '../constants/theme';

// ── ReviewCard ────────────────────────────────────────────────────────────────
export function ReviewCard({ rev }) {
  const name = rev.profiles?.full_name || rev.user || 'Anonymous';
  const date = rev.created_at ? rev.created_at.split('T')[0] : rev.date || '';
  return (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: `https://i.pravatar.cc/150?u=${rev.user_id || rev.id}` }}
          style={styles.reviewAvatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewUser}>{name}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={11}
                color={s <= rev.rating ? '#FBBC04' : '#E5E7EB'}
                fill={s <= rev.rating ? '#FBBC04' : 'none'}
              />
            ))}
          </View>
        </View>
        <Text style={styles.reviewDate}>{date}</Text>
      </View>
      {rev.comment ? <Text style={styles.reviewComment}>{rev.comment}</Text> : null}
      {rev.image_url ? (
        <Image source={{ uri: rev.image_url }} style={styles.reviewPhoto} resizeMode="cover" />
      ) : null}
    </View>
  );
}

// ── WriteReviewModal ──────────────────────────────────────────────────────────
export function WriteReviewModal({ visible, onClose, product, user, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to attach a review photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75,
    });
    if (!result.canceled && result.assets[0]) setPhoto(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take a review photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75,
    });
    if (!result.canceled && result.assets[0]) setPhoto(result.assets[0].uri);
  };

  const uploadPhoto = async (uri) => {
    const ext = uri.split('.').pop() || 'jpg';
    const fileName = `review_${Date.now()}.${ext}`;
    const response = await fetch(uri);
    const blob = await response.blob();
    const { data, error } = await supabase.storage
      .from('review-images')
      .upload(fileName, blob, { contentType: `image/${ext}` });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('review-images').getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Comment required', 'Please write something about this product.');
      return;
    }
    if (!user) {
      Alert.alert('Login required', 'You must be logged in to submit a review.');
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = null;
      if (photo) imageUrl = await uploadPhoto(photo);
      const { error } = await supabase.from('reviews').insert({
        product_id: product.id,
        user_id: user.id,
        rating,
        comment: comment.trim(),
        image_url: imageUrl,
      });
      if (error) throw error;
      Alert.alert('✅ Thank you!', 'Your review has been submitted.');
      setRating(5);
      setComment('');
      setPhoto(null);
      onSubmitted?.();
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const RATING_LABELS = ['', 'Terrible 😞', 'Bad 😕', 'Okay 😐', 'Good 😊', 'Excellent 🤩'];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={mStyles.overlay}>
        <View style={mStyles.sheet}>
          {/* Handle bar */}
          <View style={mStyles.handle} />

          {/* Header */}
          <View style={mStyles.header}>
            <Text style={mStyles.title}>Write a Review</Text>
            <TouchableOpacity style={mStyles.closeBtn} onPress={onClose}>
              <X size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={mStyles.productName} numberOfLines={1}>{product?.name}</Text>

          {/* Star Picker */}
          <View style={mStyles.starSection}>
            <Text style={mStyles.label}>Your Rating</Text>
            <View style={mStyles.starRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setRating(s)}
                  hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                >
                  <Star
                    size={36}
                    color={s <= rating ? '#FBBC04' : '#D1D5DB'}
                    fill={s <= rating ? '#FBBC04' : 'none'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={mStyles.ratingLabel}>{RATING_LABELS[rating]}</Text>
          </View>

          {/* Comment */}
          <Text style={mStyles.label}>Your Comment</Text>
          <TextInput
            style={mStyles.textInput}
            placeholder="Share your experience with this product..."
            placeholderTextColor={COLORS.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={mStyles.charCount}>{comment.length}/500</Text>

          {/* Photo */}
          <Text style={mStyles.label}>Add a Photo (optional)</Text>
          {photo ? (
            <View style={mStyles.photoPreviewWrap}>
              <Image source={{ uri: photo }} style={mStyles.photoPreview} resizeMode="cover" />
              <TouchableOpacity style={mStyles.removePhoto} onPress={() => setPhoto(null)}>
                <X size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={mStyles.photoButtons}>
              <TouchableOpacity style={mStyles.photoBtn} onPress={pickPhoto}>
                <ImageIcon size={18} color={COLORS.primaryBlue} />
                <Text style={mStyles.photoBtnText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={mStyles.photoBtn} onPress={takePhoto}>
                <Camera size={18} color={COLORS.primaryBlue} />
                <Text style={mStyles.photoBtnText}>Camera</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[mStyles.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Send size={16} color="#fff" />
                <Text style={mStyles.submitText}>Submit Review</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  reviewItem: {
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#eee' },
  reviewUser: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  reviewDate: { fontSize: 11, color: COLORS.textMuted },
  reviewComment: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  reviewPhoto: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  starsRow: { flexDirection: 'row', gap: 2 },
});

const mStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  starSection: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  starRow: { flexDirection: 'row', gap: 8 },
  ratingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minHeight: 22,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 90,
    lineHeight: 20,
  },
  charCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: -8,
  },
  photoButtons: { flexDirection: 'row', gap: 12 },
  photoBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primaryBlue },
  photoPreviewWrap: { position: 'relative', alignSelf: 'flex-start' },
  photoPreview: { width: 120, height: 90, borderRadius: 12 },
  removePhoto: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    height: 54,
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
