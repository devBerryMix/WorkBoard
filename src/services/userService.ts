import { User } from '@/src/types';
import { mockUsers } from '@/src/data/user';

export function getUser(): User {
  return mockUsers[0];
}
