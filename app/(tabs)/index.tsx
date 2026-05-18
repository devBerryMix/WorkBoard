import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { getTodayAttendance, getMonthlySummary } from '@/src/services/attendanceService';
import { getUsedLeaveDays, getLeaveRequests } from '@/src/services/leaveService';
import { formatDateKo, getTodayString, getYearMonth } from '@/src/utils/dateUtils';
import StatusBadge from '@/src/components/StatusBadge';

export default function HomeScreen() {
  const { user } = useAuth();
  const { year, month } = getYearMonth();
  const [usedLeaves, setUsedLeaves] = useState(0);
  const [todayRecord, setTodayRecord] = useState<Awaited<ReturnType<typeof getTodayAttendance>>>(undefined);
  const [monthlySummary, setMonthlySummary] = useState({ workDays: 0, presentDays: 0, absentDays: 0, leaveDays: 0 });

  const loadAttendanceData = async () => {
    if (!user) return;
    try {
      const [today, summary] = await Promise.all([
        getTodayAttendance(user.id),
        getMonthlySummary(user.id, year, month),
      ]);
      setTodayRecord(today);
      setMonthlySummary(summary);
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const leaves = await getLeaveRequests(user.id);
        setUsedLeaves(getUsedLeaveDays(leaves));
      } catch (error) {
        console.error('Failed to load leave data:', error);
        setUsedLeaves(0);
      }
    })();

    loadAttendanceData();
  }, [user]);

  if (!user) return null;

  const remainingLeaves = user.totalLeaves - usedLeaves;

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
            <StatusBadge
              status={todayRecord?.status ?? null}
              userId={user.id}
              onCheckInSuccess={loadAttendanceData}
            />
          </View>

          {/* Monthly Summary Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{month}월 근무 요약</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#1E7A3E' }]}>{monthlySummary.presentDays}</Text>
                <Text style={styles.summaryLabel}>출근</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#B83030' }]}>{monthlySummary.absentDays}</Text>
                <Text style={styles.summaryLabel}>결근</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#6840B0' }]}>{monthlySummary.leaveDays}</Text>
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
    backgroundColor: '#1C150C',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F8F4EE',
  },
  header: {
    backgroundColor: '#1C150C',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#A08040',
    marginBottom: 4,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F5EDD8',
    marginBottom: 4,
  },
  department: {
    fontSize: 14,
    color: '#9A8878',
    marginBottom: 8,
  },
  date: {
    fontSize: 13,
    color: '#A08040',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#1C150C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 13,
    color: '#9A8A78',
    fontWeight: '500',
    marginBottom: 12,
  },
  leaveCount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#C8A84E',
  },
  leaveUnit: {
    fontSize: 20,
    fontWeight: '400',
    color: '#7A6A58',
  },
  leaveDetail: {
    fontSize: 13,
    color: '#9A8A78',
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
    color: '#9A8A78',
  },
});
