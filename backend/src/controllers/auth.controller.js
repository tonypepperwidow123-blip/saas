import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { success, error } from '../utils/apiResponse.js';
import { AuthenticationError, ConflictError, ValidationError } from '../utils/errors.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, business_name } = req.body;

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        business_name: business_name || null,
      },
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        throw new ConflictError('Email already registered');
      }
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    return success(res, {
      message: 'Registration successful',
      user_id: authUser.id,
    }, 201);
  } catch (err) {
    if (err instanceof ConflictError || err instanceof ValidationError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Register error:', err);
    return error(res, err.message || 'Registration failed');
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: authData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw new AuthenticationError('Invalid email or password');
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, role, business_name, avatar_url, is_active')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      throw new AuthenticationError('Profile not found. Please contact support.');
    }

    if (!profile.is_active) {
      throw new AuthenticationError('Account has been suspended');
    }

    return success(res, {
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        business_name: profile.business_name,
        avatar_url: profile.avatar_url,
      },
      token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
    });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Login error:', err);
    return error(res, err.message || 'Login failed');
  }
};

export const me = async (req, res) => {
  try {
    return success(res, { user: req.user });
  } catch (err) {
    console.error('Me error:', err);
    return error(res, 'Failed to fetch user');
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      await supabaseAdmin.auth.signOut();
    }

    return success(res, { message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return error(res, 'Logout failed');
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
    });

    // Always return success to prevent email enumeration
    return success(res, {
      message: 'If the email exists, a password reset link has been sent',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return success(res, {
      message: 'If the email exists, a password reset link has been sent',
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new ValidationError('Refresh token is required');
    }

    const { data: sessionData, error: refreshError } = await supabaseAdmin.auth.admin.refreshSession({
      refresh_token,
    });

    if (refreshError || !sessionData) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    return success(res, {
      token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof AuthenticationError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Refresh token error:', err);
    return error(res, 'Token refresh failed');
  }
};