#!/usr/bin/env python3
# new_migrations.py - Script to set up database tables and permissions for email mapping

import os
import sys
import logging
from dotenv import load_dotenv
from supabase import create_client

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('airtable-supabase-migrations')

# Load environment variables
load_dotenv()

# Configuration from environment variables
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

# Print environment variables
print(f"SUPABASE_URL: {SUPABASE_URL}")
print(f"SUPABASE_KEY: {'*****' + SUPABASE_KEY[-4:] if SUPABASE_KEY else None}")

if not all([SUPABASE_URL, SUPABASE_KEY]):
    logger.error("Missing required environment variables. Please check your .env file.")
    sys.exit(1)

def create_tables_manually():
    """Generate SQL for creating tables manually"""
    
    sql = """
-- Create user_mappings table
CREATE TABLE IF NOT EXISTS public.user_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    airtable_email TEXT NOT NULL,
    auth_email TEXT NOT NULL,
    auto_matched BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(airtable_email, auth_email)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_mappings_airtable_email 
ON public.user_mappings(airtable_email);

CREATE INDEX IF NOT EXISTS idx_user_mappings_auth_email 
ON public.user_mappings(auth_email);

-- Set up RLS (Row Level Security)
ALTER TABLE public.user_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow authenticated users to read only their own mappings
DROP POLICY IF EXISTS "Users can read their own mappings" ON public.user_mappings;
CREATE POLICY "Users can read their own mappings" 
ON public.user_mappings FOR SELECT 
USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE email = auth_email
));

-- Only allow service role to insert/update/delete
DROP POLICY IF EXISTS "Service role can manage all mappings" ON public.user_mappings;
CREATE POLICY "Service role can manage all mappings" 
ON public.user_mappings 
USING (auth.role() = 'service_role');

-- Create sync_metadata table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sync_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT UNIQUE NOT NULL,
    last_sync TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set RLS for sync_metadata
ALTER TABLE public.sync_metadata ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage sync_metadata
DROP POLICY IF EXISTS "Service role can manage sync metadata" ON public.sync_metadata;
CREATE POLICY "Service role can manage sync metadata" 
ON public.sync_metadata 
USING (auth.role() = 'service_role');
"""

    print("\n=== SQL FOR MANUAL EXECUTION ===")
    print(sql)
    print("================================")
    print("Please copy the SQL above and execute it in the Supabase SQL Editor.")
    print("1. Go to Supabase Dashboard")
    print("2. Select your project")
    print("3. Go to SQL Editor")
    print("4. Paste the SQL")
    print("5. Click 'Run'")
    
    return sql

def check_tables(supabase):
    """Check if the tables exist in Supabase"""
    
    try:
        print("Checking if user_mappings table exists...")
        # Try to query user_mappings
        result = supabase.table("user_mappings").select("id").limit(1).execute()
        print("user_mappings table exists!")
        
        print("Checking if sync_metadata table exists...")
        # Try to query sync_metadata
        result = supabase.table("sync_metadata").select("id").limit(1).execute()
        print("sync_metadata table exists!")
        
        return True
    except Exception as e:
        print(f"Error checking tables: {e}")
        print("Tables may not exist. Please run the SQL manually.")
        return False

def run_migrations():
    """Run database migrations to set up tables and permissions"""
    try:
        print("Initializing Supabase client...")
        # Initialize Supabase client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Supabase client initialized successfully")
        
        # First check if tables exist
        print("Checking if tables exist...")
        tables_exist = check_tables(supabase)
        
        # Generate SQL for manual execution
        sql = create_tables_manually()
        
        if tables_exist:
            print("Migration completed - tables already exist.")
        else:
            print("Tables don't exist. Please execute the SQL manually as shown above.")
            print("After executing the SQL, run this script again to verify the tables were created correctly.")
        
    except Exception as e:
        print(f"Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    print("Starting migration script...")
    run_migrations()
    print("Migration script completed.") 