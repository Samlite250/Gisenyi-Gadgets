-- ============================================================
-- GISENYI GADGETS — ADMIN USER: samlite250@gmail.com
-- RUN THIS IN THE SUPABASE SQL EDITOR (Dashboard > SQL Editor)
-- Do NOT run via migration runner — auth.users requires manual insert
-- ============================================================

DO $$
DECLARE
  v_user_id   UUID;
  v_email     TEXT := 'samlite250@gmail.com';
  v_pass      TEXT := '@Samlite1';
BEGIN
  -- Check if user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := uuid_generate_v4();

    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      role,
      aud,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      v_email,
      crypt(v_pass, gen_salt('bf')),
      now(),
      'authenticated',
      'authenticated',
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Samlite Admin"}',
      now(),
      now(),
      '',
      ''
    );

    RAISE NOTICE 'Admin user created: %', v_email;
  ELSE
    -- User exists — just update password
    UPDATE auth.users
    SET encrypted_password = crypt(v_pass, gen_salt('bf')),
        updated_at         = now()
    WHERE id = v_user_id;

    RAISE NOTICE 'User % already existed — password updated.', v_email;
  END IF;

  -- Upsert the admin profile
  INSERT INTO public.profiles (id, full_name, role, is_active)
  VALUES (v_user_id, 'Samlite Admin', 'admin', true)
  ON CONFLICT (id) DO UPDATE
    SET role      = 'admin',
        is_active = true;

  RAISE NOTICE 'Profile set to admin for: %', v_email;
END $$;
