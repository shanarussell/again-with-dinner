-- Location: supabase/migrations/20241216180000_add_recipe_notes_table.sql
-- Add recipe_notes table to support personal recipe notes functionality

-- 1. Create recipe_notes table
CREATE TABLE public.recipe_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add indexes for performance
CREATE INDEX idx_recipe_notes_recipe_id ON public.recipe_notes(recipe_id);
CREATE INDEX idx_recipe_notes_user_id ON public.recipe_notes(user_id);
CREATE INDEX idx_recipe_notes_created_at ON public.recipe_notes(created_at DESC);

-- 3. Enable RLS
ALTER TABLE public.recipe_notes ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "users_own_recipe_notes" ON public.recipe_notes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Add update trigger for updated_at
CREATE TRIGGER update_recipe_notes_updated_at
    BEFORE UPDATE ON public.recipe_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_notes TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 7. Add helper function to check if user owns recipe note
CREATE OR REPLACE FUNCTION public.is_recipe_note_owner(note_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.recipe_notes rn
    WHERE rn.id = note_uuid AND rn.user_id = auth.uid()
)
$$;

-- 8. Add comment
COMMENT ON TABLE public.recipe_notes IS 'Personal notes that users can add to their recipes';