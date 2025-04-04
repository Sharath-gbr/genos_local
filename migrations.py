#!/usr/bin/env python3
# migrations.py - Script to set up database tables and permissions for email mapping

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

    logger.info("=== SQL FOR MANUAL EXECUTION ===")
    print("\n" + sql)
    logger.info("================================")
    logger.info("Please copy the SQL above and execute it in the Supabase SQL Editor.")
    logger.info("1. Go to Supabase Dashboard")
    logger.info("2. Select your project")
    logger.info("3. Go to SQL Editor")
    logger.info("4. Paste the SQL")
    logger.info("5. Click 'Run'")
    
    return sql

def check_tables(supabase):
    """Check if the tables exist in Supabase"""
    
    try:
        # Try to query user_mappings
        result = supabase.table("user_mappings").select("id").limit(1).execute()
        logger.info("user_mappings table exists!")
        
        # Try to query sync_metadata
        result = supabase.table("sync_metadata").select("id").limit(1).execute()
        logger.info("sync_metadata table exists!")
        
        return True
    except Exception as e:
        logger.warning(f"Error checking tables: {e}")
        logger.info("Tables may not exist. Please run the SQL manually.")
        return False

def run_migrations():
    """Run database migrations to set up tables and permissions"""
    try:
        # Initialize Supabase client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # First check if tables exist
        tables_exist = check_tables(supabase)
        
        # Generate SQL for manual execution
        sql = create_tables_manually()
        
        if tables_exist:
            logger.info("Migration completed - tables already exist.")
        else:
            logger.warning("Tables don't exist. Please execute the SQL manually as shown above.")
            logger.info("After executing the SQL, run this script again to verify the tables were created correctly.")
        
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    run_migrations() 