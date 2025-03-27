const bcrypt = require('bcrypt');
const { passwordStrength } = require('check-password-strength');

// Password hashing configuration
const SALT_ROUNDS = 10;

/**
 * Hashes a plain text password
 * @param {string} plainPassword - The plain text password to hash
 * @returns {Promise<string>} - The hashed password
 */
async function hashPassword(plainPassword) {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(plainPassword, salt);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
}

/**
 * Compares a plain text password with a hashed password
 * @param {string} plainPassword - The plain text password to compare
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
async function comparePasswords(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
}

/**
 * Checks password strength
 * @param {string} password - The password to check
 * @returns {Object} - Strength information {value, id, length, contains}
 */
function checkPasswordStrength(password) {
  return passwordStrength(password);
}

/**
 * Generates a random password
 * @param {number} length - Length of password to generate (default: 12)
 * @returns {string} - The generated password
 */
function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

module.exports = {
  hashPassword,
  comparePasswords,
  checkPasswordStrength,
  generateRandomPassword
};
