import { AttendanceRecord, MonthlySummary } from '@/src/types';
import { mockAttendanceRecords } from '@/src/data/attendance';
import { getTodayString } from '@/src/utils/dateUtils';

const records: AttendanceRecord[] = [...mockAttendanceRecords];

export function getAttendanceByMonth(year: number, month: number): AttendanceRecord[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return records.filter(r => r.date.startsWith(prefix));
}

export function getTodayAttendance(): AttendanceRecord | undefined {
  const record = records.find(r => r.date === getTodayString());
  if (!record) return undefined;

  // Derive 'working' when checked in but not yet checked out
  if (record.checkIn && !record.checkOut && record.status === 'present') {
    return { ...record, status: 'working' };
  }
  return record;
}

// Called on login: records check-in time for today if not already set
export function checkInToday(): void {
  const today = getTodayString();
  const idx = records.findIndex(r => r.date === today);
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hh}:${mm}`;

  if (idx === -1) {
    records.unshift({ date: today, checkIn: currentTime, status: 'present' });
  } else if (!records[idx].checkIn) {
    records[idx] = { ...records[idx], checkIn: currentTime };
  }
}

export function getMonthlySummary(year: number, month: number): MonthlySummary {
  const monthly = getAttendanceByMonth(year, month);
  return {
    workDays: monthly.length,
    // 'working' also counts as present for the monthly summary
    presentDays: monthly.filter(r => r.status === 'present' || r.status === 'working').length,
    absentDays: monthly.filter(r => r.status === 'absent').length,
    leaveDays: monthly.filter(r => r.status === 'leave').length,
  };
}

