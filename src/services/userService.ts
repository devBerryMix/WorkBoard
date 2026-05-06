import { User } from '@/src/types';
import { API_CONFIG, fetchAPI } from '@/src/config/api';

// Get user information from backend API
export async function getUser(userId: string = '1'): Promise<User> {
  try {
    const response = await fetchAPI(API_CONFIG.ENDPOINTS.USERS.GET_USER(userId), {
      method: 'GET',
    });

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('FETCH_USER_FAILED');
  }
}
