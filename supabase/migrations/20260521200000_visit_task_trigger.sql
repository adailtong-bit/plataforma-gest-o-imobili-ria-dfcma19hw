DROP TRIGGER IF EXISTS trg_sync_visit_to_task ON public.visits;
DROP TRIGGER IF EXISTS trg_sync_visit_to_task_delete ON public.visits;

CREATE OR REPLACE FUNCTION public.sync_visit_to_task()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_task_id uuid;
  v_property_name text;
  v_property_address text;
BEGIN
  -- Get property details
  IF NEW.property_id IS NOT NULL THEN
    SELECT name, address INTO v_property_name, v_property_address 
    FROM public.properties WHERE id = NEW.property_id;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.tasks (
      title, 
      type, 
      status, 
      date, 
      property_id, 
      property_name, 
      property_address,
      source
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
        title, 
        type, 
        status, 
        date, 
        property_id, 
        property_name, 
        property_address,
        source
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
$function$;

CREATE TRIGGER trg_sync_visit_to_task
  BEFORE INSERT OR UPDATE ON public.visits
  FOR EACH ROW EXECUTE FUNCTION public.sync_visit_to_task();

CREATE TRIGGER trg_sync_visit_to_task_delete
  AFTER DELETE ON public.visits
  FOR EACH ROW EXECUTE FUNCTION public.sync_visit_to_task();
