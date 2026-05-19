-- Seed initial data for Publicity module testing and ensure idempotent operations
DO $$
BEGIN
  -- Insert sample advertiser
  IF NOT EXISTS (SELECT 1 FROM public.advertisers WHERE billing_email = 'demo@acmecorp.test') THEN
    INSERT INTO public.advertisers (
      id, name, billing_email, billing_phone, street, city, state, zip_code, country, contacts
    ) VALUES (
      'd1d1d1d1-1111-1111-1111-111111111111'::uuid, 
      'Acme Corp (Demo)', 
      'demo@acmecorp.test', 
      '+1 (555) 123-4567', 
      '123 Demo St', 
      'New York', 
      'NY', 
      '10001', 
      'US',
      '[{"name": "John Doe", "role": "Marketing Director", "email": "john@acmecorp.test", "phone": "+1 (555) 123-4567"}]'::jsonb
    );
  END IF;

  -- Insert sample pricing matrix for Properties
  IF NOT EXISTS (SELECT 1 FROM public.publicity_pricing_matrix WHERE location_key = 'properties' AND duration_days = 30) THEN
    INSERT INTO public.publicity_pricing_matrix (
      id, location_key, duration_days, price, valid_from
    ) VALUES (
      'd2d2d2d2-2222-2222-2222-222222222222'::uuid,
      'properties',
      30,
      500.00,
      NOW() - INTERVAL '30 days'
    );
  END IF;

  -- Insert sample pricing matrix for Financial
  IF NOT EXISTS (SELECT 1 FROM public.publicity_pricing_matrix WHERE location_key = 'financial' AND duration_days = 7) THEN
    INSERT INTO public.publicity_pricing_matrix (
      id, location_key, duration_days, price, valid_from
    ) VALUES (
      'd3d3d3d3-3333-3333-3333-333333333333'::uuid,
      'financial',
      7,
      150.00,
      NOW() - INTERVAL '30 days'
    );
  END IF;
END $$;
