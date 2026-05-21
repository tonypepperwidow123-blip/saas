import { z } from 'zod';

// Auth Schemas
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  role: z.enum(['customer', 'developer'], {
    errorMap: () => ({ message: 'Role must be either customer or developer' }),
  }),
  business_name: z.string().max(200).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Plugin Schemas
export const CreatePluginSchema = z.object({
  name: z.string().min(3, 'Plugin name must be at least 3 characters').max(100, 'Plugin name must be less than 100 characters'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000, 'Description must be less than 5000 characters'),
  short_desc: z.string().min(20, 'Short description must be at least 20 characters').max(200, 'Short description must be less than 200 characters'),
  category: z.enum(['seo', 'ecommerce', 'security', 'performance', 'forms', 'social', 'analytics', 'other'], {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  price: z.number().min(0, 'Price cannot be negative').max(99999, 'Price is too high'),
  tags: z.array(z.string().max(30)).max(5, 'Maximum 5 tags allowed').optional(),
});

export const UpdatePluginSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(50).max.optional(),
  short_desc: z.string().min(20).max(200).optional(),
  category: z.enum(['seo', 'ecommerce', 'security', 'performance', 'forms', 'social', 'analytics', 'other']).optional(),
  price: z.number().min(0).max.optional(),
  tags: z.array(z.string().max(30)).max(5).optional(),
});

export const UploadVersionSchema = z.object({
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'Version must be in format X.Y.Z (e.g., 1.0.0)'),
  changelog: z.string().max.optional(),
});

export const RejectPluginSchema = z.object({
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters').max(500),
});

// License Schemas
export const LicenseActivationSchema = z.object({
  license_key: z
    .string()
    .regex(/^PVLT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Invalid license key format'),
  site_url: z.string().url('Invalid site URL'),
  plugin_slug: z.string().min(1),
  plugin_version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in format X.Y.Z'),
});

export const LicenseDeactivationSchema = z.object({
  license_key: z
    .string()
    .regex(/^PVLT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Invalid license key format'),
  site_url: z.string().url('Invalid site URL'),
});

// Payment Schemas
export const CreateOrderSchema = z.object({
  plugin_id: z.string().uuid('Invalid plugin ID'),
});

export const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
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
  plugin_slug: z.string().min(1),
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

// Export types
export const RegisterSchemaType = z.infer<typeof RegisterSchema>;
export const LoginSchemaType = z.infer<typeof LoginSchema>;
export const CreatePluginSchemaType = z.infer<typeof CreatePluginSchema>;
export const UpdatePluginSchemaType = z.infer<typeof UpdatePluginSchema>;
export const LicenseActivationSchemaType = z.infer<typeof LicenseActivationSchema>;
export const CreateOrderSchemaType = z.infer<typeof CreateOrderSchema>;
export const VerifyPaymentSchemaType = z.infer<typeof VerifyPaymentSchema>;
