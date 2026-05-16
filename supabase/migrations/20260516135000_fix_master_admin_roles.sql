DO $$
BEGIN
  -- Fix role for master admins to ensure they have the correct master permissions,
  -- resolving access denied issues caused by incorrect default roles.
  UPDATE public.profiles
  SET role = 'master'
  WHERE email IN ('master@plataforma.com', 'admin@plataforma.com', 'adailtong@gmail.com', 'admin@example.com') AND role != 'master';
END $$;
