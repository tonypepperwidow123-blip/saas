import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { generateLicenseKey } from '../utils/licenseKey.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors.js';

// Generate a cryptographically secure one-time activation code
const generateActivationCode = () => {
  // Generate 16 characters using crypto.randomBytes (more secure than Math.random)
  return crypto.randomBytes(12).toString('hex').toUpperCase();
};

export const createLicense = async (pluginId, customerId, activationLimit = 1, expiryDate = null) => {
  const licenseKey = generateLicenseKey();
  const activationCode = generateActivationCode();

  const { data: license, error } = await supabaseAdmin
    .from('licenses')
    .insert({
      plugin_id: pluginId,
      customer_id: customerId,
      license_key: licenseKey,
      activation_code: activationCode, // One-time code for WordPress activation
      activation_limit: activationLimit,
      expiry_date: expiryDate,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new ConflictError('License key already exists');
    }
    throw new Error(`Failed to create license: ${error.message}`);
  }

  return license;
};

export const getLicenseByKey = async (licenseKey) => {
  const { data: license, error } = await supabaseAdmin
    .from('licenses')
    .select(`
      *,
      plugin:plugins(*),
      customer:profiles!customer_id(*)
    `)
    .eq('license_key', licenseKey)
    .single();

  if (error || !license) {
    throw new NotFoundError('License not found');
  }

  return license;
};

export const getLicensesByCustomer = async (customerId) => {
  const { data: licenses, error } = await supabaseAdmin
    .from('licenses')
    .select(`
      *,
      plugin:plugins(id, name, slug, current_version, thumbnail_url)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch licenses: ${error.message}`);
  }

  return licenses;
};

export const getLicensesByPlugin = async (pluginId) => {
  const { data: licenses, error } = await supabaseAdmin
    .from('licenses')
    .select(`
      *,
      customer:profiles!customer_id(id, name, email)
    `)
    .eq('plugin_id', pluginId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch licenses: ${error.message}`);
  }

  return licenses;
};

export const activateLicense = async (licenseKey, activationCode, siteUrl, pluginVersion) => {
  const license = await getLicenseByKey(licenseKey);

  if (license.status !== 'active') {
    throw new ForbiddenError(`License is ${license.status}`);
  }

  // Check if license has an activation code that matches
  if (license.activation_code && license.activation_code !== activationCode) {
    throw new ForbiddenError('Invalid activation code');
  }

  // Check if already activated
  if (license.activation_code_used) {
    throw new ForbiddenError('This activation code has already been used. Each code can only be activated once.');
  }

  if (license.expiry_date && new Date(license.expiry_date) < new Date()) {
    throw new ForbiddenError('License has expired');
  }

  // Atomic update: only mark as used if NOT already used (prevents race condition)
  const { data: updatedLicense, error: updateError } = await supabaseAdmin
    .from('licenses')
    .update({ activation_code_used: true })
    .eq('id', license.id)
    .eq('activation_code_used', false) // Only update if not already used
    .select()
    .single();

  // If no rows updated, it means activation_code_used was already true
  if (updateError || !updatedLicense) {
    throw new ForbiddenError('This activation code has already been used. Each code can only be activated once.');
  }

  const { data: activation, error: insertError } = await supabaseAdmin
    .from('activations')
    .insert({
      license_id: license.id,
      site_url: siteUrl || 'unknown',
      plugin_version: pluginVersion || 'unknown',
      is_active: true,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to activate license: ${insertError.message}`);
  }

  return activation;
};

export const deactivateLicense = async (licenseKey, siteUrl) => {
  const license = await getLicenseByKey(licenseKey);

  const { data: activation, error } = await supabaseAdmin
    .from('activations')
    .update({
      is_active: false,
      deactivated_at: new Date().toISOString(),
    })
    .eq('license_id', license.id)
    .eq('site_url', siteUrl)
    .select()
    .single();

  if (error || !activation) {
    throw new NotFoundError('Activation not found');
  }

  return activation;
};

export const suspendLicense = async (licenseId) => {
  const { data: license, error } = await supabaseAdmin
    .from('licenses')
    .update({ status: 'suspended' })
    .eq('id', licenseId)
    .select()
    .single();

  if (error || !license) {
    throw new NotFoundError('License not found');
  }

  return license;
};

export const revokeLicense = async (licenseId) => {
  const { data: license, error } = await supabaseAdmin
    .from('licenses')
    .update({ status: 'revoked' })
    .eq('id', licenseId)
    .select()
    .single();

  if (error || !license) {
    throw new NotFoundError('License not found');
  }

  return license;
};

export const reactivateLicense = async (licenseId) => {
  const { data: license, error } = await supabaseAdmin
    .from('licenses')
    .update({ status: 'active' })
    .eq('id', licenseId)
    .select()
    .single();

  if (error || !license) {
    throw new NotFoundError('License not found');
  }

  return license;
};