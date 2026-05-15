-- ============================================================
-- GISENYI GADGETS — ADMIN USER CREATION
-- RUN THIS IN THE SUPABASE SQL EDITOR
-- ============================================================

-- 1. Variables
DO $$
DECLARE
  new_user_id UUID := uuid_generate_v4();
  admin_email TEXT := 'admin@gisenyigadgets.rw';
  admin_pass  TEXT := 'GisenyiAdmin2024!'; -- You should change this in the Supabase Auth dashboard later
BEGIN
  -- 2. Create the user in auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud, confirmation_token)
    VALUES (
      new_user_id,
      admin_email,
      crypt(admin_pass, gen_salt('bf')),
      now(),
      'authenticated',
      'authenticated',
      ''
    );

    -- 3. Create the profile in public.profiles
    INSERT INTO public.profiles (id, full_name, role, is_active)
    VALUES (new_user_id, 'Super Admin', 'admin', true)
    ON CONFLICT (id) DO UPDATE SET role = 'admin';

    RAISE NOTICE 'Admin user created with email: %', admin_email;
  ELSE
    RAISE NOTICE 'User % already exists. Updating role to admin.', admin_email;
    UPDATE public.profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = admin_email);
  END IF;
END $$;
