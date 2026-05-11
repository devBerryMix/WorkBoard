import { LeaveRequest, TeamLeaveMember } from '@/src/types';
import { API_CONFIG, fetchAPI } from '@/src/config/api';

// 본인 연차 조회 — userId 한 개만 필요 (requesterId = userId)
export async function getLeaveRequests(userId: string): Promise<LeaveRequest[]> {
  try {
    const response = await fetchAPI(
      API_CONFIG.ENDPOINTS.LEAVES.GET_USER_LEAVES(userId),
      { method: 'GET' },
    );
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch leave requests:', error);
    throw new Error('FETCH_LEAVES_FAILED');
  }
}

// 연차 신청 — 본인만 가능 (requesterId = userId)
export async function submitLeave(
  startDate: string,
  endDate: string,
  reason: string,
  userId: string,
): Promise<LeaveRequest> {
  try {
    const response = await fetchAPI(API_CONFIG.ENDPOINTS.LEAVES.CREATE_LEAVE, {
      method: 'POST',
      body: JSON.stringify({ requesterId: userId, userId, startDate, endDate, reason }),
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to submit leave request:', error);
    throw new Error('SUBMIT_LEAVE_FAILED');
  }
}

export function getUsedLeaveDays(leaveRequests: LeaveRequest[]): number {
  return leaveRequests
    .filter(r => r.status === 'approved')
    .reduce((total, r) => {
      const start = new Date(`${r.startDate}T12:00:00`);
      const end = new Date(`${r.endDate}T12:00:00`);
      const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);
}

// 팀 달력용 — 같은 부서 연차 조회 (callerId로 부서 판별)
export async function getTeamLeaveSummaryByMonth(
  year: number,
  month: number,
  callerId: string,
): Promise<Record<string, TeamLeaveMember[]>> {
  try {
    const response = await fetchAPI(
      API_CONFIG.ENDPOINTS.LEAVES.GET_MONTH_LEAVES(year, month, callerId),
      { method: 'GET' },
    );
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch team leave summary:', error);
    throw new Error('FETCH_TEAM_LEAVES_FAILED');
  }
}
