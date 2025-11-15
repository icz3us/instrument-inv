/**
 * Instrument object structure
 * @typedef {Object} Instrument
 * @property {string} id - The unique identifier for the instrument
 * @property {string} name - The name of the instrument
 * @property {string} description - The description of the instrument
 * @property {number} quantity - The quantity of the instrument
 * @property {string} category - The category of the instrument
 * @property {'available'|'checked_out'|'maintenance'} status - The status of the instrument
 * @property {string} [created_at] - The creation timestamp
 * @property {string} [updated_at] - The last update timestamp
 */

/**
 * Instrument creation request structure
 * @typedef {Object} CreateInstrumentRequest
 * @property {string} name - The name of the instrument
 * @property {string} description - The description of the instrument
 * @property {number} quantity - The quantity of the instrument
 * @property {string} category - The category of the instrument
 * @property {'available'|'checked_out'|'maintenance'} [status] - The status of the instrument
 */

/**
 * Instrument update request structure
 * @typedef {Object} UpdateInstrumentRequest
 * @property {string} id - The unique identifier for the instrument
 * @property {string} [name] - The name of the instrument
 * @property {string} [description] - The description of the instrument
 * @property {number} [quantity] - The quantity of the instrument
 * @property {string} [category] - The category of the instrument
 * @property {'available'|'checked_out'|'maintenance'} [status] - The status of the instrument
 */

// Export empty object to make this a valid module
export {};