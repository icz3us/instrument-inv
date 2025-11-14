import { httpService } from './http.service';
import { API_ENDPOINTS } from '../constants/api';

class InstrumentsService {
  // Get all instruments
  async getAllInstruments() {
    return await httpService.get(API_ENDPOINTS.INSTRUMENTS);
  }

  // Get instrument by ID
  async getInstrumentById(id) {
    return await httpService.get(`${API_ENDPOINTS.INSTRUMENTS}/${id}`);
  }

  // Create a new instrument
  async createInstrument(instrumentData) {
    return await httpService.post(API_ENDPOINTS.INSTRUMENTS, instrumentData);
  }

  // Update an instrument
  async updateInstrument(id, instrumentData) {
    return await httpService.put(API_ENDPOINTS.INSTRUMENTS, { id, ...instrumentData });
  }

  // Delete an instrument
  async deleteInstrument(id) {
    return await httpService.delete(`${API_ENDPOINTS.INSTRUMENTS}?id=${id}`);
  }
}

// Create and export a singleton instance
export const instrumentsService = new InstrumentsService();