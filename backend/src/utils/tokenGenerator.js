/**
 * Generate unique order tokens for payment verification
 * Examples: RB-2041, CAF-9182
 */

// Token prefixes for different orders
const TOKEN_PREFIXES = ['RB', 'CAF', 'BRU', 'ESP', 'LAT', 'MOC', 'VOL'];

/**
 * Generate a short unique order token
 * Format: PREFIX-NNNN (e.g., RB-2041)
 * @returns {string} Unique order token
 */
function generateOrderToken() {
  // Select random prefix
  const prefix = TOKEN_PREFIXES[Math.floor(Math.random() * TOKEN_PREFIXES.length)];
  
  // Generate 4-digit random number (1000-9999)
  const number = Math.floor(Math.random() * 9000) + 1000;
  
  return `${prefix}-${number}`;
}

/**
 * Generate a unique token with collision check
 * @param {Function} checkDuplicate - Async function to check if token exists in DB
 * @returns {Promise<string>} Unique order token guaranteed not to exist
 */
async function generateUniqueOrderToken(checkDuplicate) {
  let token;
  let isDuplicate = true;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (isDuplicate && attempts < maxAttempts) {
    token = generateOrderToken();
    isDuplicate = await checkDuplicate(token);
    attempts++;
  }
  
  if (isDuplicate) {
    throw new Error('Failed to generate unique order token after max attempts');
  }
  
  return token;
}

module.exports = {
  generateOrderToken,
  generateUniqueOrderToken,
};
