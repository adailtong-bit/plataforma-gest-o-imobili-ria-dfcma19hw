DO $$
BEGIN
  UPDATE public.hotels 
  SET 
    general_access_code = COALESCE(general_access_code, '1234#'),
    pool_access_code = COALESCE(pool_access_code, 'Open 8am-10pm'),
    game_room_access_code = COALESCE(game_room_access_code, '5678#'),
    image = COALESCE(image, 'https://img.usecurling.com/p/800/600?q=hotel')
  WHERE general_access_code IS NULL;
END $$;
