import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getPendingLeaveRequests, processLeave } from '@/src/services/leaveService';
import { mockUsers } from '@/src/data/user';
import { LeaveRequest } from '@/src/types';
import { formatDateKo } from '@/src/utils/dateUtils';

function calcDays(start: string, end: string): number {
  const s = new Date(`${start}T12:00:00`);
  const e = new Date(`${end}T12:00:00`);
  return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function getUserName(userId: string): string {
  return mockUsers.find(u => u.id === userId)?.name ?? '알 수 없음';
}

function getUserDept(userId: string): string {
  return mockUsers.find(u => u.id === userId)?.department ?? '';
}

export default function ApproveScreen() {
  const [pending, setPending] = useState<LeaveRequest[]>(() => getPendingLeaveRequests());

  useFocusEffect(
    useCallback(() => {
      setPending(getPendingLeaveRequests());
    }, [])
  );

  function handleAction(id: string, action: 'approved' | 'rejected') {
    const label = action === 'approved' ? '승인' : '반려';
    Alert.alert(
      `${label} 확인`,
      `해당 연차 신청을 ${label} 처리하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: label,
          style: action === 'rejected' ? 'destructive' : 'default',
          onPress: () => {
            processLeave(id, action);
            setPending(getPendingLeaveRequests());
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>연차 승인 관리</Text>
          <Text style={styles.headerSub}>대기 중인 연차 신청을 검토하세요</Text>
        </View>

        <View style={styles.content}>

          <View style={styles.badge}>
            <Ionicons name="time-outline" size={14} color="#C8A84E" />
            <Text style={styles.badgeText}>대기 중 {pending.length}건</Text>
          </View>

          {pending.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#1E7A3E" />
              <Text style={styles.emptyTitle}>모두 처리되었습니다</Text>
              <Text style={styles.emptySub}>대기 중인 연차 신청이 없습니다</Text>
            </View>
          ) : (
            pending.map(req => {
              const days = calcDays(req.startDate, req.endDate);
              const dateLabel =
                req.startDate === req.endDate
                  ? formatDateKo(req.startDate)
                  : `${formatDateKo(req.startDate)} ~ ${formatDateKo(req.endDate)}`;

              return (
                <View key={req.id} style={styles.card}>
                  {/* Applicant info */}
                  <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getUserName(req.userId)[0]}</Text>
                    </View>
                    <View style={styles.applicantInfo}>
                      <Text style={styles.applicantName}>{getUserName(req.userId)}</Text>
                      <Text style={styles.applicantDept}>{getUserDept(req.userId)}</Text>
                    </View>
                    <View style={styles.daysBadge}>
                      <Text style={styles.daysText}>{days}일</Text>
                    </View>
                  </View>

                  {/* Leave details */}
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color="#7A6A58" />
                    <Text style={styles.detailText}>{dateLabel}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="document-text-outline" size={14} color="#7A6A58" />
                    <Text style={styles.detailText}>{req.reason}</Text>
                  </View>
                  <Text style={styles.createdAt}>신청일 {formatDateKo(req.createdAt)}</Text>

                  {/* Action buttons */}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      activeOpacity={0.8}
                      onPress={() => handleAction(req.id, 'rejected')}
                    >
                      <Ionicons name="close-circle-outline" size={16} color="#B83030" />
                      <Text style={styles.rejectText}>반려</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      activeOpacity={0.8}
                      onPress={() => handleAction(req.id, 'approved')}
                    >
                      <Ionicons name="checkmark-circle-outline" size={16} color="#1C150C" />
                      <Text style={styles.approveText}>승인</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
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
    paddingBottom: 32,
    marginTop: -20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF5E0',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C8A84E',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1508',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#9A8A78',
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E4D8C8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C8A84E',
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1508',
    marginBottom: 2,
  },
  applicantDept: {
    fontSize: 12,
    color: '#9A8A78',
  },
  daysBadge: {
    backgroundColor: '#E4D8C8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  daysText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A07820',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#4A3C2E',
    flex: 1,
  },
  createdAt: {
    fontSize: 11,
    color: '#9A8A78',
    marginTop: 4,
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#F0C0C0',
    borderRadius: 10,
    paddingVertical: 11,
    backgroundColor: '#FCE8E8',
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B83030',
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C8A84E',
    borderRadius: 10,
    paddingVertical: 11,
  },
  approveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C150C',
  },
});
