import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';
import { success, error } from '../utils/apiResponse.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { getSignedDownloadUrl } from '../services/storage.service.js';
import * as licenseService from '../services/license.service.js';

const DOWNLOAD_TOKEN_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DOWNLOAD_TOKEN_EXPIRY = '5m';
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

export const checkUpdate = async (req, res) => {
  try {
    const { license_key, plugin_slug, current_version } = req.query;

    // Find the license
    const { data: license, error: licenseError } = await supabaseAdmin
      .from('licenses')
      .select(`
        id, license_key, status, expiry_date,
        plugin:plugins(id, name, slug, current_version, status)
      `)
      .eq('license_key', license_key)
      .single();

    if (licenseError || !license) {
      return error(res, 'Invalid license key', 403);
    }

    if (license.plugin.slug !== plugin_slug) {
      return error(res, 'License does not match this plugin', 403);
    }

    if (license.status !== 'active') {
      return error(res, `License is ${license.status}`, 403);
    }

    if (license.expiry_date && new Date(license.expiry_date) < new Date()) {
      return error(res, 'License has expired', 403);
    }

    if (license.plugin.status !== 'approved') {
      return error(res, 'Plugin is not available', 403);
    }

    // Compare versions
    const latestVersion = license.plugin.current_version;
    const needsUpdate = compareVersions(latestVersion, current_version) > 0;

    if (!needsUpdate) {
      return success(res, { update_available: false });
    }

    // Get changelog from latest version
    const { data: versionData } = await supabaseAdmin
      .from('plugin_versions')
      .select('version, changelog, zip_path')
      .eq('plugin_id', license.plugin.id)
      .eq('is_latest', true)
      .single();

    // Generate download token
    const downloadToken = jwt.sign(
      {
        license_id: license.id,
        plugin_id: license.plugin.id,
        zip_path: versionData?.zip_path,
        exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes
      },
      DOWNLOAD_TOKEN_SECRET
    );

    return success(res, {
      update_available: true,
      new_version: latestVersion,
      changelog: versionData?.changelog || '',
      download_url: `${BACKEND_URL}/api/wp/download?token=${downloadToken}`,
    });
  } catch (err) {
    console.error('Check update error:', err);
    return error(res, 'Failed to check for updates');
  }
};

export const downloadUpdate = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return error(res, 'Download token required');
    }

    // Verify token
    const decoded = jwt.verify(token, DOWNLOAD_TOKEN_SECRET);

    if (!decoded.zip_path) {
      return error(res, 'Invalid download token');
    }

    // Generate signed URL (60 seconds)
    const signedUrl = await getSignedDownloadUrl(decoded.zip_path, 60);

    // Redirect to the signed URL
    return res.redirect(307, signedUrl);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Download link has expired', 410);
    }
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'Invalid download token', 401);
    }
    console.error('Download update error:', err);
    return error(res, 'Failed to generate download link');
  }
};

// Legacy endpoint - kept for backward compatibility
export const downloadPlugin = async (req, res) => {
  // Also handle 'license' param for backward compatibility
  const token = req.query.token || req.query.license;

  if (!token) {
    return error(res, 'Download token required');
  }

  // Verify token - it could be a license key or a JWT token
  let decoded;
  try {
    decoded = jwt.verify(token, DOWNLOAD_TOKEN_SECRET);
  } catch (err) {
    // If JWT verification fails, treat as license key and find the path
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      const { data: license } = await supabaseAdmin
        .from('licenses')
        .select(`
          id, status, expiry_date,
          plugin:plugins(id, current_version)
        `)
        .eq('license_key', token)
        .single();

      if (!license || license.status !== 'active') {
        return error(res, 'Invalid or inactive license', 403);
      }

      const { data: versionData } = await supabaseAdmin
        .from('plugin_versions')
        .select('zip_path')
        .eq('plugin_id', license.plugin.id)
        .eq('is_latest', true)
        .single();

      if (!versionData) {
        return error(res, 'Plugin version not found', 404);
      }

      const signedUrl = await getSignedDownloadUrl(versionData.zip_path, 60);
      return res.redirect(307, signedUrl);
    }
    return error(res, 'Invalid download token', 401);
  }

  if (!decoded.zip_path) {
    return error(res, 'Invalid download token');
  }

  // Generate signed URL (60 seconds)
  const signedUrl = await getSignedDownloadUrl(decoded.zip_path, 60);

  // Redirect to the signed URL
  return res.redirect(307, signedUrl);
};

