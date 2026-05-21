-- Allow broadcast notifications (user_id = NULL means sent to all users)
ALTER TABLE public.notifications ALTER COLUMN user_id DROP NOT NULL;

-- Admin can insert notifications
CREATE POLICY "admin_insert_notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin can read all notifications
CREATE POLICY "admin_read_notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR user_id IS NULL
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin can delete notifications
CREATE POLICY "admin_delete_notifications" ON public.notifications
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
