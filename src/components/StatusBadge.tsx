import { View, Text, StyleSheet } from 'react-native';
import { AttendanceStatus } from '@/src/types';

interface StatusBadgeProps {
  status: AttendanceStatus | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  present: { label: '출근', color: '#1E7A3E', bg: '#E8F5EC' },
  working: { label: '출근중', color: '#1A6DB5', bg: '#E3EFFC' },
  absent:  { label: '결근', color: '#B83030', bg: '#FCE8E8' },
  leave:   { label: '휴가', color: '#6840B0', bg: '#EDE8F8' },
  holiday: { label: '공휴일', color: '#7A6A58', bg: '#E4D8C8' },
};

const DEFAULT_CONFIG = { label: '미출근', color: '#9A8A78', bg: '#FFFFFF' };

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = status ? (STATUS_CONFIG[status] ?? DEFAULT_CONFIG) : DEFAULT_CONFIG;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
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
