import { AttendanceRecord } from '@/src/types';

export const mockAttendanceRecords: AttendanceRecord[] = [
  { date: '2026-05-01', checkIn: '09:05', checkOut: '18:10', status: 'present' },
  { date: '2026-04-30', checkIn: '09:00', checkOut: '18:00', status: 'present' },
  { date: '2026-04-29', status: 'leave' },
  { date: '2026-04-28', checkIn: '09:20', checkOut: '18:00', status: 'present' },
  { date: '2026-04-27', status: 'absent' },
  { date: '2026-04-24', checkIn: '08:55', checkOut: '18:05', status: 'present' },
  { date: '2026-04-23', checkIn: '09:10', checkOut: '18:00', status: 'present' },
  { date: '2026-04-22', checkIn: '09:00', checkOut: '18:30', status: 'present' },
  { date: '2026-04-21', status: 'leave' },
  { date: '2026-04-20', checkIn: '09:05', checkOut: '18:00', status: 'present' },
  { date: '2026-04-17', checkIn: '09:00', checkOut: '18:00', status: 'present' },
  { date: '2026-04-16', checkIn: '09:15', checkOut: '18:00', status: 'present' },
  { date: '2026-04-15', checkIn: '09:00', checkOut: '18:00', status: 'present' },
  { date: '2026-04-14', checkIn: '09:00', checkOut: '18:10', status: 'present' },
  { date: '2026-04-13', status: 'absent' },
];
