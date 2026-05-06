import { User } from '@/src/types';
import { API_CONFIG, fetchAPI } from '@/src/config/api';

// Login via backend API
export async function login(email: string, password: string): Promise<User> {
  try {
    const response = await fetchAPI(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error('LOGIN_FAILED');
    }

    return data.user as User;
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid email or password') {
      throw new Error('INVALID_CREDENTIALS');
    }
    throw error;
  }
}
