import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { getLeaveRequests, getUsedLeaveDays } from '@/src/services/leaveService';
import { LeaveRequest } from '@/src/types';
import { formatDateKo } from '@/src/utils/dateUtils';

function calcDays(start: string, end: string): number {
  const s = new Date(`${start}T12:00:00`);
  const e = new Date(`${end}T12:00:00`);
  return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

const STATUS_LABEL: Record<string, string> = {
  pending: '검토중',
  approved: '승인',
  rejected: '반려',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:  { bg: '#FEF5E0', text: '#A07820' },
  approved: { bg: '#E8F5EC', text: '#1E7A3E' },
  rejected: { bg: '#FCE8E8', text: '#B83030' },
};

type InfoRow = { icon: string; label: string; value: string };

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [usedDays, setUsedDays] = useState<number>(0);
  const [recentRequests, setRecentRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Load leave requests on mount and refresh on tab focus
  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      (async () => {
        try {
          const requests = await getLeaveRequests(user.id);
          const used = getUsedLeaveDays(requests);
          setUsedDays(used);
          setRecentRequests(requests.slice(-3).reverse());
        } catch (error) {
          console.error('Failed to load leave requests:', error);
          setRecentRequests([]);
          setUsedDays(0);
        } finally {
          setLoading(false);
        }
      })();
    }, [user])
  );

  if (!user) return null;

  const remaining = user.totalLeaves - usedDays;

  const infoRows: InfoRow[] = [
    { icon: 'id-card-outline',  label: '사번',   value: user.employeeNo },
    { icon: 'business-outline', label: '부서',   value: user.department },
    { icon: 'ribbon-outline',   label: '직급',   value: user.position },
    { icon: 'mail-outline',     label: '이메일', value: user.email },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header: avatar + name + position */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name[0]}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPosition}>{user.position}</Text>
        </View>

        <View style={styles.content}>

          {/* Info Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>내 정보</Text>
            {infoRows.map((row, idx) => (
              <View
                key={row.label}
                style={[
                  styles.infoRow,
                  idx < infoRows.length - 1 && styles.infoRowBorder,
                ]}
              >
                <View style={styles.infoIconWrap}>
                  <Ionicons name={row.icon as any} size={16} color="#C8A84E" />
                </View>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{row.value}</Text>
              </View>
            ))}
          </View>

          {/* Leave Balance Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>연차 현황</Text>
            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceNum}>{user.totalLeaves}</Text>
                <Text style={styles.balanceSub}>총 연차</Text>
              </View>
              <View style={styles.balanceDivider} />
              <View style={styles.balanceItem}>
                <Text style={[styles.balanceNum, styles.usedNum]}>{usedDays}</Text>
                <Text style={styles.balanceSub}>사용</Text>
              </View>
              <View style={styles.balanceDivider} />
              <View style={styles.balanceItem}>
                <Text style={[styles.balanceNum, styles.remainingNum]}>{remaining}</Text>
                <Text style={styles.balanceSub}>잔여</Text>
              </View>
            </View>
          </View>

          {/* Recent Leave Requests Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>최근 신청 내역</Text>

            {recentRequests.length === 0 ? (
              <Text style={styles.emptyText}>최근 신청 내역이 없습니다.</Text>
            ) : (
              recentRequests.map((req, idx) => {
                const color = STATUS_COLORS[req.status] ?? STATUS_COLORS.pending;
                const days = calcDays(req.startDate, req.endDate);
                const dateLabel =
                  req.startDate === req.endDate
                    ? formatDateKo(req.startDate)
                    : `${formatDateKo(req.startDate)} ~ ${formatDateKo(req.endDate)}`;

                return (
                  <View
                    key={req.id}
                    style={[
                      styles.historyRow,
                      idx < recentRequests.length - 1 && styles.historyRowBorder,
                    ]}
                  >
                    <View style={styles.historyLeft}>
                      <Text style={styles.historyDate}>{dateLabel}</Text>
                      <Text style={styles.historyReason} numberOfLines={1}>
                        {req.reason}
                      </Text>
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={styles.historyDays}>{days}일</Text>
                      <View style={[styles.statusBadge, { backgroundColor: color.bg }]}>
                        <Text style={[styles.statusText, { color: color.text }]}>
                          {STATUS_LABEL[req.status]}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
                { text: '취소', style: 'cancel' },
                { text: '로그아웃', style: 'destructive', onPress: logout },
              ])
            }
          >
            <Ionicons name="log-out-outline" size={18} color="#B83030" />
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>

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

  // Header
  header: {
    backgroundColor: '#1C150C',
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 44,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5ECD8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#C8A84E',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F5EDD8',
    marginBottom: 4,
  },
  userPosition: {
    fontSize: 14,
    color: '#A08040',
    fontWeight: '500',
  },

  // Content
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
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
  cardLabel: {
    fontSize: 13,
    color: '#7A6A58',
    fontWeight: '500',
    marginBottom: 12,
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E4D8C8',
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E4D8C8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoLabel: {
    width: 44,
    fontSize: 13,
    color: '#B0A090',
    fontWeight: '500',
    marginRight: 12,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#1C1508',
    fontWeight: '500',
  },

  // Leave balance
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E4D8C8',
  },
  balanceNum: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1508',
    marginBottom: 4,
  },
  usedNum: {
    color: '#B83030',
  },
  remainingNum: {
    color: '#C8A84E',
  },
  balanceSub: {
    fontSize: 12,
    color: '#9A8A78',
    fontWeight: '500',
  },

  // Recent leave history
  emptyText: {
    fontSize: 14,
    color: '#9A8A78',
    textAlign: 'center',
    paddingVertical: 16,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E4D8C8',
  },
  historyLeft: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1508',
    marginBottom: 2,
  },
  historyReason: {
    fontSize: 12,
    color: '#9A8A78',
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyDays: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A3C2E',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F0C0C0',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: '#FCE8E8',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#B83030',
  },
});
