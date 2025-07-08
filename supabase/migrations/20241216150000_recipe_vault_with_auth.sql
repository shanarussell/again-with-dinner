-- Location: supabase/migrations/20241216150000_recipe_vault_with_auth.sql
-- Recipe Vault Authentication & Data Schema

-- 1. Custom Types
CREATE TYPE public.user_role AS ENUM ('user', 'admin');
CREATE TYPE public.recipe_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE public.meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- 2. User Profiles (Critical intermediary table)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role public.user_role DEFAULT 'user'::public.user_role,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Recipes Table
CREATE TABLE public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    ingredients JSONB NOT NULL DEFAULT '[]',
    instructions JSONB NOT NULL DEFAULT '[]',
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    servings INTEGER DEFAULT 1,
    difficulty public.recipe_difficulty DEFAULT 'medium'::public.recipe_difficulty,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0.0,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Meal Plans Table
CREATE TABLE public.meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    planned_date DATE NOT NULL,
    meal_type public.meal_type NOT NULL,
    servings INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Shopping Lists Table
CREATE TABLE public.shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Shopping List',
    items JSONB NOT NULL DEFAULT '[]',
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX idx_recipes_title ON public.recipes(title);
CREATE INDEX idx_recipes_created_at ON public.recipes(created_at DESC);
CREATE INDEX idx_meal_plans_user_id ON public.meal_plans(user_id);
CREATE INDEX idx_meal_plans_date ON public.meal_plans(planned_date);
CREATE INDEX idx_shopping_lists_user_id ON public.shopping_lists(user_id);

-- 7. RLS Setup
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

-- 8. Helper Functions
CREATE OR REPLACE FUNCTION public.is_recipe_owner(recipe_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_uuid AND r.user_id = auth.uid()
)
$$;

CREATE OR REPLACE FUNCTION public.is_meal_plan_owner(meal_plan_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.meal_plans mp
    WHERE mp.id = meal_plan_uuid AND mp.user_id = auth.uid()
)
$$;

CREATE OR REPLACE FUNCTION public.is_shopping_list_owner(list_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.shopping_lists sl
    WHERE sl.id = list_uuid AND sl.user_id = auth.uid()
)
$$;

