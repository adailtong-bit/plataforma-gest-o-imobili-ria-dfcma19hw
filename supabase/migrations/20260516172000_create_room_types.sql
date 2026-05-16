CREATE TABLE IF NOT EXISTS public.room_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  base_price numeric NOT NULL DEFAULT 0,
  capacity integer DEFAULT 1,
  bedrooms integer DEFAULT 1,
  bathrooms integer DEFAULT 1,
  characteristics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS room_type_id uuid REFERENCES public.room_types(id) ON DELETE SET NULL;

ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "room_types_all" ON public.room_types;
CREATE POLICY "room_types_all" ON public.room_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger to sync property prices when room category price changes
CREATE OR REPLACE FUNCTION public.sync_room_type_price()
RETURNS trigger AS $function$
BEGIN
  IF NEW.base_price IS DISTINCT FROM OLD.base_price THEN
    UPDATE public.properties
    SET listing_price = NEW.base_price
    WHERE room_type_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_room_type_price_update ON public.room_types;
CREATE TRIGGER on_room_type_price_update
  AFTER UPDATE ON public.room_types
  FOR EACH ROW EXECUTE FUNCTION public.sync_room_type_price();
