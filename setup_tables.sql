-- First, drop all existing tables and related objects
DROP TABLE IF EXISTS public.weight_logs CASCADE;
DROP TABLE IF EXISTS public.user_mappings CASCADE;
DROP TABLE IF EXISTS public.sync_metadata CASCADE;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create weight_logs table with snake_case column names
CREATE TABLE public.weight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    airtable_id TEXT UNIQUE,
    email TEXT,  -- Changed back to simple 'email' to match Supabase conventions
    day_of_program TEXT,
    weight_recorded DECIMAL,
    food_item_introduced TEXT,
    tolerant_intolerant TEXT,
    tolerant_food_items TEXT,
    last_synced TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_mappings table
CREATE TABLE public.user_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    airtable_email TEXT NOT NULL,
    auth_email TEXT NOT NULL,
    auto_matched BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(airtable_email, auth_email)
);

-- Create sync_metadata table
CREATE TABLE public.sync_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT UNIQUE NOT NULL,
    last_sync TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_weight_logs_email ON public.weight_logs(email);
CREATE INDEX idx_user_mappings_airtable_email ON public.user_mappings(airtable_email);
CREATE INDEX idx_user_mappings_auth_email ON public.user_mappings(auth_email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for weight_logs
DROP POLICY IF EXISTS "Users can view their own weight logs" ON public.weight_logs;
CREATE POLICY "Users can view their own weight logs" 
ON public.weight_logs FOR SELECT 
USING (
    auth.uid() IN (
        SELECT id FROM auth.users WHERE 
        email = weight_logs.email 
        OR 
        auth.uid() IN (
            SELECT id FROM auth.users WHERE 
            email IN (
                SELECT auth_email FROM user_mappings 
                WHERE airtable_email = weight_logs.email
            )
        )
    )
);

-- Create policies for user_mappings
DROP POLICY IF EXISTS "Users can read their own mappings" ON public.user_mappings;
CREATE POLICY "Users can read their own mappings" 
ON public.user_mappings FOR SELECT 
USING (
    auth.uid() IN (
        SELECT id FROM auth.users 
        WHERE email = auth_email
    )
);

-- Only allow service role to insert/update/delete mappings
DROP POLICY IF EXISTS "Service role can manage all mappings" ON public.user_mappings;
CREATE POLICY "Service role can manage all mappings" 
ON public.user_mappings 
USING (auth.role() = 'service_role');

-- Only allow service role to manage sync_metadata
DROP POLICY IF EXISTS "Service role can manage sync metadata" ON public.sync_metadata;
CREATE POLICY "Service role can manage sync metadata" 
ON public.sync_metadata 
USING (auth.role() = 'service_role');

-- Only allow service role to insert/update weight_logs
DROP POLICY IF EXISTS "Service role can manage weight logs" ON public.weight_logs;
CREATE POLICY "Service role can manage weight logs" 
ON public.weight_logs 
USING (auth.role() = 'service_role');

-- Notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema'; 