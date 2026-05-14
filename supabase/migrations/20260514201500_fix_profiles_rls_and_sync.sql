DO $do$
BEGIN
  -- 1. Sync missing profiles for any users that don't have one
  -- This fixes the "Profile not found" error if the trigger failed or ran out of order
  INSERT INTO public.profiles (id, email, name, role)
  SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', email), 
    COALESCE(raw_user_meta_data->>'role', 'tenant')
  FROM auth.users
  WHERE id NOT IN (SELECT id FROM public.profiles)
  ON CONFLICT (id) DO NOTHING;

  -- 2. Ensure demo users have the correct roles in case of mismatch
  UPDATE public.profiles SET role = 'master' WHERE email = 'master@plataforma.com';
  UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@plataforma.com';
  UPDATE public.profiles SET role = 'partner' WHERE email = 'parceiro@plataforma.com';
  UPDATE public.profiles SET role = 'property_owner' WHERE email = 'proprietario@plataforma.com';
  UPDATE public.profiles SET role = 'tenant' WHERE email = 'locatario@plataforma.com';

  -- 3. Reset passwords for demo accounts to ensure they are correct and explicitly verifiable
  UPDATE auth.users SET encrypted_password = crypt('master123', gen_salt('bf')) WHERE email = 'master@plataforma.com';
  UPDATE auth.users SET encrypted_password = crypt('admin123', gen_salt('bf')) WHERE email = 'admin@plataforma.com';
  UPDATE auth.users SET encrypted_password = crypt('parceiro123', gen_salt('bf')) WHERE email = 'parceiro@plataforma.com';
  UPDATE auth.users SET encrypted_password = crypt('proprietario123', gen_salt('bf')) WHERE email = 'proprietario@plataforma.com';
  UPDATE auth.users SET encrypted_password = crypt('locatario123', gen_salt('bf')) WHERE email = 'locatario@plataforma.com';

END $do$;

-- 4. Fix RLS on profiles to prevent infinite recursion
-- The previous policy used `is_admin_or_pm()` which queried `public.profiles`, causing an infinite loop.
-- This loop made the database return `null` when a user tried to read their own profile, triggering the logout.
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

-- Allow all authenticated users to see profiles (standard for apps with chat/task assignments)
CREATE POLICY "profiles_select" ON public.profiles 
  FOR SELECT TO authenticated 
  USING (true);
