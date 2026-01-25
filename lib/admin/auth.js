/**
 * Admin Authentication Utility
 * Handles admin user authentication and JWT token management
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 * @param {Object} payload - Token payload (user data)
 * @param {string} secret - JWT secret
 * @param {string} expiresIn - Token expiration (default: '24h')
 * @returns {string} JWT token
 */
function generateToken(payload, secret, expiresIn = '24h') {
  if (!secret) {
    throw new Error('JWT secret is required');
  }

  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @param {string} secret - JWT secret
 * @returns {Object|null} Decoded token payload or null if invalid
 */
function verifyToken(token, secret) {
  if (!secret) {
    throw new Error('JWT secret is required');
  }

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

/**
 * Authenticate admin user
 * @param {Object} supabase - Supabase client
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Authentication result
 */
async function authenticateAdmin(supabase, email, password) {
  try {
    // Validate inputs
    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password are required'
      };
    }

    // Find admin user
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Return user data (without password hash)
    const { password_hash, ...userData } = user;

    return {
      success: true,
      user: userData
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create admin user
 * @param {Object} supabase - Supabase client
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
async function createAdminUser(supabase, userData) {
  try {
    // Validate inputs
    if (!userData.email || !userData.password) {
      return {
        success: false,
        error: 'Email and password are required'
      };
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      return {
        success: false,
        error: 'User already exists'
      };
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // Create user
    const { data: user, error: createError } = await supabase
      .from('admin_users')
      .insert({
        email: userData.email,
        password_hash: passwordHash,
        full_name: userData.full_name || null,
        role: userData.role || 'admin',
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Return user data (without password hash)
    const { password_hash, ...userDataResponse } = user;

    return {
      success: true,
      user: userDataResponse
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate API key
 * @param {Object} supabase - Supabase client
 * @param {string} apiKey - API key to validate
 * @returns {Promise<Object>} Validation result
 */
async function validateAPIKey(supabase, apiKey) {
  try {
    if (!apiKey) {
      return {
        valid: false,
        error: 'API key is required'
      };
    }

    // Find admin user with this API key
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('id, email, role, is_active')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      return {
        valid: false,
        error: 'Invalid API key'
      };
    }

    return {
      valid: true,
      user
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  authenticateAdmin,
  createAdminUser,
  validateAPIKey
};
