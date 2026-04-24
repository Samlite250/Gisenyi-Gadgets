import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CheckCircle2, Circle } from 'lucide-react-native';

const STATUSES = [
  { id: '1', label: 'Order Placed', time: 'May 18, 2024 10:30 AM', completed: true },
  { id: '2', label: 'Processing', time: 'May 18, 2024 12:00 PM', completed: true },
  { id: '3', label: 'Shipped', time: 'May 19, 2024 09:15 AM', completed: true },
  { id: '4', label: 'Out for Delivery', time: 'May 20, 2024', completed: false },
  { id: '5', label: 'Delivered', time: 'May 21, 2024', completed: false },
];

export default function OrderTrackingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Main')}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ORDER TRACKING</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #GGS123456</Text>
          <Text style={styles.orderDate}>Placed on May 18, 2024</Text>
        </View>

        <View style={styles.timeline}>
          {STATUSES.map((status, index) => (
            <View key={status.id} style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                {status.completed ? (
                  <CheckCircle2 size={24} color="#34A853" />
                ) : (
                  <Circle size={24} color="#94A3B8" />
                )}
                {index < STATUSES.length - 1 && (
                  <View style={[styles.timelineLine, status.completed && styles.timelineLineCompleted]} />
                )}
              </View>
              
              <View style={styles.timelineContent}>
                <Text style={[styles.statusLabel, status.completed && styles.statusLabelCompleted]}>
                  {status.label}
                </Text>
                <Text style={styles.statusTime}>{status.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.viewDetailsBtn}>
          <Text style={styles.viewDetailsBtnText}>View Order Details</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 16,
  },
  iconBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#1E293B',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  content: {
    padding: 24,
  },
  orderInfo: {
    marginBottom: 40,
  },
  orderId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  orderDate: {
    fontSize: 16,
    color: '#94A3B8',
  },
  timeline: {
    marginBottom: 40,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: '#1E293B',
    marginTop: 8,
  },
  timelineLineCompleted: {
    backgroundColor: '#34A853',
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginBottom: 4,
  },
  statusLabelCompleted: {
    color: '#FFFFFF',
  },
  statusTime: {
    fontSize: 14,
    color: '#94A3B8',
  },
  viewDetailsBtn: {
    backgroundColor: '#4285F4',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDetailsBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
