-- ============================================================
-- GISENYI GADGETS — FIX PROFILES RLS INFINITE RECURSION
-- ============================================================

-- Create a security definer function that bypasses RLS to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the problematic policies using the function
DROP POLICY IF EXISTS "profiles_own_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

CREATE POLICY "profiles_own_read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_admin_all"
  ON public.profiles
  USING (public.is_admin());

-- Also fix other tables that use the same pattern
DROP POLICY IF EXISTS "notifications_admin_all" ON public.notifications;
CREATE POLICY "notifications_admin_all"
  ON public.notifications
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "chat_own_read" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_own_insert" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_update" ON public.chat_messages;

CREATE POLICY "chat_own_read"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "chat_own_insert"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "chat_update"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());
