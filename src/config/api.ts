// Backend API Configuration
// Android emulator: use 10.0.2.2 instead of localhost
// iOS simulator & Web: use localhost

import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'
  : 'http://localhost:3000';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: `${API_BASE_URL}/api/auth/login`,
    },
    USERS: {
      GET_USER: (userId: string, callerId: string) =>
        `${API_BASE_URL}/api/users/${userId}?requesterId=${callerId}`,
      LIST_ALL: (callerId: string) =>
        `${API_BASE_URL}/api/users?requesterId=${callerId}`,
      GET_DEPT_USERS: (departmentId: string, callerId: string) =>
        `${API_BASE_URL}/api/users/department/${departmentId}?requesterId=${callerId}`,
    },
    LEAVES: {
      GET_ALL: (callerId: string) =>
        `${API_BASE_URL}/api/leaves?requesterId=${callerId}`,
      GET_USER_LEAVES: (userId: string) =>
        `${API_BASE_URL}/api/leaves/user/${userId}?requesterId=${userId}`,
      GET_MONTH_LEAVES: (year: number, month: number, callerId: string, targetDeptId?: string) => {
        const base = `${API_BASE_URL}/api/leaves/month/${year}/${String(month).padStart(2, '0')}?requesterId=${callerId}`;
        return targetDeptId ? `${base}&targetDepartmentId=${targetDeptId}` : base;
      },
      CREATE_LEAVE: `${API_BASE_URL}/api/leaves`,
      GET_PENDING: (callerId: string) =>
        `${API_BASE_URL}/api/leaves/pending?requesterId=${callerId}`,
      UPDATE_STATUS: (leaveId: string) =>
        `${API_BASE_URL}/api/leaves/${leaveId}/status`,
    },
  },
};

export async function fetchAPI(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response;
}
