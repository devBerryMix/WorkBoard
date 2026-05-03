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
  pending:  { bg: '#FEF3C7', text: '#D97706' },
  approved: { bg: '#D1FAE5', text: '#059669' },
  rejected: { bg: '#FEE2E2', text: '#DC2626' },
};

type InfoRow = { icon: string; label: string; value: string };

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [usedDays, setUsedDays] = useState(() => user ? getUsedLeaveDays(user.id) : 0);
  const [recentRequests, setRecentRequests] = useState<LeaveRequest[]>(() =>
    user ? getLeaveRequests(user.id).slice(-3).reverse() : []
  );

  // Refresh on every tab focus so newly submitted requests appear immediately
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setUsedDays(getUsedLeaveDays(user.id));
      setRecentRequests(getLeaveRequests(user.id).slice(-3).reverse());
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
                  <Ionicons name={row.icon as any} size={16} color="#2563EB" />
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
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
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
    backgroundColor: '#2563EB',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  // Header
  header: {
    backgroundColor: '#2563EB',
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 44,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2563EB',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userPosition: {
    fontSize: 14,
    color: '#BFDBFE',
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

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoLabel: {
    width: 44,
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
    marginRight: 12,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
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
    backgroundColor: '#F3F4F6',
  },
  balanceNum: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  usedNum: {
    color: '#EF4444',
  },
  remainingNum: {
    color: '#2563EB',
  },
  balanceSub: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Recent leave history
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
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
    borderBottomColor: '#F9FAFB',
  },
  historyLeft: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  historyReason: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyDays: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
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
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: '#FFF5F5',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
});
