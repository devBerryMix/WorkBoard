import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/src/contexts/AuthContext';
import { getTodayAttendance, getMonthlySummary } from '@/src/services/attendanceService';
import { getUsedLeaveDays } from '@/src/services/leaveService';
import { formatDateKo, getTodayString, getYearMonth } from '@/src/utils/dateUtils';
import StatusBadge from '@/src/components/StatusBadge';

export default function HomeScreen() {
  const { user } = useAuth();
  if (!user) return null;

  const todayRecord = getTodayAttendance();
  const usedLeaves = getUsedLeaveDays(user.id);
  const remainingLeaves = user.totalLeaves - usedLeaves;
  const { year, month } = getYearMonth();
  const summary = getMonthlySummary(year, month);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>안녕하세요,</Text>
          <Text style={styles.userName}>{user.name} 님</Text>
          <Text style={styles.department}>{user.department}</Text>
          <Text style={styles.date}>{formatDateKo(getTodayString())}</Text>
        </View>

        {/* Cards */}
        <View style={styles.content}>

          {/* Work Status Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>오늘 근무 상태</Text>
            <StatusBadge status={todayRecord?.status ?? null} />
            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>출근</Text>
                <Text style={styles.timeValue}>{todayRecord?.checkIn ?? '-'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>퇴근</Text>
                <Text style={styles.timeValue}>{todayRecord?.checkOut ?? '-'}</Text>
              </View>
            </View>
          </View>

          {/* Monthly Summary Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{month}월 근무 요약</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#16A34A' }]}>{summary.presentDays}</Text>
                <Text style={styles.summaryLabel}>출근</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#DC2626' }]}>{summary.absentDays}</Text>
                <Text style={styles.summaryLabel}>결근</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#7C3AED' }]}>{summary.leaveDays}</Text>
                <Text style={styles.summaryLabel}>휴가</Text>
              </View>
            </View>
          </View>

          {/* Leave Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>잔여 연차</Text>
            <Text style={styles.leaveCount}>
              {remainingLeaves}
              <Text style={styles.leaveUnit}>일</Text>
            </Text>
            <Text style={styles.leaveDetail}>
              총 {user.totalLeaves}일 중 {usedLeaves}일 사용
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2563EB',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
  },
  greeting: {
    fontSize: 14,
    color: '#BFDBFE',
    marginBottom: 4,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  department: {
    fontSize: 14,
    color: '#93C5FD',
    marginBottom: 8,
  },
  date: {
    fontSize: 13,
    color: '#BFDBFE',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    marginTop: -24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: '#E5E7EB',
  },
  leaveCount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#2563EB',
  },
  leaveUnit: {
    fontSize: 20,
    fontWeight: '400',
    color: '#6B7280',
  },
  leaveDetail: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
