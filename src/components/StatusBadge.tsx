import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { AttendanceStatus } from '@/src/types';
import { useState } from 'react';
import { checkInToday } from '@/src/services/attendanceService';

interface StatusBadgeProps {
  status: AttendanceStatus | null;
  userId?: string;
  onCheckInSuccess?: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  present: { label: '출근', color: '#1E7A3E', bg: '#E8F5EC' },
  working: { label: '출근중', color: '#1A6DB5', bg: '#E3EFFC' },
  absent:  { label: '결근', color: '#B83030', bg: '#FCE8E8' },
  leave:   { label: '휴가', color: '#6840B0', bg: '#EDE8F8' },
  holiday: { label: '공휴일', color: '#7A6A58', bg: '#E4D8C8' },
};

const DEFAULT_CONFIG = { label: '미출근', color: '#9A8A78', bg: '#FFFFFF' };

export default function StatusBadge({ status, userId, onCheckInSuccess }: StatusBadgeProps) {
  const [loading, setLoading] = useState(false);
  const config = status ? (STATUS_CONFIG[status] ?? DEFAULT_CONFIG) : DEFAULT_CONFIG;
  const canCheckIn = !status && userId;

  const handleCheckIn = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await checkInToday(userId);
      Alert.alert('성공', '출근 처리되었습니다.');
      onCheckInSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : '출근 처리 중 오류가 발생했습니다.';
      if (message.includes('Already checked in')) {
        Alert.alert('알림', '이미 오늘 출근했습니다.');
      } else {
        Alert.alert('오류', message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="small" color="#C8A84E" />;
  }

  return (
    <TouchableOpacity
      style={[styles.badge, { backgroundColor: config.bg }]}
      onPress={canCheckIn ? handleCheckIn : undefined}
      disabled={!canCheckIn}
      activeOpacity={canCheckIn ? 0.7 : 1}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
