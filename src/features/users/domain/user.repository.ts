import type { User } from './user.model';

export interface UserRepository {
  getUsers(filters?: Record<string, string>): Promise<User[]>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
  updateUser(user: User): Promise<User>;
}