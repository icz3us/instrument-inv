/**
 * User object structure
 * @typedef {Object} User
 * @property {string} id - The unique identifier for the user
 * @property {string} email - The email of the user
 * @property {string} role - The role of the user (admin or employee)
 * @property {string} [created_at] - The creation timestamp
 * @property {string} [updated_at] - The last update timestamp
 */

/**
 * Login request structure
 * @typedef {Object} LoginRequest
 * @property {string} email - The email of the user
 * @property {string} password - The password of the user
 */

/**
 * Register request structure
 * @typedef {Object} RegisterRequest
 * @property {string} email - The email of the user
 * @property {string} password - The password of the user
 * @property {string} role - The role of the user (admin or employee)
 */

/**
 * Session object structure
 * @typedef {Object} Session
 * @property {User} user - The user object
 * @property {string} token - The session token
 * @property {string} expires_at - The expiration timestamp
 */

// Export empty object to make this a valid module
export {};