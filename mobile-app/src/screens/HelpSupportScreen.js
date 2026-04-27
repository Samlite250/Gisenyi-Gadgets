import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { COLORS, SIZES } from '../constants/theme';

export default function HelpSupportScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </View>
            <View style={styles.content}>
                <Text style={styles.text}>Contact us at support@gisenyigadgets.com</Text>
                <Text style={styles.subText}>FAQs and Live Chat coming soon!</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', padding: SIZES.md,
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
    },
    backBtn: { padding: SIZES.sm },
    headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.xl },
    text: { fontSize: 16, color: COLORS.textPrimary, marginBottom: 8 },
    subText: { fontSize: 14, color: COLORS.textMuted },
});
