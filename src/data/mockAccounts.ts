import { mockUsers } from '@/src/data/user';

export interface MockAccount {
  email: string;
  // WARNING: Plain-text passwords must NEVER be used in production.
  // MVP mock only — replace with hashed credentials when connecting to real API.
  password: string;
  userId: string;
}

// TODO: Remove this file and replace authService.login() with a real API call
export const mockAccounts: MockAccount[] = mockUsers.map((u) => ({
  email: u.email,
  password: '1234',
  userId: u.id,
}));
