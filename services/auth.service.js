import { httpService } from './http.service';
import { API_ENDPOINTS } from '../constants/api';

class AuthService {
  // Login user
  async login(credentials) {
    return await httpService.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  // Logout user
  async logout() {
    return await httpService.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  // Register user
  async register(userData) {
    return await httpService.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  // Get current user session
  async getCurrentSession() {
    try {
      return await httpService.get(API_ENDPOINTS.AUTH.SESSION);
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