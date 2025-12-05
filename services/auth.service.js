import { httpService } from './http.service';
import { API_ENDPOINTS } from '../constants/api';

/**
 * @typedef {import('../interfaces/auth.interface').LoginRequest} LoginRequest
 * @typedef {import('../interfaces/auth.interface').RegisterRequest} RegisterRequest
 * @typedef {import('../interfaces/auth.interface').AuthApiResponse} AuthApiResponse
 */

class AuthService {
  /**
   * Login user
   * @param {LoginRequest} credentials - The login credentials
   * @returns {Promise<AuthApiResponse>}
   */
  async login(credentials) {
    const response = await httpService.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response;
  }

  /**
   * Logout user
   * @returns {Promise<AuthApiResponse>}
   */
  async logout() {
    const response = await httpService.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response;
  }

  /**
   * Register user
   * @param {RegisterRequest} userData - The user data
   * @returns {Promise<AuthApiResponse>}
   */
  async register(userData) {
    const response = await httpService.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response;
  }

  /**
   * Get current user session
   * @returns {Promise<AuthApiResponse|null>}
   */
  async getCurrentSession() {
    try {
      const response = await httpService.get(API_ENDPOINTS.AUTH.SESSION);
      return response;
    } catch (error) {
      // If we get a 401, it means there's no active session, which is not an error
      if (error.message.includes('401')) {
        return null;
      }
      throw error;
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();