const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const userRepository = require('../repositories/user.repository');
const notificationService = require('./notification.service');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');

function toPublicUser(user) {
  const plain = user.toObject ? user.toObject() : { ...user };
  delete plain.password;
  return plain;
}

/**
 * Registers a new pet owner.
 * @param {object} payload
 * @returns {Promise<{ token: string, user: object }>}
 */
async function register(payload) {
  const existingUser = await userRepository.findByEmail(payload.email);
  if (existingUser) {
    throw new AppError('Email already exists.', 409);
  }

  const allowedRoles = ['petOwner', 'vet'];
  const role = allowedRoles.includes(payload.role) ? payload.role : 'petOwner';

  const password = await bcrypt.hash(payload.password, 12);
  const user = await userRepository.create({
    name: payload.name,
    email: payload.email,
    password,
    phone: payload.phone,
    role,
  });

  return { token: generateToken(user), user: toPublicUser(user) };
}

/**
 * Authenticates a user and issues a JWT.
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<{ token: string, user: object }>}
 */
async function login(payload) {
  const user = await userRepository.findByEmail(payload.email, true);
  if (!user) {
    throw new AppError('Incorrect email or password.', 401);
  }

  const isValidPassword = await bcrypt.compare(payload.password, user.password);
  if (!isValidPassword) {
    throw new AppError('Incorrect email or password.', 401);
  }

  return { token: generateToken(user), user: toPublicUser(user) };
}

/**
 * Sends a reset-password email if the account exists.
 * @param {{ email: string }} payload
 * @returns {Promise<{ message: string }>}
 */
async function forgotPassword(payload) {
  const user = await userRepository.findByEmail(payload.email);
  if (user) {
    const token = jwt.sign({ id: user._id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    try {
      await notificationService.sendPasswordResetEmail(user, token);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError.message);
      throw new AppError(
        'We could not send the reset email right now. Please try again in a few minutes.',
        503
      );
    }
  }

  return { message: 'If the email exists, a reset link has been sent.' };
}

/**
 * Resets a user password using a signed token.
 * @param {{ token: string, password: string }} payload
 * @returns {Promise<{ message: string }>}
 */
async function resetPassword(payload) {
  let decoded;
  try {
    decoded = jwt.verify(payload.token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AppError('Invalid or expired reset token.', 401);
  }

  if (decoded.purpose !== 'reset') {
    throw new AppError('Invalid reset token.', 401);
  }

  const password = await bcrypt.hash(payload.password, 12);
  const updatedUser = await userRepository.updateById(decoded.id, { password });
  if (!updatedUser) {
    throw new AppError('User not found.', 404);
  }

  return { message: 'Password reset successful.' };
}

/**
 * Authenticates a user using a Google Identity token.
 * If the user doesn't exist, it creates a new petOwner account.
 * @param {{ credential: string }} payload
 * @returns {Promise<{ token: string, user: object }>}
 */
async function googleLogin(payload) {
  const { credential } = payload;
  
  if (!credential) {
    throw new AppError('Google token is required.', 400);
  }

  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${credential}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info from Google');
    }

    const googleData = await response.json();
    const { email, name, sub: googleId, picture } = googleData;

    // Check if user exists by googleId OR email
    let user = await userRepository.findByEmail(email);

    if (payload.isRegistering && user) {
      throw new AppError('An account with this email already exists. Please sign in instead.', 409);
    }

    if (user) {
      // If user exists but doesn't have googleId linked, update it
      if (!user.googleId) {
        user = await userRepository.updateById(user._id, { 
          googleId, 
          authProvider: 'google',
          profilePhoto: user.profilePhoto || picture 
        });
      }
    } else {
      if (!payload.isRegistering) {
        throw new AppError('No account found with this email. Please sign up first.', 404);
      }
      
      // Create new user (no password)
      user = await userRepository.create({
        name,
        email,
        role: 'petOwner',
        googleId,
        authProvider: 'google',
        profilePhoto: picture,
      });
    }

    return { token: generateToken(user), user: toPublicUser(user) };
  } catch (error) {
    console.error('Google Auth Error:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to authenticate with Google.', 401);
  }
}

module.exports = { register, login, forgotPassword, resetPassword, googleLogin };