import api, { USE_MOCK } from './api';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../models';
import { mockUsers, getUserByEmail, getCustomerByUserId } from '../data/mockData';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock JWT token generator
const generateMockToken = (user: User): string => {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  return btoa(JSON.stringify(payload));
};

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await delay(500); // Simulate network delay

      const user = getUserByEmail(credentials.email);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // In mock mode, any password "password123" works
      if (credentials.password !== 'password123') {
        throw new Error('Contraseña incorrecta');
      }

      if (!user.enabled) {
        throw new Error('Cuenta deshabilitada');
      }

      const token = generateMockToken(user);

      return {
        token,
        refreshToken: `refresh-${token}`,
        user,
        expiresIn: 86400,
      };
    }

    const response = await api.post<AuthResponse>('/security/login', credentials);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await delay(800);

      // Check if email already exists
      const existingUser = getUserByEmail(data.email);
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Create new user (in mock, this doesn't persist)
      const newUser: User = {
        id: mockUsers.length + 1,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'CUSTOMER',
        enabled: true,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      };

      const token = generateMockToken(newUser);

      return {
        token,
        refreshToken: `refresh-${token}`,
        user: newUser,
        expiresIn: 86400,
      };
    }

    const response = await api.post<AuthResponse>('/security/register', data);
    return response.data;
  },

  validateToken: async (): Promise<User> => {
    if (USE_MOCK) {
      await delay(200);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      try {
        const payload = JSON.parse(atob(token));
        if (payload.exp < Date.now()) {
          throw new Error('Token expired');
        }

        const user = mockUsers.find(u => u.id === payload.sub);
        if (!user) {
          throw new Error('User not found');
        }

        return user;
      } catch {
        throw new Error('Invalid token');
      }
    }

    const response = await api.get<User>('/security/validate');
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    if (USE_MOCK) {
      await delay(200);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const payload = JSON.parse(atob(token));
      const user = mockUsers.find(u => u.id === payload.sub);

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    }

    const response = await api.get<User>('/security/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    if (USE_MOCK) {
      await delay(200);
      return;
    }

    await api.post('/security/logout');
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await delay(300);
      throw new Error('Refresh not implemented in mock mode');
    }

    const response = await api.post<AuthResponse>('/security/refresh', { refreshToken });
    return response.data;
  },
};

export default authService;
