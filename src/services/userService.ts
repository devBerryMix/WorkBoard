import { User } from '@/src/types';
import { API_CONFIG, fetchAPI } from '@/src/config/api';

export async function getUser(userId: string, callerId: string): Promise<User> {
  try {
    const response = await fetchAPI(
      API_CONFIG.ENDPOINTS.USERS.GET_USER(userId, callerId),
      { method: 'GET' },
    );
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('FETCH_USER_FAILED');
  }
}

export async function getUsersByDepartment(departmentId: string, callerId: string): Promise<User[]> {
  try {
    const response = await fetchAPI(
      API_CONFIG.ENDPOINTS.USERS.GET_DEPT_USERS(departmentId, callerId),
      { method: 'GET' },
    );
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch department users:', error);
    throw new Error('FETCH_DEPT_USERS_FAILED');
  }
}
