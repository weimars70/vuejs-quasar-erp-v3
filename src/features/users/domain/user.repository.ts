import type { User } from './user.model';

export interface UserRepository {
  getUsers(): Promise<User[]>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
  updateUser(user: User): Promise<User>;
}