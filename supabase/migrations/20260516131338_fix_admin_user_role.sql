DO $$
BEGIN
  -- Fix primary user profile to be master to prevent lockout and override any incorrect assignment like 'property_owner'
  UPDATE public.profiles
  SET role = 'master'
  WHERE email = 'adailtong@gmail.com';
  
  -- Also ensure standard admin seed is master
  UPDATE public.profiles
  SET role = 'master'
  WHERE email = 'admin@example.com';
END $$;
