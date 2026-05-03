import { AttendanceRecord, MonthlySummary } from '@/src/types';
import { mockAttendanceRecords } from '@/src/data/attendance';
import { getTodayString } from '@/src/utils/dateUtils';

const records: AttendanceRecord[] = [...mockAttendanceRecords];

export function getAttendanceByMonth(year: number, month: number): AttendanceRecord[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return records.filter(r => r.date.startsWith(prefix));
}

export function getTodayAttendance(): AttendanceRecord | undefined {
  return records.find(r => r.date === getTodayString());
}

export function getMonthlySummary(year: number, month: number): MonthlySummary {
  const monthly = getAttendanceByMonth(year, month);
  return {
    workDays: monthly.length,
    presentDays: monthly.filter(r => r.status === 'present').length,
    absentDays: monthly.filter(r => r.status === 'absent').length,
    leaveDays: monthly.filter(r => r.status === 'leave').length,
  };
}

