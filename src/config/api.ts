// Backend API Configuration
// - Android emulator: 10.0.2.2 maps to host machine's localhost
// - Physical device via Expo Go: extract host IP from Expo's metro server URI
// - iOS simulator / Web fallback: localhost

import { Platform } from 'react-native';
import Constants from 'expo-constants';

function getBaseUrl(): string {
  // Prioritize Expo Go's metro server URI — works for both emulator and real device
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest?.debuggerHost ??
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const host = (hostUri as string).split(':')[0];
    console.log('[API] Resolved base URL host:', host);
    return `http://${host}:3000`;
  }

  // Fallback: Android emulator when hostUri is unavailable
  if (Platform.OS === 'android') {
    console.log('[API] Falling back to Android emulator address');
    return 'http://10.0.2.2:3000';
  }

  console.log('[API] Falling back to localhost');
  return 'http://localhost:3000';
}

const API_BASE_URL = getBaseUrl();
console.log('[API] BASE_URL:', API_BASE_URL);

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
    ATTENDANCE: {
      GET_USER: (userId: string, year: number, month: number) =>
        `${API_BASE_URL}/api/attendance/user/${userId}?requesterId=${userId}&year=${year}&month=${String(month).padStart(2, '0')}`,
      CHECKIN: `${API_BASE_URL}/api/attendance/checkin`,
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('NETWORK_TIMEOUT');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
