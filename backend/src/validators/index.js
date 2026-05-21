import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string()
    .min(8, 'Password must be at least 8 digits long')
    .regex(/^[0-9]+$/, 'Password must contain only numbers (0-9)'),
  role: z.enum(['customer', 'developer']),
  business_name: z.string().max(200).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

// Admin Password Reset Schema - accepts ANY password with no restrictions
export const UpdatePasswordSchema = z.object({
  user_id: z.string().uuid(),
  password: z.string().min(1, 'Password cannot be empty'),
});

// Plugin Schemas
export const CreatePluginSchema = z.object({
  name: z.string().min(1).max(100),
  // Sanitize slug server-side: lowercase and replace invalid chars with hyphens
  slug: z.string().min(1).max(100).transform((val) =>
    val.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  ),
  description: z.string().min(1),
  short_desc: z.string().min(1).max(300),
  category: z.enum(['seo', 'ecommerce', 'security', 'performance', 'forms', 'social', 'analytics', 'other']),
  price: z.coerce.number().min(0),
  tags: z.array(z.string()).max(5).optional(),
});

export const UpdatePluginSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).optional(),
  short_desc: z.string().min(1).max(300).optional(),
  category: z.enum(['seo', 'ecommerce', 'security', 'performance', 'forms', 'social', 'analytics', 'other']).optional(),
  price: z.coerce.number().min(0).optional(),
  tags: z.array(z.string()).max(5).optional(),
});

export const UploadVersionSchema = z.object({
  // Accept any version string, normalize to semver if needed
  version: z.string().min(1).transform((val) => {
    // If already semver (x.y.z), keep as is
    if (/^\d+\.\d+\.\d+$/.test(val)) return val;
    // Try to pad: '1' -> '1.0.0', '1.2' -> '1.2.0'
    const parts = val.split('.');
    while (parts.length < 3) parts.push('0');
    return parts.slice(0, 3).join('.');
  }),
  changelog: z.string().optional(),
});

export const RejectPluginSchema = z.object({
  reason: z.string().min(10).max(500),
});

// License Schemas
export const LicenseActivationSchema = z.object({
  license_key: z.string().regex(/^PVLT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/),
  activation_code: z.string().min(12).max(32), // One-time activation code (usually 24 chars)
  site_url: z.string().url().optional(), // Optional for one-time code flow
  plugin_slug: z.string(),
  plugin_version: z.string().regex(/^\d+(\.\d+)*$/),
});

export const LicenseDeactivationSchema = z.object({
  license_key: z.string().regex(/^PVLT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/),
  site_url: z.string().url(),
});

// Payment Schemas
export const CreateOrderSchema = z.object({
  plugin_id: z.string().uuid(),
});

export const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

// Pagination Schema
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

// WP Update Schema
export const CheckUpdateSchema = z.object({
  license_key: z.string().regex(/^PVLT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/),
  plugin_slug: z.string(),
  current_version: z.string().regex(/^\d+\.\d+\.\d+$/),
});

// Admin Schemas
export const SuspendUserSchema = z.object({
  reason: z.string().min(10).max(500).optional(),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  business_name: z.string().max(200).optional(),
  avatar_url: z.string().url().optional().nullable(),
});