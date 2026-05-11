export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'holiday';

export interface AttendanceRecord {
  date: string;      // YYYY-MM-DD
  checkIn?: string;  // HH:mm
  checkOut?: string; // HH:mm
  status: AttendanceStatus;
}

export interface MonthlySummary {
  workDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  userId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason: string;
  status: LeaveStatus;
  createdAt: string; // YYYY-MM-DD
}

export interface TeamLeaveMember {
  userId: string;
  name: string;
  department: string;
}

export interface User {
  id: string;
  employeeNo: string;
  name: string;
  group: string;
  departmentId: string;
  department: string;
  position: string;
  email: string;
  totalLeaves: number;
  usedLeaves: number;
}
