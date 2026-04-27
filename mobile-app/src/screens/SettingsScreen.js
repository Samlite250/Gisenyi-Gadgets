import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { COLORS, SIZES } from '../constants/theme';

export default function SettingsScreen({ navigation }) {
    const [pushEnabled, setPushEnabled] = React.useState(true);
    const [emailEnabled, setEmailEnabled] = React.useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>
            <View style={styles.content}>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Push Notifications</Text>
                    <Switch value={pushEnabled} onValueChange={setPushEnabled} />
                </View>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Email Notifications</Text>
                    <Switch value={emailEnabled} onValueChange={setEmailEnabled} />
                </View>
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
    content: { flex: 1, padding: SIZES.lg },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SIZES.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingLabel: { fontSize: 16, color: COLORS.textPrimary },
});
