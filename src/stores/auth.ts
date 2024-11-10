import { defineStore } from 'pinia';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  branch: string;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    branch: 'main'
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(credentials: { username: string; password: string }) {
      // Check for admin credentials
      if (credentials.username === 'admin' && credentials.password === 'admin') {
        this.token = 'admin-token';
        this.user = {
          id: '1',
          name: 'Administrador',
          email: 'admin@example.com',
          avatar: 'https://cdn.quasar.dev/img/avatar.png'
        };
        return true;
      }
      
      // If not admin credentials, throw error
      throw new Error('Credenciales inválidas');
    },

    setBranch(branch: string) {
      this.branch = branch;
    },

    logout() {
      this.user = null;
      this.token = null;
      this.branch = 'main';
    }
  },

  persist: {
    key: 'auth-store',
    paths: ['user', 'token', 'branch']
  }
});