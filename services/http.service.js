import { API_ENDPOINTS, HTTP_METHODS, DEFAULT_FETCH_OPTIONS } from '../constants/api';

class HttpService {
  constructor() {
    this.baseURL = '';
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  }

  // Generic fetch method
  async fetch(url, options = {}) {
    const config = {
      ...DEFAULT_FETCH_OPTIONS,
      ...options,
      headers: {
        ...DEFAULT_FETCH_OPTIONS.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${url}`, config);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  // GET request
  async get(url, options = {}) {
    return this.fetch(url, {
      method: HTTP_METHODS.GET,
      ...options
    });
  }

  // POST request
  async post(url, data, options = {}) {
    return this.fetch(url, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
      ...options
    });
  }

  // PUT request
  async put(url, data, options = {}) {
    return this.fetch(url, {
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(data),
      ...options
    });
  }

  // DELETE request
  async delete(url, options = {}) {
    return this.fetch(url, {
      method: HTTP_METHODS.DELETE,
      ...options
    });
  }

  // PATCH request
  async patch(url, data, options = {}) {
    return this.fetch(url, {
      method: HTTP_METHODS.PATCH,
      body: JSON.stringify(data),
      ...options
    });
  }
}

// Create and export a singleton instance
export const httpService = new HttpService();