-- 9. Automatic Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')::public.user_role
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. RLS Policies
CREATE POLICY "users_own_profile" ON public.user_profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_own_recipes" ON public.recipes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_own_meal_plans" ON public.meal_plans
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_own_shopping_lists" ON public.shopping_lists
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 11. Update Timestamps Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 12. Update Triggers
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON public.recipes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at
    BEFORE UPDATE ON public.shopping_lists
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Mock Data
DO $$
DECLARE
    user1_auth_id UUID := gen_random_uuid();
    user2_auth_id UUID := gen_random_uuid();
    recipe1_id UUID := gen_random_uuid();
    recipe2_id UUID := gen_random_uuid();
    recipe3_id UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (user1_auth_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'chef@example.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Chef Sarah"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user2_auth_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'foodie@example.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Foodie Mike"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create sample recipes
    INSERT INTO public.recipes (id, user_id, title, description, ingredients, instructions, prep_time_minutes, cook_time_minutes, servings, difficulty, tags, rating, is_favorite)
    VALUES
        (recipe1_id, user1_auth_id, 'Classic Spaghetti Carbonara', 
         'Authentic Italian pasta dish with eggs, cheese, and pancetta',
         '[{"name": "Spaghetti", "amount": "400g"}, {"name": "Eggs", "amount": "4 large"}, {"name": "Pancetta", "amount": "150g"}, {"name": "Parmesan cheese", "amount": "100g grated"}, {"name": "Black pepper", "amount": "to taste"}]'::jsonb,
         '[{"step": 1, "instruction": "Cook spaghetti in salted boiling water until al dente"}, {"step": 2, "instruction": "Fry pancetta until crispy"}, {"step": 3, "instruction": "Whisk eggs with grated parmesan"}, {"step": 4, "instruction": "Combine hot pasta with pancetta and egg mixture"}, {"step": 5, "instruction": "Toss quickly to create creamy sauce"}]'::jsonb,
         15, 15, 4, 'medium'::public.recipe_difficulty, 
         ARRAY['pasta', 'italian', 'dinner'], 4.8, true),
        
        (recipe2_id, user1_auth_id, 'Avocado Toast Supreme', 
         'Elevated avocado toast with poached egg and everything seasoning',
         '[{"name": "Sourdough bread", "amount": "2 slices"}, {"name": "Avocado", "amount": "1 ripe"}, {"name": "Eggs", "amount": "2 large"}, {"name": "Everything seasoning", "amount": "1 tsp"}, {"name": "Lemon juice", "amount": "1 tbsp"}, {"name": "Sea salt", "amount": "to taste"}]'::jsonb,
         '[{"step": 1, "instruction": "Toast sourdough bread until golden"}, {"step": 2, "instruction": "Mash avocado with lemon juice and salt"}, {"step": 3, "instruction": "Poach eggs in simmering water"}, {"step": 4, "instruction": "Spread avocado on toast"}, {"step": 5, "instruction": "Top with poached egg and everything seasoning"}]'::jsonb,
         10, 5, 2, 'easy'::public.recipe_difficulty, 
         ARRAY['breakfast', 'healthy', 'quick'], 4.5, false),
        
        (recipe3_id, user2_auth_id, 'Chocolate Lava Cake', 
         'Decadent individual chocolate cakes with molten centers',
         '[{"name": "Dark chocolate", "amount": "100g"}, {"name": "Butter", "amount": "100g"}, {"name": "Eggs", "amount": "2 large"}, {"name": "Sugar", "amount": "50g"}, {"name": "Flour", "amount": "30g"}, {"name": "Vanilla extract", "amount": "1 tsp"}]'::jsonb,
         '[{"step": 1, "instruction": "Melt chocolate and butter in double boiler"}, {"step": 2, "instruction": "Whisk eggs and sugar until pale"}, {"step": 3, "instruction": "Combine chocolate mixture with egg mixture"}, {"step": 4, "instruction": "Fold in flour and vanilla"}, {"step": 5, "instruction": "Bake in ramekins for 12-14 minutes"}]'::jsonb,
         20, 15, 2, 'hard'::public.recipe_difficulty, 
         ARRAY['dessert', 'chocolate', 'romantic'], 4.9, true);

    -- Create sample meal plans
    INSERT INTO public.meal_plans (user_id, recipe_id, planned_date, meal_type, servings)
    VALUES
        (user1_auth_id, recipe1_id, CURRENT_DATE, 'dinner'::public.meal_type, 4),
        (user1_auth_id, recipe2_id, CURRENT_DATE + INTERVAL '1 day', 'breakfast'::public.meal_type, 2),
        (user2_auth_id, recipe3_id, CURRENT_DATE + INTERVAL '2 days', 'dinner'::public.meal_type, 2);

    -- Create sample shopping lists
    INSERT INTO public.shopping_lists (user_id, name, items)
    VALUES
        (user1_auth_id, 'Weekly Groceries', 
         '[{"name": "Spaghetti", "amount": "400g", "checked": false}, {"name": "Eggs", "amount": "1 dozen", "checked": false}, {"name": "Pancetta", "amount": "150g", "checked": true}, {"name": "Parmesan cheese", "amount": "100g", "checked": false}]'::jsonb),
        (user2_auth_id, 'Dessert Ingredients', 
         '[{"name": "Dark chocolate", "amount": "200g", "checked": false}, {"name": "Butter", "amount": "250g", "checked": false}, {"name": "Vanilla extract", "amount": "1 bottle", "checked": false}]'::jsonb);

END $$;

-- 14. Cleanup Function
CREATE OR REPLACE FUNCTION public.cleanup_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user_ids_to_delete UUID[];
BEGIN
    -- Get auth user IDs first
    SELECT ARRAY_AGG(id) INTO auth_user_ids_to_delete
    FROM auth.users
    WHERE email LIKE '%@example.com';

    -- Delete in dependency order (children first, then auth.users last)
    DELETE FROM public.shopping_lists WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.meal_plans WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.recipes WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.user_profiles WHERE id = ANY(auth_user_ids_to_delete);

    -- Delete auth.users last (after all references are removed)
    DELETE FROM auth.users WHERE id = ANY(auth_user_ids_to_delete);
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint prevents deletion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;