-- Location: supabase/migrations/20241216170000_fix_public_recipe_access.sql
-- Fix public recipe access for anonymous users

-- 1. Drop existing public policy to recreate it properly
DROP POLICY IF EXISTS "allow_public_recipe_read" ON public.recipes;

-- 2. Create proper public access policy for recipes
CREATE POLICY "allow_public_recipe_read" ON public.recipes
FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Ensure RLS is enabled
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- 4. Grant necessary permissions to anonymous users
GRANT SELECT ON public.recipes TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- 5. Create a function to get public recipe data with proper access
CREATE OR REPLACE FUNCTION public.get_public_recipe(recipe_uuid UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    ingredients JSONB,
    instructions JSONB,
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    servings INTEGER,
    difficulty public.recipe_difficulty,
    category public.recipe_category,
    image_url TEXT,
    rating DECIMAL(2,1),
    created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT 
        r.id,
        r.title,
        r.description,
        r.ingredients,
        r.instructions,
        r.prep_time_minutes,
        r.cook_time_minutes,
        r.servings,
        r.difficulty,
        r.category,
        r.image_url,
        r.rating,
        r.created_at
    FROM public.recipes r
    WHERE r.id = recipe_uuid;
$$;

-- 6. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_public_recipe(UUID) TO anon, authenticated;

-- 7. Add comment
COMMENT ON FUNCTION public.get_public_recipe(UUID) IS 'Safely retrieves recipe data for public access without user authentication';