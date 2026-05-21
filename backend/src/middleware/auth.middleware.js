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

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, is_active, name, email, business_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new AuthenticationError('Profile not found');
    }

    if (!profile.is_active) {
      throw new ForbiddenError('Account suspended');
    }

    req.user = profile;
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