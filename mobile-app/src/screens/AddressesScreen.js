import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Save } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function AddressesScreen({ navigation }) {
    const { profile, updateProfile } = useAuth();
    const { t } = useLanguage();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        address: profile?.address || '',
        city: profile?.city || '',
        country: profile?.country || 'Rwanda',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                address: profile.address || '',
                city: profile.city || '',
                country: profile.country || 'Rwanda',
            });
        }
    }, [profile]);

    const handleSave = async () => {
        if (!formData.address.trim()) {
            Alert.alert(t('common.required'), t('checkout.enterStreetAddress'));
            return;
        }

        setSaving(true);
        try {
            await updateProfile({
                address: formData.address,
                city: formData.city,
                country: formData.country,
            });
            Alert.alert(t('common.success'), t('checkout.addressUpdatedSuccess'));
            navigation.goBack();
        } catch (err) {
            Alert.alert(t('common.updateFailed'), err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('checkout.deliveryAddress')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.infoCard}>
                    <MapPin size={24} color={COLORS.primaryBlue} />
                    <Text style={styles.infoText}>
                        {t('checkout.addressInfoText')}
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('checkout.street')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('checkout.streetPlaceholder')}
                            value={formData.address}
                            onChangeText={(txt) => setFormData(p => ({ ...p, address: txt }))}
                            placeholderTextColor={COLORS.textMuted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('checkout.city')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('checkout.cityPlaceholder')}
                            value={formData.city}
                            onChangeText={(txt) => setFormData(p => ({ ...p, city: txt }))}
                            placeholderTextColor={COLORS.textMuted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('checkout.country')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('checkout.countryPlaceholder')}
                            value={formData.country}
                            onChangeText={(txt) => setFormData(p => ({ ...p, country: txt }))}
                            placeholderTextColor={COLORS.textMuted}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.8}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Save size={20} color="#fff" />
                            <Text style={styles.saveBtnText}>{t('checkout.saveAddress')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', padding: SIZES.md,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    backBtn: { padding: SIZES.sm },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
    content: { padding: SIZES.lg },
    infoCard: {
        flexDirection: 'row', gap: 12, backgroundColor: '#fff',
        padding: SIZES.lg, borderRadius: 16, marginBottom: 24,
        ...SHADOWS.sm, borderWidth: 1, borderColor: '#f0f0f0',
    },
    infoText: { flex: 1, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
    form: { gap: SIZES.lg, marginBottom: 32 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
    input: {
        backgroundColor: '#fff', height: 50, borderRadius: 10,
        paddingHorizontal: 16, fontSize: 15, color: COLORS.textPrimary,
        borderWidth: 1, borderColor: '#E5E7EB',
    },
    saveBtn: {
        backgroundColor: COLORS.primaryBlue, height: 56, borderRadius: 12,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
        ...SHADOWS.md,
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
