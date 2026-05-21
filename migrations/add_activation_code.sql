-- ============================================
-- Migration: Add One-Time Activation Code Fields
-- Adds: activation_code, activation_code_used
-- ============================================

-- Add activation_code column (one-time code for WordPress activation)
ALTER TABLE public.licenses
ADD COLUMN IF NOT EXISTS activation_code text;

-- Add activation_code_used column (tracks if code was consumed)
ALTER TABLE public.licenses
ADD COLUMN IF NOT EXISTS activation_code_used boolean NOT NULL DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_licenses_activation_code ON public.licenses(activation_code);

-- ============================================
-- Verify migration
-- ============================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'licenses' AND column_name IN ('activation_code', 'activation_code_used');

-- Migration complete
SELECT 'One-time activation code columns added successfully!' as status;