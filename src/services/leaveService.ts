import { LeaveRequest, TeamLeaveMember } from '@/src/types';
import { mockLeaveRequests } from '@/src/data/leaves';
import { mockUsers } from '@/src/data/user';

const leaveRequests: LeaveRequest[] = [...mockLeaveRequests];

export function getLeaveRequests(userId: string = '1'): LeaveRequest[] {
  return leaveRequests.filter(r => r.userId === userId);
}

export function submitLeave(
  startDate: string,
  endDate: string,
  reason: string,
  userId: string = '1',
): LeaveRequest {
  const newRequest: LeaveRequest = {
    id: String(Date.now()),
    userId,
    startDate,
    endDate,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString().slice(0, 10),
  };
  leaveRequests.push(newRequest);
  return newRequest;
}

export function getUsedLeaveDays(userId: string = '1'): number {
  return leaveRequests
    .filter(r => r.userId === userId && r.status === 'approved')
    .reduce((total, r) => {
      const start = new Date(`${r.startDate}T12:00:00`);
      const end = new Date(`${r.endDate}T12:00:00`);
      const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);
}

// Returns a map of dateStr -> team members on approved leave
export function getTeamLeaveSummaryByMonth(
  year: number,
  month: number,
): Record<string, TeamLeaveMember[]> {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const result: Record<string, TeamLeaveMember[]> = {};

  leaveRequests
    .filter(r => r.status === 'approved')
    .forEach(r => {
      const start = new Date(`${r.startDate}T12:00:00`);
      const end = new Date(`${r.endDate}T12:00:00`);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;

        if (!dateStr.startsWith(prefix)) continue;

        const user = mockUsers.find(u => u.id === r.userId);
        if (!user) continue;

        if (!result[dateStr]) result[dateStr] = [];
        result[dateStr].push({
          userId: user.id,
          name: user.name,
          department: user.department,
        });
      }
    });

  return result;
}