export const activate = async (req, res) => {
  try {
    const { license_key, activation_code, site_url, plugin_slug, plugin_version } = req.body;

    // Verify the license belongs to this plugin
    const { data: license } = await supabaseAdmin
      .from('licenses')
      .select(`
        id, license_key, activation_code, activation_code_used, status, expiry_date,
        plugin:plugins(slug, status)
      `)
      .eq('license_key', license_key)
      .single();

    if (!license) {
      return error(res, 'Invalid license key', 403);
    }

    // Removed strict slug matching. The license_key and activation_code are cryptographically
    // secure and unique. If a user renames the plugin zip, the injected slug might differ from
    // the DB slug, causing unnecessary 403 errors.

    // Validate activation code (one-time use)
    if (!license.activation_code) {
      return error(res, 'This license requires an activation code. Please contact support.', 403);
    }

    if (license.activation_code !== activation_code) {
      return error(res, 'Invalid activation code', 403);
    }

    if (license.activation_code_used) {
      return error(res, 'This activation code has already been used. Each code can only be activated once.', 403);
    }

    // Check license status
    if (license.status !== 'active') {
      return error(res, `License is ${license.status}`, 403);
    }

    if (license.expiry_date && new Date(license.expiry_date) < new Date()) {
      return error(res, 'License has expired', 403);
    }

    const activation = await licenseService.activateLicense(
      license_key,
      activation_code,
      site_url,
      plugin_version
    );

    return success(res, {
      is_valid: true,
      message: 'License activated successfully! Your plugin is now licensed and ready to use.',
      activation_id: activation.id,
      site_url: activation.site_url,
      download_url: `${BACKEND_URL}/api/wp/download?license=${license_key}`,
    });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Activate error:', err);
    return error(res, err.message || 'Failed to activate license');
  }
};

export const deactivate = async (req, res) => {
  try {
    const { license_key, site_url } = req.body;

    const deactivation = await licenseService.deactivateLicense(license_key, site_url);

    return success(res, {
      message: 'License deactivated successfully',
      site_url: deactivation.site_url,
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Deactivate error:', err);
    return error(res, err.message || 'Failed to deactivate license');
  }
};

export const validateLicense = async (req, res) => {
  try {
    const { license_key, site_url, plugin_slug } = req.query;

    const { data: license, error: licenseError } = await supabaseAdmin
      .from('licenses')
      .select(`
        id, status, expiry_date, activation_limit,
        plugin:plugins(slug, status)
      `)
      .eq('license_key', license_key)
      .single();

    if (licenseError || !license) {
      return success(res, {
        is_valid: false,
        reason: 'Invalid license key',
      });
    }

    if (license.plugin.slug !== plugin_slug) {
      return success(res, {
        is_valid: false,
        reason: 'License does not match this plugin',
      });
    }

    if (license.status !== 'active') {
      return success(res, {
        is_valid: false,
        reason: `License is ${license.status}`,
      });
    }

    if (license.expiry_date && new Date(license.expiry_date) < new Date()) {
      return success(res, {
        is_valid: false,
        reason: 'License has expired',
      });
    }

    if (license.plugin.status !== 'approved') {
      return success(res, {
        is_valid: false,
        reason: 'Plugin is not available',
      });
    }

    // Check activation count
    const { count: activationCount } = await supabaseAdmin
      .from('activations')
      .select('id', { count: 'exact', head: true })
      .eq('license_id', license.id)
      .eq('is_active', true);

    if (activationCount >= license.activation_limit) {
      return success(res, {
        is_valid: false,
        reason: 'Activation limit reached',
      });
    }

    // If site_url provided, check if it's activated
    if (site_url) {
      const { data: existingActivation } = await supabaseAdmin
        .from('activations')
        .select('id, is_active')
        .eq('license_id', license.id)
        .eq('site_url', site_url)
        .single();

      return success(res, {
        is_valid: true,
        activated: existingActivation?.is_active || false,
        activations_remaining: license.activation_limit - activationCount,
      });
    }

    return success(res, {
      is_valid: true,
      activations_remaining: license.activation_limit - activationCount,
    });
  } catch (err) {
    console.error('Validate license error:', err);
    return error(res, 'Failed to validate license');
  }
};

function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}