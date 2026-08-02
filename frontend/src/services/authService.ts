import { apiClient } from '../api/client';
import { User, UserAuthResponse, UserCreate, UserLogin } from '../api/types';

export const authService = {
  /**
   * Register a new user account.
   */
  async register(data: UserCreate): Promise<UserAuthResponse> {
    return apiClient<UserAuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Log in user with email and password.
   */
  async login(credentials: UserLogin): Promise<UserAuthResponse> {
    return apiClient<UserAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Log out current user and clear HTTP-Only cookie.
   */
  async logout(): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Retrieve currently authenticated user profile.
   */
  async getMe(): Promise<User> {
    return apiClient<User>('/users/me', {
      method: 'GET',
    });
  },
};
