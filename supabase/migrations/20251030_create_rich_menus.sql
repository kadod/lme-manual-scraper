-- Create rich_menus table
CREATE TABLE IF NOT EXISTS public.rich_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rich_menu_id TEXT NOT NULL UNIQUE,
  line_rich_menu_id TEXT,
  name TEXT NOT NULL,
  chat_bar_text TEXT NOT NULL,
  size JSONB NOT NULL DEFAULT '{"width": 2500, "height": 1686}'::jsonb,
  selected BOOLEAN DEFAULT false,
  areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rich_menu_areas table (for normalized structure if needed)
CREATE TABLE IF NOT EXISTS public.rich_menu_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rich_menu_id UUID NOT NULL REFERENCES public.rich_menus(id) ON DELETE CASCADE,
  bounds JSONB NOT NULL,
  action JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rich_menus_user_id ON public.rich_menus(user_id);
CREATE INDEX IF NOT EXISTS idx_rich_menus_rich_menu_id ON public.rich_menus(rich_menu_id);
CREATE INDEX IF NOT EXISTS idx_rich_menus_line_rich_menu_id ON public.rich_menus(line_rich_menu_id);
CREATE INDEX IF NOT EXISTS idx_rich_menus_status ON public.rich_menus(status);
CREATE INDEX IF NOT EXISTS idx_rich_menu_areas_rich_menu_id ON public.rich_menu_areas(rich_menu_id);

-- Enable RLS
ALTER TABLE public.rich_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rich_menu_areas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rich_menus
CREATE POLICY "Users can view their own rich menus"
  ON public.rich_menus
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rich menus"
  ON public.rich_menus
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rich menus"
  ON public.rich_menus
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rich menus"
  ON public.rich_menus
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for rich_menu_areas
CREATE POLICY "Users can view their own rich menu areas"
  ON public.rich_menu_areas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rich_menus
      WHERE rich_menus.id = rich_menu_areas.rich_menu_id
      AND rich_menus.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own rich menu areas"
  ON public.rich_menu_areas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rich_menus
      WHERE rich_menus.id = rich_menu_areas.rich_menu_id
      AND rich_menus.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own rich menu areas"
  ON public.rich_menu_areas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.rich_menus
      WHERE rich_menus.id = rich_menu_areas.rich_menu_id
      AND rich_menus.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own rich menu areas"
  ON public.rich_menu_areas
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.rich_menus
      WHERE rich_menus.id = rich_menu_areas.rich_menu_id
      AND rich_menus.user_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rich_menus_updated_at
  BEFORE UPDATE ON public.rich_menus
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
