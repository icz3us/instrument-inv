/**
 * User Management Service
 * This service handles user and role management for the admin dashboard
 */

class UserManagementService {
  /**
   * Get all users
   * @returns {Promise<Array>} - Array of users
   */
  async getAllUsers() {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user
   */
  async createUser(userData) {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user role
   * @param {string} userId - User ID
   * @param {string} newRole - New role
   * @returns {Promise<Object>} - Updated user
   */
  async updateUserRole(userId, newRole) {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteUser(userId) {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        return true;
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  /**
   * Log user activity
   * @param {Object} activityData - Activity data
   * @returns {Promise<Object>} - Created activity log
   */
  async logActivity(activityData) {
    try {
      const response = await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to log activity');
      }
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  }

  /**
   * Get activity logs
   * @returns {Promise<Array>} - Array of activity logs
   */
  async getActivityLogs() {
    try {
      const response = await fetch('/api/activity-logs');
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch activity logs');
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  }
}

// Create and export a singleton instance
export const userManagementService = new UserManagementService();