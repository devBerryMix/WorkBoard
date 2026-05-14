import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getTeamLeaveSummaryByMonth } from '@/src/services/leaveService';
import { getUsersByDepartment } from '@/src/services/userService';
import { TeamLeaveMember, User } from '@/src/types';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getTodayString,
  formatDateKo,
  formatMonthKo,
} from '@/src/utils/dateUtils';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const DEPARTMENTS = [
  { id: 'D001', name: 'IT팀' },
  { id: 'D002', name: '테이블게임팀' },
  { id: 'D003', name: '전자게임팀' },
  { id: 'D004', name: '오퍼레이션지원팀' },
  { id: 'D005', name: '카지노CS팀' },
];

export default function CalendarScreen() {
  const { user } = useAuth();
  const today = getTodayString();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(today);
  const [leaveMap, setLeaveMap] = useState<Record<string, TeamLeaveMember[]>>({});
  const [loading, setLoading] = useState(true);

  // Department popup state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState(user?.departmentId ?? 'D001');
  const [deptUsers, setDeptUsers] = useState<User[]>([]);
  const [deptLeaveMap, setDeptLeaveMap] = useState<Record<string, TeamLeaveMember[]>>({});
  const [deptLoading, setDeptLoading] = useState(false);

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

  useEffect(() => {
    if (!modalVisible || !user) return;
    setDeptLoading(true);
    (async () => {
      try {
        const [users, leaveData] = await Promise.all([
          getUsersByDepartment(selectedDeptId, user.id),
          getTeamLeaveSummaryByMonth(year, month, user.id, selectedDeptId),
        ]);
        setDeptUsers(users);
        setDeptLeaveMap(leaveData);
      } catch (error) {
        console.error('Failed to fetch dept data:', error);
        setDeptUsers([]);
        setDeptLeaveMap({});
      } finally {
        setDeptLoading(false);
      }
    })();
  }, [modalVisible, selectedDeptId, year, month]);

  const openModal = () => {
    setSelectedDeptId(user?.departmentId ?? 'D001');
    setModalVisible(true);
  };

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
  const onLeaveIds = new Set((deptLeaveMap[selectedDate] ?? []).map(m => m.userId));

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
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>팀 휴가 현황</Text>
              <Text style={styles.headerSub}>팀원의 휴가 일정을 확인하세요</Text>
            </View>
            <TouchableOpacity onPress={openModal} style={styles.deptFilterBtn}>
              <Ionicons name="people-outline" size={16} color="#F5EDD8" />
              <Text style={styles.deptFilterBtnText}>부서별</Text>
            </TouchableOpacity>
          </View>
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

      {/* Department Popup Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>부서별 휴가 현황</Text>
                <Text style={styles.modalSub}>{formatDateKo(selectedDate)}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#4A3C2E" />
              </TouchableOpacity>
            </View>

            {/* Department Tabs */}
            <View style={styles.deptTabsWrap}>
              {DEPARTMENTS.map(dept => (
                <TouchableOpacity
                  key={dept.id}
                  onPress={() => setSelectedDeptId(dept.id)}
                  style={[
                    styles.deptTab,
                    selectedDeptId === dept.id && styles.deptTabActive,
                  ]}
                >
                  <Text style={[
                    styles.deptTabText,
                    selectedDeptId === dept.id && styles.deptTabTextActive,
                  ]}>
                    {dept.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalDivider} />

            {/* Member List */}
            <ScrollView style={styles.memberListScroll} showsVerticalScrollIndicator={false}>
              {deptLoading ? (
                <ActivityIndicator size="small" color="#C8A84E" style={styles.modalLoader} />
              ) : deptUsers.length === 0 ? (
                <Text style={styles.emptyText}>부서원 정보를 불러올 수 없습니다</Text>
              ) : (
                deptUsers.map(member => {
                  const isOnLeave = onLeaveIds.has(member.id);
                  return (
                    <View key={member.id} style={styles.modalMemberRow}>
                      <View style={[styles.avatar, isOnLeave && styles.avatarOnLeave]}>
                        <Text style={[styles.avatarText, isOnLeave && styles.avatarTextOnLeave]}>
                          {member.name[0]}
                        </Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text style={styles.memberDept}>{member.position} · {member.department}</Text>
                      </View>
                      {isOnLeave ? (
                        <View style={styles.leaveBadge}>
                          <Text style={styles.leaveBadgeText}>휴가중</Text>
                        </View>
                      ) : (
                        <View style={styles.workBadge}>
                          <Text style={styles.workBadgeText}>근무중</Text>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>

          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  deptFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 4,
  },
  deptFilterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F5EDD8',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    marginTop: 0,
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
  avatarOnLeave: {
    backgroundColor: '#EDE8F8',
  },
  avatarTextOnLeave: {
    color: '#6840B0',
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
  workBadge: {
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  workBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D7A4F',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1508',
    marginBottom: 2,
  },
  modalSub: {
    fontSize: 13,
    color: '#7A6A58',
  },
  closeBtn: {
    padding: 4,
  },
  deptTabsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  deptTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deptTabActive: {
    backgroundColor: '#1C150C',
  },
  deptTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7A6A58',
    lineHeight: 18,
    includeFontPadding: false,
  },
  deptTabTextActive: {
    color: '#F5EDD8',
    fontWeight: '700',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E4D8C8',
    marginTop: 14,
    marginBottom: 4,
  },
  memberListScroll: {
    paddingHorizontal: 20,
  },
  modalMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE3',
  },
  modalLoader: {
    paddingVertical: 32,
  },
});
