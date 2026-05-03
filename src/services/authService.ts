import { mockAccounts } from '@/src/data/mockAccounts';
import { mockUsers } from '@/src/data/user';
import { User } from '@/src/types';

// TODO: Replace mock validation with real API call when Node.js + Oracle backend is ready
export async function login(email: string, password: string): Promise<User> {
  const account = mockAccounts.find(
    (a) => a.email === email && a.password === password
  );
  if (!account) throw new Error('INVALID_CREDENTIALS');

  const user = mockUsers.find((u) => u.id === account.userId);
  if (!user) throw new Error('USER_NOT_FOUND');

  return user;
}
