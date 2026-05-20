-- ============================================================
-- APP VERSIONS TABLE
-- Track app versions for OTA update checks
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_versions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform        TEXT NOT NULL CHECK (platform IN ('android', 'ios')),
  version_number  TEXT NOT NULL,
  version_code    INTEGER NOT NULL,
  download_url    TEXT,
  release_notes   TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_mandatory    BOOLEAN NOT NULL DEFAULT false,
  min_supported_version TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(platform, version_number)
);

-- RLS: Public read for active versions
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active versions"
  ON public.app_versions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage versions"
  ON public.app_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seed initial version
INSERT INTO public.app_versions (platform, version_number, version_code, release_notes, is_active) VALUES
  ('android', '1.0.0', 1, 'Initial release with all core features', true)
ON CONFLICT (platform, version_number) DO NOTHING;
