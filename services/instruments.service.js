import { httpService } from './http.service';
import { API_ENDPOINTS } from '../constants/api';

/**
 * @typedef {import('../interfaces/instrument.interface').Instrument} Instrument
 * @typedef {import('../interfaces/instrument.interface').CreateInstrumentRequest} CreateInstrumentRequest
 * @typedef {import('../interfaces/instrument.interface').UpdateInstrumentRequest} UpdateInstrumentRequest
 * @typedef {import('../interfaces/instrument.interface').InstrumentApiResponse} InstrumentApiResponse
 * @typedef {import('../interfaces/instrument.interface').SingleInstrumentApiResponse} SingleInstrumentApiResponse
 */

class InstrumentsService {
  /**
   * Get all instruments
   * @returns {Promise<Instrument[]>}
   */
  async getAllInstruments() {
    const response = await httpService.get(API_ENDPOINTS.INSTRUMENTS);
    return response;
  }

  /**
   * Get instrument by ID
   * @param {string} id - The instrument ID
   * @returns {Promise<Instrument>}
   */
  async getInstrumentById(id) {
    const response = await httpService.get(`${API_ENDPOINTS.INSTRUMENTS}/${id}`);
    return response;
  }

  /**
   * Create a new instrument
   * @param {CreateInstrumentRequest} instrumentData - The instrument data
   * @returns {Promise<Instrument>}
   */
  async createInstrument(instrumentData) {
    const response = await httpService.post(API_ENDPOINTS.INSTRUMENTS, instrumentData);
    return response;
  }

  /**
   * Update an instrument
   * @param {string} id - The instrument ID
   * @param {UpdateInstrumentRequest} instrumentData - The instrument data
   * @returns {Promise<Instrument>}
   */
  async updateInstrument(id, instrumentData) {
    const response = await httpService.put(API_ENDPOINTS.INSTRUMENTS, { id, ...instrumentData });
    return response;
  }

  /**
   * Delete an instrument
   * @param {string} id - The instrument ID
   * @returns {Promise<void>}
   */
  async deleteInstrument(id) {
    await httpService.delete(`${API_ENDPOINTS.INSTRUMENTS}?id=${id}`);
  }
}

// Create and export a singleton instance
export const instrumentsService = new InstrumentsService();