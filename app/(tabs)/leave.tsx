import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { submitLeave, getLeaveRequests, getUsedLeaveDays } from '@/src/services/leaveService';
import { useAuth } from '@/src/contexts/AuthContext';
import { LeaveRequest } from '@/src/types';
import { formatDateKo } from '@/src/utils/dateUtils';

type PickerTarget = 'start' | 'end' | null;

// Web fallback: auto-insert dashes as user types digits
function autoFormatDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function toDate(dateStr: string): Date {
  const d = new Date(`${dateStr}T12:00:00`);
  return isNaN(d.getTime()) ? new Date() : d;
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function calcDays(start: string, end: string): number | null {
  if (start.length !== 10 || end.length !== 10) return null;
  const s = new Date(`${start}T12:00:00`);
  const e = new Date(`${end}T12:00:00`);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return null;
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

export default function LeaveScreen() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [requests, setRequests] = useState<LeaveRequest[]>(() => user ? getLeaveRequests(user.id) : []);
  const [usedDays, setUsedDays] = useState(() => user ? getUsedLeaveDays(user.id) : 0);

  const [activePicker, setActivePicker] = useState<PickerTarget>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  if (!user) return null;

  const previewDays = calcDays(startDate, endDate);
  const remaining = user.totalLeaves - usedDays;
  const minEndDate = startDate.length === 10 ? toDate(startDate) : undefined;

  // Open native DateTimePicker (iOS / Android only)
  const openPicker = (target: 'start' | 'end') => {
    const current = target === 'start' ? startDate : endDate;
    setTempDate(current.length === 10 ? toDate(current) : new Date());
    setActivePicker(target);
  };

  // Apply selected date and clear endDate if it becomes invalid
  const applyDate = (date: Date, target: PickerTarget) => {
    const str = toDateStr(date);
    if (target === 'start') {
      setStartDate(str);
      if (endDate && endDate < str) setEndDate('');
    } else if (target === 'end') {
      setEndDate(str);
    }
  };

  // Called by DateTimePicker on both platforms
  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      const target = activePicker; // capture before clearing
      setActivePicker(null);      // close dialog
      if (event.type === 'set' && selected) applyDate(selected, target);
    } else {
      // iOS: update tempDate as user scrolls spinner
      if (selected) setTempDate(selected);
    }
  };

  // iOS confirm button
  const confirmIOS = () => {
    applyDate(tempDate, activePicker);
    setActivePicker(null);
  };

  // Web: text input handlers with validation
  const handleStartTextChange = (text: string) => {
    const formatted = autoFormatDate(text);
    setStartDate(formatted);
    if (formatted.length === 10 && endDate && endDate < formatted) setEndDate('');
  };

  const handleEndTextChange = (text: string) => {
    const formatted = autoFormatDate(text);
    if (formatted.length === 10 && startDate.length === 10 && formatted < startDate) {
      Alert.alert('날짜 오류', '종료일은 시작일보다 빠를 수 없습니다.');
      return;
    }
    setEndDate(formatted);
  };

  const handleSubmit = () => {
    if (!startDate || !endDate || !reason.trim()) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
      return;
    }
    if (startDate.length !== 10 || endDate.length !== 10) {
      Alert.alert('형식 오류', '날짜를 끝까지 입력해주세요.\n예: 2026-06-01');
      return;
    }
    const s = new Date(`${startDate}T12:00:00`);
    const e = new Date(`${endDate}T12:00:00`);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      Alert.alert('날짜 오류', '유효한 날짜를 입력해주세요.');
      return;
    }
    if (e < s) {
      Alert.alert('날짜 오류', '종료일은 시작일보다 같거나 늦어야 합니다.');
      return;
    }

    submitLeave(startDate, endDate, reason.trim(), user.id);
    setRequests(getLeaveRequests(user.id));
    setUsedDays(getUsedLeaveDays(user.id));
    setStartDate('');
    setEndDate('');
    setReason('');
    Alert.alert('신청 완료', '연차 신청이 완료되었습니다.\n승인 후 캘린더에서 확인하실 수 있습니다.');
  };

  // Date field: native picker button (iOS/Android) or TextInput (Web)
  const renderDateField = (label: string, value: string, target: 'start' | 'end') => (
    <View style={styles.dateField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {Platform.OS === 'web' ? (
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.dateInput}
            value={value}
            onChangeText={target === 'start' ? handleStartTextChange : handleEndTextChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#D1D5DB"
            keyboardType="numeric"
            maxLength={10}
          />
          <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.inputWrapper}
          onPress={() => openPicker(target)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dateDisplayText, !value && styles.datePlaceholder]}>
            {value || 'YYYY-MM-DD'}
          </Text>
          <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>연차 신청</Text>
            <Text style={styles.headerSub}>휴가 신청 및 내역을 확인하세요</Text>
          </View>

          <View style={styles.content}>

            {/* Leave Balance Card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>내 연차 현황</Text>
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

            {/* Leave Form Card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>연차 신청</Text>

              {/* Date inputs */}
              <View style={styles.dateRow}>
                {renderDateField('시작일', startDate, 'start')}
                <Ionicons name="arrow-forward" size={16} color="#9CA3AF" style={styles.arrowIcon} />
                {renderDateField('종료일', endDate, 'end')}
              </View>

              {/* Day count preview */}
              {previewDays !== null && (
                <View style={styles.dayHint}>
                  <Ionicons name="information-circle-outline" size={14} color="#2563EB" />
                  <Text style={styles.dayHintText}>총 {previewDays}일 신청</Text>
                </View>
              )}

              {/* Reason */}
              <Text style={[styles.fieldLabel, styles.reasonLabel]}>사유</Text>
              <TextInput
                style={styles.reasonInput}
                value={reason}
                onChangeText={setReason}
                placeholder="휴가 사유를 입력해주세요"
                placeholderTextColor="#D1D5DB"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Submit */}
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
                <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>신청하기</Text>
              </TouchableOpacity>
            </View>

            {/* Leave History Card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>신청 내역</Text>

              {requests.length === 0 ? (
                <Text style={styles.emptyText}>신청 내역이 없습니다</Text>
              ) : (
                [...requests].reverse().map(req => {
                  const color = STATUS_COLORS[req.status] ?? STATUS_COLORS.pending;
                  const reqDays = calcDays(req.startDate, req.endDate);
                  const dateLabel =
                    req.startDate === req.endDate
                      ? formatDateKo(req.startDate)
                      : `${formatDateKo(req.startDate)} ~ ${formatDateKo(req.endDate)}`;

                  return (
                    <View key={req.id} style={styles.historyRow}>
                      <View style={styles.historyLeft}>
                        <Text style={styles.historyDate}>{dateLabel}</Text>
                        <Text style={styles.historyReason} numberOfLines={1}>{req.reason}</Text>
                      </View>
                      <View style={styles.historyRight}>
                        {reqDays !== null && (
                          <Text style={styles.historyDays}>{reqDays}일</Text>
                        )}
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

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* iOS: bottom modal with spinner */}
      {Platform.OS === 'ios' && activePicker !== null && (
        <Modal transparent animationType="slide" visible>
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setActivePicker(null)}
            />
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setActivePicker(null)}>
                  <Text style={styles.modalCancel}>취소</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {activePicker === 'start' ? '시작일' : '종료일'} 선택
                </Text>
                <TouchableOpacity onPress={confirmIOS}>
                  <Text style={styles.modalConfirm}>확인</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                minimumDate={activePicker === 'end' ? minEndDate : undefined}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android: native calendar dialog popup */}
      {Platform.OS === 'android' && activePicker !== null && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="calendar"
          onChange={onDateChange}
          minimumDate={activePicker === 'end' ? minEndDate : undefined}
        />
      )}
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
  cardLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 12,
  },

  // Balance
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

  // Form
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  dateField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  reasonLabel: {
    marginTop: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#F9FAFB',
  },
  arrowIcon: {
    marginBottom: 10,
  },

  // Native date button (iOS/Android)
  dateDisplayText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  datePlaceholder: {
    color: '#D1D5DB',
  },

  // Web TextInput
  dateInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    marginRight: 6,
  },

  dayHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  dayHintText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    minHeight: 90,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
    gap: 8,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // History
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

  // iOS Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalConfirm: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  iosPicker: {
    height: 200,
  },
});
