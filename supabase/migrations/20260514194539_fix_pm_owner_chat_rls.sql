-- 1. Add pm_id to tables to establish the relationship
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pm_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS pm_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Drop dependent views or policies to avoid lock conflicts
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

-- 3. Recreate profiles RLS so users can see people they are allowed to chat with
CREATE POLICY "profiles_select" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid() OR 
  pm_id = auth.uid() OR -- I am the PM, I can see my clients
  pm_id = (SELECT p2.pm_id FROM public.profiles p2 WHERE p2.id = auth.uid()) OR -- We share the same PM
  id = (SELECT p2.pm_id FROM public.profiles p2 WHERE p2.id = auth.uid()) OR -- I can see my PM
  is_admin_or_pm() OR
  id IN (
    -- Allow seeing profiles if we share a conversation thread
    SELECT profile_id FROM public.conversation_participants 
    WHERE conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants WHERE profile_id = auth.uid()
    )
  )
);

-- 4. Seed data script to ensure PM and Owner are linked for testing
DO $$
DECLARE
  default_pm_id uuid;
  admin_user_id uuid;
  owner_user_id uuid;
BEGIN
  -- Find an existing PM
  SELECT id INTO default_pm_id FROM public.profiles WHERE role IN ('software_tenant', 'master', 'platform_owner') LIMIT 1;
  
  IF default_pm_id IS NOT NULL THEN
    -- Link all unlinked property_owner and tenant profiles to this PM
    UPDATE public.profiles 
    SET pm_id = default_pm_id 
    WHERE role IN ('property_owner', 'tenant') AND pm_id IS NULL;
    
    UPDATE public.properties
    SET pm_id = default_pm_id
    WHERE pm_id IS NULL;
  ELSE
    -- Create a PM and an Owner if none exist to enable full end-to-end testing
    admin_user_id := gen_random_uuid();
    
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@example.com') THEN
        INSERT INTO auth.users (
          id, instance_id, email, encrypted_password, email_confirmed_at,
          created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
          is_super_admin, role, aud,
          confirmation_token, recovery_token, email_change_token_new,
          email_change, email_change_token_current,
          phone, phone_change, phone_change_token, reauthentication_token
        ) VALUES (
          admin_user_id,
          '00000000-0000-0000-0000-000000000000',
          'admin@example.com',
          crypt('Skip@Pass123!', gen_salt('bf')),
          NOW(), NOW(), NOW(),
          '{"provider": "email", "providers": ["email"]}',
          '{"name": "Admin PM"}',
          false, 'authenticated', 'authenticated',
          '', '', '', '', '', NULL, '', '', ''
        );
        
        INSERT INTO public.profiles (id, email, name, role)
        VALUES (admin_user_id, 'admin@example.com', 'Admin PM', 'software_tenant')
        ON CONFLICT (id) DO NOTHING;
        
        default_pm_id := admin_user_id;
    END IF;

    owner_user_id := gen_random_uuid();
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'owner@example.com') THEN
        INSERT INTO auth.users (
          id, instance_id, email, encrypted_password, email_confirmed_at,
          created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
          is_super_admin, role, aud,
          confirmation_token, recovery_token, email_change_token_new,
          email_change, email_change_token_current,
          phone, phone_change, phone_change_token, reauthentication_token
        ) VALUES (
          owner_user_id,
          '00000000-0000-0000-0000-000000000000',
          'owner@example.com',
          crypt('Skip@Pass123!', gen_salt('bf')),
          NOW(), NOW(), NOW(),
          '{"provider": "email", "providers": ["email"]}',
          '{"name": "Test Owner"}',
          false, 'authenticated', 'authenticated',
          '', '', '', '', '', NULL, '', '', ''
        );
        
        INSERT INTO public.profiles (id, email, name, role, pm_id)
        VALUES (owner_user_id, 'owner@example.com', 'Test Owner', 'property_owner', default_pm_id)
        ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;
END $$;
