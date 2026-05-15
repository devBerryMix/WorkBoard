import { AttendanceRecord, MonthlySummary } from '@/src/types';
import { API_CONFIG, fetchAPI } from '@/src/config/api';

export async function getAttendanceByMonth(userId: string, year: number, month: number): Promise<AttendanceRecord[]> {
  try {
    const response = await fetchAPI(
      API_CONFIG.ENDPOINTS.ATTENDANCE.GET_USER(userId, year, month),
      { method: 'GET' },
    );
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch attendance:', error);
    throw new Error('FETCH_ATTENDANCE_FAILED');
  }
}

export async function getTodayAttendance(userId: string): Promise<AttendanceRecord | undefined> {
  const today = new Date();
  const records = await getAttendanceByMonth(userId, today.getFullYear(), today.getMonth() + 1);
  const todayStr = today.toISOString().split('T')[0];
  const record = records.find(r => r.date === todayStr);

  if (!record) return undefined;

  if (record.checkIn && !record.checkOut && record.status === 'present') {
    return { ...record, status: 'working' };
  }
  return record;
}

export async function checkInToday(userId: string): Promise<AttendanceRecord> {
  try {
    const response = await fetchAPI(API_CONFIG.ENDPOINTS.ATTENDANCE.CHECKIN, {
      method: 'POST',
      body: JSON.stringify({ requesterId: userId, userId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to check in:', error);
    throw new Error('CHECKIN_FAILED');
  }
}

export async function getMonthlySummary(userId: string, year: number, month: number): Promise<MonthlySummary> {
  const monthly = await getAttendanceByMonth(userId, year, month);
  return {
    workDays: monthly.length,
    presentDays: monthly.filter(r => r.status === 'present' || r.status === 'working').length,
    absentDays: monthly.filter(r => r.status === 'absent').length,
    leaveDays: monthly.filter(r => r.status === 'leave').length,
  };
}
