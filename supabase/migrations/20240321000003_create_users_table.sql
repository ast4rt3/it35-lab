-- Drop existing table if it exists
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    user_firstname TEXT,
    user_lastname TEXT,
    user_avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow users to view all users" ON users;
CREATE POLICY "Allow users to view all users" ON users
    FOR SELECT USING (true);

-- Allow anyone to insert during registration
DROP POLICY IF EXISTS "Allow users to insert their own record" ON users;
CREATE POLICY "Allow users to insert their own record" ON users
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to update their own record" ON users;
CREATE POLICY "Allow users to update their own record" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Allow service role to manage users
DROP POLICY IF EXISTS "Allow service role to manage users" ON users;
CREATE POLICY "Allow service role to manage users" ON users
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 