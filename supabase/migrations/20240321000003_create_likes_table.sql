-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(post_id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow users to view all likes"
    ON public.likes FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to create likes"
    ON public.likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own likes"
    ON public.likes FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to get like count for a post
CREATE OR REPLACE FUNCTION public.get_post_like_count(post_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM public.likes WHERE likes.post_id = $1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get users who liked a post
CREATE OR REPLACE FUNCTION public.get_post_liked_users(post_id UUID)
RETURNS TABLE (
    user_id UUID,
    username TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT l.user_id, u.username
    FROM public.likes l
    JOIN public.users u ON l.user_id = u.id
    WHERE l.post_id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 