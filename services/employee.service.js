import { HTTP_METHODS } from '../constants/api';
import { httpService } from './http.service';

class EmployeeService {
  /**
   * Submit a borrow request
   * @param {Object} requestData - The borrow request data
   * @returns {Promise<Object>} - The created borrow request
   */
  async submitBorrowRequest(requestData) {
    try {
      const response = await fetch('/api/borrow-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to submit borrow request: ${result.error || 'Unknown error'}`);
      }
      
      return result;
    } catch (error) {
      console.error('Error submitting borrow request:', error);
      throw error;
    }
  }

  /**
   * Get user's borrow requests
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of borrow requests
   */
  async getBorrowRequests(userId) {
    try {
      const response = await fetch(`/api/borrow-requests`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to fetch borrow requests: ${data.error || 'Unknown error'}`);
      }
      
      // Filter by user ID on the client side since the API returns all requests
      const userRequests = data.filter(request => request.user_id === userId);
      return userRequests || [];
    } catch (error) {
      console.error('Error fetching borrow requests:', error);
      throw error;
    }
  }

  /**
   * Get user's active loans
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of active loans
   */
  async getActiveLoans(userId) {
    try {
      const response = await fetch(`/api/borrow-requests`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to fetch active loans: ${data.error || 'Unknown error'}`);
      }
      
      // Filter by user ID and status on the client side
      const activeLoans = data.filter(request => 
        request.user_id === userId && request.status === 'approved'
      );
      return activeLoans || [];
    } catch (error) {
      console.error('Error fetching active loans:', error);
      throw error;
    }
  }

  /**
   * Return an instrument
   * @param {string} requestId - The borrow request ID
   * @returns {Promise<Object>} - The updated borrow request
   */
  async returnInstrument(requestId) {
    try {
      const response = await fetch('/api/borrow-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          status: 'returned'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to return instrument: ${data.error || 'Unknown error'}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error returning instrument:', error);
      throw error;
    }
  }

  /**
   * Report instrument condition
   * @param {Object} conditionData - The condition report data
   * @returns {Promise<Object>} - The created condition report
   */
  async reportCondition(conditionData) {
    try {
      // Insert condition report
      const response = await fetch('/api/instrument-conditions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conditionData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to report condition: ${result.error || 'Unknown error'}`);
      }
      
      return result;
    } catch (error) {
      console.error('Error reporting condition:', error);
      throw error;
    }
  }

  /**
   * Get instrument conditions
   * @param {string} instrumentId - The instrument ID
   * @returns {Promise<Array>} - Array of condition reports
   */
  async getInstrumentConditions(instrumentId) {
    try {
      const response = await fetch(`/api/instrument-conditions`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to fetch instrument conditions: ${data.error || 'Unknown error'}`);
      }
      
      // Filter by instrument ID on the client side
      const instrumentConditions = data
        .filter(condition => condition.instrument_id === instrumentId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return instrumentConditions || [];
    } catch (error) {
      console.error('Error fetching instrument conditions:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of notifications
   */
  async getNotifications(userId) {
    try {
      const response = await fetch(`/api/activity-logs`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${data.error || 'Unknown error'}`);
      }
      
      // Filter by user ID on the client side and limit to 20
      const userNotifications = data
        .filter(notification => notification.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 20);
      
      return userNotifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Create a notification
   * @param {Object} notificationData - The notification data
   * @returns {Promise<Object>} - The created notification
   */
  async createNotification(notificationData) {
    try {
      const response = await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to create notification: ${result.error || 'Unknown error'}`);
      }
      
      return result;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get maintenance logs for an instrument
   * @param {string} instrumentId - The instrument ID
   * @returns {Promise<Array>} - Array of maintenance logs
   */
  async getMaintenanceLogs(instrumentId) {
    try {
      const response = await fetch(`/api/maintenance-logs`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to fetch maintenance logs: ${data.error || 'Unknown error'}`);
      }
      
      // Filter by instrument ID on the client side
      const instrumentMaintenance = data
        .filter(log => log.instrument_id === instrumentId)
        .sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date));
      
      return instrumentMaintenance || [];
    } catch (error) {
      console.error('Error fetching maintenance logs:', error);
      throw error;
    }
  }

  /**
   * Get real-time instrument availability
   * @param {string} instrumentId - The instrument ID
   * @returns {Promise<Object>} - The instrument with availability info
   */
  async getInstrumentAvailability(instrumentId) {
    try {
      const response = await fetch(`/api/instruments`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to fetch instrument availability: ${data.error || 'Unknown error'}`);
      }
      
      // Find the specific instrument
      const instrument = data.find(i => i.id === instrumentId);
      
      if (!instrument) {
        throw new Error('Instrument not found');
      }
      
      return instrument;
    } catch (error) {
      console.error('Error fetching instrument availability:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const employeeService = new EmployeeService();