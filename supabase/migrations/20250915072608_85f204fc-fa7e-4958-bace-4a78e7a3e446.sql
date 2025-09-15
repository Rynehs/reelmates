-- Add privacy settings to profiles table
ALTER TABLE public.profiles 
ADD COLUMN profile_visibility text DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private'));

-- Add movie list visibility setting
ALTER TABLE public.profiles 
ADD COLUMN movie_list_visibility text DEFAULT 'public' CHECK (movie_list_visibility IN ('public', 'friends', 'private'));

-- Update RLS policies for user_movies to allow viewing based on privacy settings
DROP POLICY IF EXISTS "Users can manage their own movie lists" ON public.user_movies;

-- Create new policies for user_movies
CREATE POLICY "Users can manage their own movie lists" 
ON public.user_movies 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public movie lists" 
ON public.user_movies 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = user_movies.user_id 
    AND profiles.movie_list_visibility = 'public'
  )
);

CREATE POLICY "Friends can view friends movie lists" 
ON public.user_movies 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = user_movies.user_id 
      AND profiles.movie_list_visibility IN ('public', 'friends')
    ) AND 
    (
      EXISTS (
        SELECT 1 FROM public.user_followers 
        WHERE user_followers.follower_id = auth.uid() 
        AND user_followers.following_id = user_movies.user_id
      ) OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = user_movies.user_id 
        AND profiles.movie_list_visibility = 'public'
      )
    )
  )
);

-- Update profiles RLS to respect profile visibility
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR 
  profile_visibility = 'public' OR
  (profile_visibility = 'friends' AND 
   EXISTS (
     SELECT 1 FROM public.user_followers 
     WHERE user_followers.follower_id = auth.uid() 
     AND user_followers.following_id = profiles.id
   )
  )
);