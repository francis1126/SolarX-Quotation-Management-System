import { authStorage } from './localStorageService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const user = await authStorage.login(credentials.email, credentials.password);
    return {
      token: `local-${user._id}`,
      user,
    };
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const user = await authStorage.register(credentials);
    return {
      token: `local-${user._id}`,
      user,
    };
  },

  logout: () => {
    authStorage.logout();
  },

  isAuthenticated: (): boolean => {
    return authStorage.isAuthenticated();
  },

  getCurrentUser: () => {
    return authStorage.getCurrentUser();
  },
};
