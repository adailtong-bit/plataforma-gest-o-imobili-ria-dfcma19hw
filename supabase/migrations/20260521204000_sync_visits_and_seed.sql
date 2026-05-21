DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user (idempotent: skip if email already exists)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'master')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.sync_visit_to_task()
RETURNS trigger AS $$
DECLARE
  v_task_id uuid;
  v_property_name text;
  v_property_address text;
BEGIN
  IF NEW.property_id IS NOT NULL THEN
    SELECT name, address INTO v_property_name, v_property_address
    FROM public.properties WHERE id = NEW.property_id;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.tasks (
      title, type, status, date, property_id, property_name, property_address, source
    ) VALUES (
      'Visit: ' || NEW.visitor_name,
      'visit',
      NEW.status,
      NEW.visit_date::text,
      NEW.property_id,
      v_property_name,
      v_property_address,
      'automated_visit'
    ) RETURNING id INTO v_task_id;
    NEW.task_id := v_task_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.task_id IS NOT NULL THEN
      UPDATE public.tasks SET
        title = 'Visit: ' || NEW.visitor_name,
        status = NEW.status,
        date = NEW.visit_date::text,
        property_id = NEW.property_id,
        property_name = v_property_name,
        property_address = v_property_address
      WHERE id = NEW.task_id;
    ELSE
      INSERT INTO public.tasks (
        title, type, status, date, property_id, property_name, property_address, source
      ) VALUES (
        'Visit: ' || NEW.visitor_name,
        'visit',
        NEW.status,
        NEW.visit_date::text,
        NEW.property_id,
        v_property_name,
        v_property_address,
        'automated_visit'
      ) RETURNING id INTO v_task_id;
      NEW.task_id := v_task_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.task_id IS NOT NULL THEN
      DELETE FROM public.tasks WHERE id = OLD.task_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_visit_to_task ON public.visits;
CREATE TRIGGER trg_sync_visit_to_task
  BEFORE INSERT OR UPDATE ON public.visits
  FOR EACH ROW EXECUTE FUNCTION public.sync_visit_to_task();

DROP TRIGGER IF EXISTS trg_sync_visit_to_task_delete ON public.visits;
CREATE TRIGGER trg_sync_visit_to_task_delete
  AFTER DELETE ON public.visits
  FOR EACH ROW EXECUTE FUNCTION public.sync_visit_to_task();
