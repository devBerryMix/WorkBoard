import { LeaveRequest } from '@/src/types';

export const mockLeaveRequests: LeaveRequest[] = [
  // 이정호 (userId: '1')
  { id: '1',  userId: '1',  startDate: '2026-04-21', endDate: '2026-04-21', reason: '병원 방문',  status: 'approved', createdAt: '2026-04-18' },
  { id: '2',  userId: '1',  startDate: '2026-05-27', endDate: '2026-05-27', reason: '개인 사정',  status: 'approved', createdAt: '2026-05-20' },

  // 김민준 (userId: '2')
  { id: '3',  userId: '2',  startDate: '2026-05-07', endDate: '2026-05-08', reason: '가족 행사',  status: 'approved', createdAt: '2026-05-01' },

  // 이서준 (userId: '3')
  { id: '4',  userId: '3',  startDate: '2026-05-12', endDate: '2026-05-12', reason: '개인 사정',  status: 'approved', createdAt: '2026-05-05' },

  // 박지훈 (userId: '4')
  { id: '5',  userId: '4',  startDate: '2026-05-07', endDate: '2026-05-07', reason: '병원 방문',  status: 'approved', createdAt: '2026-05-02' },

  // 최도윤 (userId: '5')
  { id: '6',  userId: '5',  startDate: '2026-05-14', endDate: '2026-05-15', reason: '여행',       status: 'approved', createdAt: '2026-05-03' },

  // 정하준 (userId: '6')
  { id: '7',  userId: '6',  startDate: '2026-05-20', endDate: '2026-05-22', reason: '여행',       status: 'pending',  createdAt: '2026-05-10' },

  // 강민서 (userId: '7')
  { id: '8',  userId: '7',  startDate: '2026-05-13', endDate: '2026-05-14', reason: '개인 사정',  status: 'approved', createdAt: '2026-04-30' },

  // 윤서연 (userId: '8')
  { id: '9',  userId: '8',  startDate: '2026-05-26', endDate: '2026-05-27', reason: '가족 행사',  status: 'approved', createdAt: '2026-05-10' },

  // 장예준 (userId: '9')
  { id: '10', userId: '9',  startDate: '2026-05-20', endDate: '2026-05-21', reason: '병원 방문',  status: 'approved', createdAt: '2026-05-05' },

  // 한지우 (userId: '10')
  { id: '11', userId: '10', startDate: '2026-05-28', endDate: '2026-05-28', reason: '개인 사정',  status: 'approved', createdAt: '2026-05-15' },
];
