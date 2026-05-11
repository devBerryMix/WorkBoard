import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getTeamLeaveSummaryByMonth } from '@/src/services/leaveService';
import { TeamLeaveMember } from '@/src/types';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getTodayString,
  formatDateKo,
  formatMonthKo,
} from '@/src/utils/dateUtils';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarScreen() {
  const { user } = useAuth();
  const today = getTodayString();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(today);
  const [leaveMap, setLeaveMap] = useState<Record<string, TeamLeaveMember[]>>({});
  const [loading, setLoading] = useState(true);

  // Load leave data when month changes
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      try {
        const map = await getTeamLeaveSummaryByMonth(year, month, user.id);
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
                <Ionicons name="chevron-back" size={20} color="#D4C0A8" />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>{formatMonthKo(year, month)}</Text>
              <TouchableOpacity onPress={goToNext} style={styles.navBtn}>
                <Ionicons name="chevron-forward" size={20} color="#D4C0A8" />
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
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F5EDD8',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 13,
    color: '#A08040',
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
    shadowOpacity: 0.08,
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
    backgroundColor: '#E4D8C8',
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1508',
  },
  row: {
    flexDirection: 'row',
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#7A6A58',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E4D8C8',
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
    backgroundColor: '#C8A84E',
  },
  selectedCircle: {
    backgroundColor: '#E4D8C8',
  },
  dayNum: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A3C2E',
  },
  todayNum: {
    color: '#1C150C',
    fontWeight: '700',
  },
  selectedNum: {
    color: '#C8A84E',
    fontWeight: '700',
  },
  sundayText: {
    color: '#B83030',
  },
  saturdayText: {
    color: '#C8A84E',
  },
  leaveCount: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6840B0',
    marginTop: 2,
  },
  leaveCountPlaceholder: {
    height: 13,
    marginTop: 2,
  },
  cardLabel: {
    fontSize: 13,
    color: '#7A6A58',
    fontWeight: '500',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9A8A78',
    textAlign: 'center',
    paddingVertical: 16,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E4D8C8',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E4D8C8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C8A84E',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1508',
    marginBottom: 2,
  },
  memberDept: {
    fontSize: 12,
    color: '#9A8A78',
  },
  leaveBadge: {
    backgroundColor: '#EDE8F8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  leaveBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6840B0',
  },
});
