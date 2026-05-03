import { View, Text, StyleSheet } from 'react-native';
import { AttendanceStatus } from '@/src/types';

interface StatusBadgeProps {
  status: AttendanceStatus | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  present: { label: '출근', color: '#16A34A', bg: '#DCFCE7' },
  absent:  { label: '결근', color: '#DC2626', bg: '#FEE2E2' },
  leave:   { label: '휴가', color: '#7C3AED', bg: '#EDE9FE' },
  holiday: { label: '공휴일', color: '#6B7280', bg: '#F3F4F6' },
};

const DEFAULT_CONFIG = { label: '미출근', color: '#9CA3AF', bg: '#F3F4F6' };

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
