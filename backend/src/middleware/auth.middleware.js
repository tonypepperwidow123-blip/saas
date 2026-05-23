import { supabaseAdmin } from '../config/supabase.js';
import { AuthenticationError, ForbiddenError } from '../utils/errors.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new AuthenticationError('Invalid token');
    }

    let profile;
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, is_active, name, email, business_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (profileError || !existingProfile) {
      const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      const role = user.user_metadata?.role || 'customer';
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          name,
          email: user.email,
          role,
          avatar_url: avatarUrl,
          is_active: true
        })
        .select('id, role, is_active, name, email, business_name, avatar_url')
        .single();

      if (createError || !newProfile) {
        console.error('Failed to auto-create profile:', createError);
        throw new AuthenticationError('Profile not found');
      }
      profile = newProfile;
    } else {
      profile = existingProfile;
    }

    if (!profile.is_active) {
      throw new ForbiddenError('Account suspended');
    }

    const isGoogle =
      user?.app_metadata?.provider === 'google' ||
      user?.identities?.some((i) => i.provider === 'google');
    const needsOnboarding = isGoogle && !user?.user_metadata?.role_selected;

    req.user = {
      ...profile,
      needsOnboarding: !!needsOnboarding,
    };
    next();
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof ForbiddenError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }
    next();
  };
};