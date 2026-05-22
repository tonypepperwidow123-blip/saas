import { supabaseAdmin, supabaseClient } from '../config/supabase.js';
import { success, error } from '../utils/apiResponse.js';
import { AuthenticationError, ConflictError, ValidationError } from '../utils/errors.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, business_name } = req.body;

    // Check if email already exists in profiles
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Create the auth user using the admin API (service role can do this)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,          // auto-confirm so user can log in immediately
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

    // The on_auth_user_created trigger should create the profile automatically.
    // As a safety net, insert it here if it doesn't exist yet.
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', authUser.user.id)
      .single();

    if (!existingProfile) {
      await supabaseAdmin.from('profiles').insert({
        id: authUser.user.id,
        name,
        email,
        role: role || 'customer',
        business_name: business_name || null,
        is_active: true,
      });
    }

    return success(res, {
      message: 'Registration successful. You can now sign in.',
      user_id: authUser.user.id,
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

    // IMPORTANT: signInWithPassword MUST use the anon key client (supabaseClient),
    // NOT the service role client. The service role client cannot sign in users.
    const { data: authData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !authData?.session) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Fetch the user's profile from our public.profiles table
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, role, business_name, avatar_url, is_active')
      .eq('id', authData.user.id)
      .single();

    // Auto-create profile if the trigger failed (safety net)
    if (profileError || !profile) {
      const name = authData.user.user_metadata?.name || authData.user.email.split('@')[0];
      const role = authData.user.user_metadata?.role || 'customer';

      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          name,
          email: authData.user.email,
          role,
          is_active: true,
        })
        .select('id, name, email, role, business_name, avatar_url, is_active')
        .single();

      if (createError || !newProfile) {
        console.error('Login: failed to auto-create profile:', createError);
        throw new AuthenticationError('Profile not found. Please contact support.');
      }
      profile = newProfile;
    }

    if (!profile.is_active) {
      throw new AuthenticationError('Your account has been suspended. Please contact support.');
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
  // req.user is set by the protect middleware after validating the token
  return success(res, { user: req.user });
};

export const logout = async (req, res) => {
  // The actual Supabase session is managed on the frontend (supabase.auth.signOut()).
  // The backend just acknowledges the logout request.
  return success(res, { message: 'Logged out successfully' });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
    });

    // Always return success to prevent email enumeration attacks
    return success(res, {
      message: 'If that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    // Return success regardless to prevent enumeration
    return success(res, {
      message: 'If that email exists, a password reset link has been sent.',
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new ValidationError('Refresh token is required');
    }

    const { data: sessionData, error: refreshError } = await supabaseClient.auth.refreshSession({
      refresh_token,
    });

    if (refreshError || !sessionData?.session) {
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