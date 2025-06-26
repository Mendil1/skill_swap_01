-- Create the ratings table
CREATE TABLE public.ratings (
  rating_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(user_id),
  rater_id UUID NOT NULL REFERENCES public.users(user_id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_rating UNIQUE (user_id, rater_id)
);

-- RLS policy for ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ratings for any user" 
ON public.ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can only insert their own rating" 
ON public.ratings 
FOR INSERT 
WITH CHECK (auth.uid() = rater_id);
