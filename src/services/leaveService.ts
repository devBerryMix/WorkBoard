import { LeaveRequest, TeamLeaveMember } from '@/src/types';
import { API_CONFIG, fetchAPI } from '@/src/config/api';

// Get user's leave requests from backend API
export async function getLeaveRequests(userId: string = '1'): Promise<LeaveRequest[]> {
  try {
    const response = await fetchAPI(API_CONFIG.ENDPOINTS.LEAVES.GET_USER_LEAVES(userId), {
      method: 'GET',
    });

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch leave requests:', error);
    throw new Error('FETCH_LEAVES_FAILED');
  }
}

// Submit a new leave request to backend API
export async function submitLeave(
  startDate: string,
  endDate: string,
  reason: string,
  userId: string = '1',
): Promise<LeaveRequest> {
  try {
    const response = await fetchAPI(API_CONFIG.ENDPOINTS.LEAVES.CREATE_LEAVE, {
      method: 'POST',
      body: JSON.stringify({
        userId,
        startDate,
        endDate,
        reason,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Failed to submit leave request:', error);
    throw new Error('SUBMIT_LEAVE_FAILED');
  }
}

// Calculate used leave days from approved leave requests
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

// Get pending leave requests (for admin dashboard)
// Note: Currently not implemented on backend - MVP only includes user leave requests
export function getPendingLeaveRequests(): LeaveRequest[] {
  console.warn('getPendingLeaveRequests: Not yet implemented on backend');
  return [];
}

// Process leave request (for admin dashboard)
// Note: Currently not implemented on backend - MVP only includes user submission
export function processLeave(id: string, action: 'approved' | 'rejected'): void {
  console.warn('processLeave: Not yet implemented on backend');
}

// Get team members on leave for a specific month from backend API
export async function getTeamLeaveSummaryByMonth(
  year: number,
  month: number,
): Promise<Record<string, TeamLeaveMember[]>> {
  try {
    const response = await fetchAPI(
      API_CONFIG.ENDPOINTS.LEAVES.GET_MONTH_LEAVES(year, month),
      {
        method: 'GET',
      },
    );

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch team leave summary:', error);
    throw new Error('FETCH_TEAM_LEAVES_FAILED');
  }
}
