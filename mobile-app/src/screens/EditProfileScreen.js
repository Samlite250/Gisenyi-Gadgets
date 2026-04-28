import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, User, Phone, MapPin, Building, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function EditProfileScreen({ navigation }) {
  const { profile, user, updateProfile } = useAuth();
  
  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [city, setCity] = useState(profile?.city || '');
  const [avatar, setAvatar] = useState(profile?.avatar_url || '');
  const [avatarToUpload, setAvatarToUpload] = useState(null); // stores the local URI
  
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to update your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, // Request base64 for reliable upload
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
      setAvatarToUpload(result.assets[0]);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarToUpload) return null;

    try {
      const ext = avatarToUpload.uri.substring(avatarToUpload.uri.lastIndexOf('.') + 1) || 'jpg';
      const fileName = `avatars/${user.id}-${Date.now()}.${ext}`;

      const formData = new FormData();
      formData.append('file', {
        uri: avatarToUpload.uri,
        name: fileName,
        type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      });

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, formData, {
           contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`
        });

      if (error) {
         // Fallback to fetch blob if FormData fails
         const response = await fetch(avatarToUpload.uri);
         const blob = await response.blob();
         const fallbackRes = await supabase.storage
            .from('product-images')
            .upload(fileName, blob, { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` });
         if (fallbackRes.error) throw fallbackRes.error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('Avatar upload error:', err);
      throw new Error('Failed to upload profile picture.');
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required.');
      return;
    }

    setSaving(true);
    try {
      let finalAvatarUrl = avatar;

      if (avatarToUpload) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl;
        }
      }

      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        avatar_url: finalAvatarUrl,
      });
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Avatar Picker */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity style={styles.avatarWrap} onPress={pickImage} activeOpacity={0.8}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarImg, styles.avatarPlaceholder]}>
                <User size={40} color="#fff" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Camera size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>Tap to change</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrap}>
            <User size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWrap}>
            <Phone size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="+250 788 123 456"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <View style={styles.inputWrap}>
            <MapPin size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="KG 15 Ave"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <View style={styles.inputWrap}>
            <Building size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Gisenyi"
              value={city}
              onChangeText={setCity}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.md, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  content: { padding: SIZES.lg, gap: 20 },
  avatarContainer: { alignItems: 'center', marginBottom: 10 },
  avatarWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
    ...SHADOWS.md,
  },
  avatarImg: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  cameraIcon: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#1A1A1A', width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  avatarLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 12, fontWeight: '500' },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1, borderColor: '#F0F0F0',
    paddingHorizontal: 16, height: 56,
  },
  input: {
    flex: 1, fontSize: 15, color: COLORS.textPrimary,
    height: '100%',
  },
  footer: {
    padding: SIZES.lg, borderTopWidth: 1, borderTopColor: '#F5F5F5',
    backgroundColor: '#fff',
  },
  saveBtn: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 12, height: 56,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.sm,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
