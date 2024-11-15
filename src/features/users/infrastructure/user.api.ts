import { api } from 'src/boot/axios';
import type { User } from '../domain/user.model';
import type { UserRepository } from '../domain/user.repository';

export class UserApi implements UserRepository {
  async getUsers(): Promise<User[]> {
    try {
      const response = await api.get('/usuarios');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('No se pudieron obtener los usuarios');
    }
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    try {
      const response = await api.post('/usuarios', user);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('No se pudo crear el usuario');
    }
  }

  async updateUser(user: User): Promise<User> {
    try {
      if (!user.id) {
        throw new Error('ID de usuario requerido para actualizar');
      }
      const response = await api.put(`/usuarios/${user.id}`, user);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('No se pudo actualizar el usuario');
    }
  }
}