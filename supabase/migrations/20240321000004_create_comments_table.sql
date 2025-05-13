-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(post_id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow users to view all comments"
    ON public.comments FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to create comments"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to get comment count for a post
CREATE OR REPLACE FUNCTION public.get_post_comment_count(post_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM public.comments WHERE comments.post_id = $1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get comments for a post with user info
CREATE OR REPLACE FUNCTION public.get_post_comments(post_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    username TEXT,
    user_avatar_url TEXT,
    parent_comment_id UUID,
    content TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.user_id,
        u.username,
        u.user_avatar_url,
        c.parent_comment_id,
        c.content,
        c.created_at,
        c.updated_at
    FROM public.comments c
    JOIN public.users u ON c.user_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 