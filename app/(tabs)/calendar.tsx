import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getTeamLeaveSummaryByMonth } from '@/src/services/leaveService';
import { TeamLeaveMember } from '@/src/types';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getTodayString,
  formatDateKo,
  formatMonthKo,
} from '@/src/utils/dateUtils';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarScreen() {
  const today = getTodayString();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(today);
  const [leaveMap, setLeaveMap] = useState<Record<string, TeamLeaveMember[]>>({});
  const [loading, setLoading] = useState(true);

  // Load leave data when month changes
  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const map = await getTeamLeaveSummaryByMonth(year, month);
        setLeaveMap(map);
      } catch (error) {
        console.error('Failed to fetch team leave summary:', error);
        setLeaveMap({});
      } finally {
        setLoading(false);
      }
    })();
  }, [year, month]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const selectedMembers: TeamLeaveMember[] = leaveMap[selectedDate] ?? [];

  const goToPrev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };

  const goToNext = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>팀 휴가 현황</Text>
          <Text style={styles.headerSub}>팀원의 휴가 일정을 확인하세요</Text>
        </View>

        <View style={styles.content}>

          {/* Calendar Card */}
          <View style={styles.card}>

            {/* Month Navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={goToPrev} style={styles.navBtn}>
                <Ionicons name="chevron-back" size={20} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>{formatMonthKo(year, month)}</Text>
              <TouchableOpacity onPress={goToNext} style={styles.navBtn}>
                <Ionicons name="chevron-forward" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Day Labels */}
            <View style={styles.row}>
              {DAY_LABELS.map((label, i) => (
                <Text
                  key={label}
                  style={[
                    styles.dayLabel,
                    i === 0 && styles.sundayText,
                    i === 6 && styles.saturdayText,
                  ]}
                >
                  {label}
                </Text>
              ))}
            </View>

            <View style={styles.divider} />

            {/* Calendar Grid */}
            {rows.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.row}>
                {row.map((day, colIdx) => {
                  if (!day) return <View key={`e-${rowIdx}-${colIdx}`} style={styles.cell} />;

                  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const members = leaveMap[dateStr] ?? [];
                  const isToday = dateStr === today;
                  const isSelected = dateStr === selectedDate;
                  const isSunday = colIdx === 0;
                  const isSaturday = colIdx === 6;

                  return (
                    <TouchableOpacity
                      key={dateStr}
                      style={styles.cell}
                      onPress={() => setSelectedDate(dateStr)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.dayCircle,
                        isToday && styles.todayCircle,
                        isSelected && !isToday && styles.selectedCircle,
                      ]}>
                        <Text style={[
                          styles.dayNum,
                          isToday && styles.todayNum,
                          isSelected && !isToday && styles.selectedNum,
                          !isToday && !isSelected && isSunday && styles.sundayText,
                          !isToday && !isSelected && isSaturday && styles.saturdayText,
                        ]}>
                          {day}
                        </Text>
                      </View>

                      {/* Leave count indicator */}
                      {members.length > 0 ? (
                        <Text style={styles.leaveCount}>{members.length}명</Text>
                      ) : (
                        <View style={styles.leaveCountPlaceholder} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Selected Date Leave List */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>
              {formatDateKo(selectedDate)} 휴가
            </Text>

            {selectedMembers.length === 0 ? (
              <Text style={styles.emptyText}>휴가 중인 팀원이 없습니다</Text>
            ) : (
              selectedMembers.map(member => (
                <View key={member.userId} style={styles.memberRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{member.name[0]}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberDept}>{member.department}</Text>
                  </View>
                  <View style={styles.leaveBadge}>
                    <Text style={styles.leaveBadgeText}>휴가</Text>
                  </View>
                </View>
              ))
            )}
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
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 13,
    color: '#BFDBFE',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    marginTop: -20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 4,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    backgroundColor: '#2563EB',
  },
  selectedCircle: {
    backgroundColor: '#EFF6FF',
  },
  dayNum: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  todayNum: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  selectedNum: {
    color: '#2563EB',
    fontWeight: '700',
  },
  sundayText: {
    color: '#DC2626',
  },
  saturdayText: {
    color: '#2563EB',
  },
  leaveCount: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7C3AED',
    marginTop: 2,
  },
  leaveCountPlaceholder: {
    height: 13,
    marginTop: 2,
  },
  cardLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  memberDept: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  leaveBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  leaveBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
});
