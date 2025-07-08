-- Location: supabase/migrations/20241216160000_remove_tags_add_categories.sql
-- Remove tags and add proper categories system

-- 1. Create category enum type
CREATE TYPE public.recipe_category AS ENUM (
    'breakfast', 
    'lunch', 
    'dinner', 
    'appetizer', 
    'dessert', 
    'snack', 
    'beverage', 
    'soup', 
    'salad', 
    'main_course', 
    'side_dish', 
    'sauce', 
    'baking'
);

-- 2. Add category column to recipes table
ALTER TABLE public.recipes 
ADD COLUMN category public.recipe_category DEFAULT 'main_course'::public.recipe_category;

-- 3. Migrate existing tag data to categories where possible
DO $$
BEGIN
    -- Update recipes based on existing tags
    UPDATE public.recipes SET category = 'breakfast'::public.recipe_category 
    WHERE 'breakfast' = ANY(tags);
    
    UPDATE public.recipes SET category = 'lunch'::public.recipe_category 
    WHERE 'lunch' = ANY(tags) AND category = 'main_course'::public.recipe_category;
    
    UPDATE public.recipes SET category = 'dinner'::public.recipe_category 
    WHERE 'dinner' = ANY(tags) AND category = 'main_course'::public.recipe_category;
    
    UPDATE public.recipes SET category = 'appetizer'::public.recipe_category 
    WHERE 'appetizer' = ANY(tags) AND category = 'main_course'::public.recipe_category;
    
    UPDATE public.recipes SET category = 'dessert'::public.recipe_category 
    WHERE 'dessert' = ANY(tags) AND category = 'main_course'::public.recipe_category;
    
    UPDATE public.recipes SET category = 'snack'::public.recipe_category 
    WHERE 'snack' = ANY(tags) AND category = 'main_course'::public.recipe_category;
    
    UPDATE public.recipes SET category = 'soup'::public.recipe_category 
    WHERE 'soup' = ANY(tags) AND category = 'main_course'::public.recipe_category;
    
    UPDATE public.recipes SET category = 'salad'::public.recipe_category 
    WHERE 'salad' = ANY(tags) AND category = 'main_course'::public.recipe_category;
END $$;

-- 4. Remove tags column from recipes table
ALTER TABLE public.recipes DROP COLUMN IF EXISTS tags;

-- 5. Add index for category column
CREATE INDEX idx_recipes_category ON public.recipes(category);

-- 6. Update RLS policies to include category access
-- The existing policies will continue to work as they check user ownership

-- 7. Update mock data with categories
DO $$
DECLARE
    recipe1_id UUID;
    recipe2_id UUID;
    recipe3_id UUID;
BEGIN
    -- Get existing recipe IDs
    SELECT id INTO recipe1_id FROM public.recipes WHERE title = 'Classic Spaghetti Carbonara' LIMIT 1;
    SELECT id INTO recipe2_id FROM public.recipes WHERE title = 'Avocado Toast Supreme' LIMIT 1;
    SELECT id INTO recipe3_id FROM public.recipes WHERE title = 'Chocolate Lava Cake' LIMIT 1;
    
    -- Update existing recipes with proper categories
    IF recipe1_id IS NOT NULL THEN
        UPDATE public.recipes 
        SET category = 'dinner'::public.recipe_category 
        WHERE id = recipe1_id;
    END IF;
    
    IF recipe2_id IS NOT NULL THEN
        UPDATE public.recipes 
        SET category = 'breakfast'::public.recipe_category 
        WHERE id = recipe2_id;
    END IF;
    
    IF recipe3_id IS NOT NULL THEN
        UPDATE public.recipes 
        SET category = 'dessert'::public.recipe_category 
        WHERE id = recipe3_id;
    END IF;
END $$;