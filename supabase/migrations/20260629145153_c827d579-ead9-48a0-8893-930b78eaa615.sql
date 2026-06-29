
CREATE SEQUENCE IF NOT EXISTS public.user_code_seq START 1;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_code TEXT UNIQUE;

-- Backfill any existing profiles without a code.
UPDATE public.profiles
SET user_code = 'GJF-' || lpad(nextval('public.user_code_seq')::text, 5, '0')
WHERE user_code IS NULL;

-- Replace handle_new_user so new signups also get a user_code.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, user_code)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    'GJF-' || lpad(nextval('public.user_code_seq')::text, 5, '0')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $function$;
