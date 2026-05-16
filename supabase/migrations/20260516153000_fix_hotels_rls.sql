DO $do$
BEGIN
  -- Permite que qualquer usuário autenticado leia os hotéis e torres, 
  -- garantindo que fiquem disponíveis nos dropdowns de propriedades.
  DROP POLICY IF EXISTS "hotels_select" ON public.hotels;
  CREATE POLICY "hotels_select" ON public.hotels FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "towers_select" ON public.towers;
  CREATE POLICY "towers_select" ON public.towers FOR SELECT TO authenticated USING (true);
END $do$;
