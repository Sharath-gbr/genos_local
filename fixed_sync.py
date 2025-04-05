#!/usr/bin/env python3
# sync.py - Main script for syncing data from Airtable to Supabase

import os
import sys
import logging
from datetime import datetime, timezone
import time
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from pyairtable import Table
from supabase import create_client, Client
from urllib.parse import urlparse

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('airtable-supabase-sync')

# Load environment variables
load_dotenv()

# Configuration from environment variables
AIRTABLE_API_KEY = os.environ.get("AIRTABLE_API_KEY")
AIRTABLE_BASE_ID = os.environ.get("AIRTABLE_BASE_ID")
AIRTABLE_TABLE_NAME = os.environ.get("AIRTABLE_TABLE_NAME", "Weight Logs")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

# Parse database URL from Supabase URL
db_url = urlparse(SUPABASE_URL.replace('https://', 'postgresql://'))
DB_HOST = db_url.hostname
DB_NAME = 'postgres'  # Supabase always uses 'postgres' as the database name
DB_USER = 'postgres'  # Service role uses 'postgres' user
DB_PASSWORD = SUPABASE_KEY
DB_PORT = '5432'  # Default PostgreSQL port

# Validate configuration
if not all([AIRTABLE_API_KEY, AIRTABLE_BASE_ID, SUPABASE_URL, SUPABASE_KEY]):
    logger.error("Missing required environment variables. Please check your .env file.")
    sys.exit(1)

def ensure_mapping_table_exists(supabase):
    """Ensure the user_mappings table exists in Supabase"""
    try:
        # Check if the table exists by making a small query
        supabase.table("user_mappings").select("id").limit(1).execute()
        logger.info("user_mappings table exists")
        return True
    except Exception as e:
        logger.warning(f"user_mappings table check failed: {e}")
        logger.warning("Please run the SQL manually to create the user_mappings table")
        return False

def get_last_sync_time(supabase):
    """Retrieve the last sync timestamp from Supabase metadata table"""
    try:
        result = supabase.table("sync_metadata").select("last_sync").eq("table_name", "weight_logs").execute()
        if result.data and len(result.data) > 0:
            return result.data[0]["last_sync"]
        return None
    except Exception as e:
        logger.warning(f"Could not retrieve last sync time: {e}")
        # If table doesn't exist, create it
        try:
            supabase.table("sync_metadata").insert({"table_name": "weight_logs", "last_sync": None}).execute()
        except:
            pass
        return None

def set_last_sync_time(supabase, timestamp):
    """Update the last sync timestamp in Supabase metadata table"""
    try:
        supabase.table("sync_metadata").upsert({
            "table_name": "weight_logs",
            "last_sync": timestamp
        }).execute()
        logger.info(f"Updated last sync time to {timestamp}")
    except Exception as e:
        logger.error(f"Failed to update last sync time: {e}")

def extract_emails_from_record(record):
    """Extract email(s) from an Airtable record, handling both string and list formats"""
    emails = set()
    email_field = record.get('fields', {}).get('Email')
    
    if isinstance(email_field, str):
        emails.add(email_field)
    elif isinstance(email_field, list):
        emails.update(email_field)
    
    return emails

def update_email_mappings(supabase_client, unique_emails):
    """Update email mappings in Supabase"""
    try:
        # Get existing mappings
        response = supabase_client.table('user_mappings').select('airtable_email,auth_email').execute()
        existing_mappings = {mapping['airtable_email']: mapping['auth_email'] for mapping in response.data}
        logging.info(f"Found {len(existing_mappings)} existing email mappings")

        # Process each unique email
        for email in unique_emails:
            if email:
                # Check users table
                user_response = supabase_client.table('users').select('id,email').eq('email', email).execute()
                if user_response.data:
                    # Found in users table, update mapping
                    if email not in existing_mappings:
                        supabase_client.table('user_mappings').upsert({
                            'airtable_email': email,
                            'auth_email': email
                        }).execute()

        logging.info(f"Email mapping update completed, processed {len(unique_emails)} emails")
    except Exception as e:
        logging.error(f"Error updating email mappings: {e}")
        raise e

def chunk_list(lst, chunk_size):
    """Split a list into smaller chunks of specified size."""
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]

def check_table_structure(supabase_client):
    """Check the actual structure of the weight_logs table and return available columns"""
    try:
        # Try to get a sample row to see available columns
        response = supabase_client.table('weight_logs').select('*').limit(1).execute()
        available_columns = set()
        if response.data:
            sample_row = response.data[0]
            logger.info("Available columns in weight_logs table:")
            for column in sample_row.keys():
                logger.info(f"- {column}")
                available_columns.add(column)
        return available_columns
    except Exception as e:
        logger.error(f"Error checking table structure: {e}")
        return set()

def transform_airtable_record(record, available_columns):
    """Transform an Airtable record to match Supabase schema"""
    fields = record.get('fields', {})
    email = fields.get('Email')
    if isinstance(email, list):
        email = email[0] if email else None
    
    # Helper function to safely convert to float
    def safe_float(value):
        if value:
            try:
                return float(value)
            except (ValueError, TypeError):
                return None
        return None
    
    # Helper function to safely convert to int
    def safe_int(value):
        if value:
            try:
                return int(value)
            except (ValueError, TypeError):
                return None
        return None
    
    # Map Airtable fields to Supabase columns (using snake_case for Supabase)
    field_mapping = {
        'airtable_id': record.get('id'),
        'email': email,
        'day_of_program': fields.get('Day of the Program'),
        'weight_recorded': safe_float(fields.get('Weight Recorded')),
        'bp_systolic': safe_int(fields.get('BP Systolic')),
        'bp_diastolic': safe_int(fields.get('BP Diastolic')),
        'blood_sugar': safe_float(fields.get('Blood Sugar')),
        'deviation': fields.get('Deviation'),
        'supplement_introduced': fields.get('Supplement Introduced'),
        'body_physiology': fields.get('Body Physiology'),
        'symptoms_observed': fields.get('Symptoms Observed'),
        'tolerant_intolerant': fields.get('Tolerant/Intolerant'),
        'chest': safe_float(fields.get('Chest')),
        'waist': safe_float(fields.get('Waist')),
        'hips': safe_float(fields.get('Hips')),
        'tolerant_food_items': fields.get('Tolerant Food Items'),
        'intolerant_food_items': fields.get('Intolerant Food Items'),
        'comments': fields.get('Comments'),
        'phase_of_program': fields.get('Phase of the Program'),
        'reason_for_diagnosing_tolerant': fields.get('Reason For Diagnosing Tolerant'),
        'client_name': fields.get('Client Name'),
        'food_item_introduced': fields.get('Food Item Introduced (Genos)'),
        'first_name': fields.get('First Name'),
        'last_name': fields.get('Last Name'),
        'last_synced': datetime.now(timezone.utc).isoformat()
    }
    
    # Only include fields that exist in the table
    transformed = {}
    for key, value in field_mapping.items():
        if key in available_columns:
            transformed[key] = value
    
    return transformed

def update_sync_metadata(supabase_client, table_name, sync_time):
    try:
        response = supabase_client.table('sync_metadata').upsert({
            'table_name': table_name,
            'last_sync': sync_time
        }, on_conflict='table_name').execute()
        return response
    except Exception as e:
        logging.error(f"Failed to update sync metadata: {e}")
        raise e

def check_user_mappings_table(supabase_client):
    """Check if user_mappings table exists"""
    try:
        response = supabase_client.table('user_mappings').select('id').limit(1).execute()
        logging.info("user_mappings table exists")
        return True
    except Exception as e:
        logging.error(f"Error checking user_mappings table: {e}")
        raise e

def get_last_sync_time(supabase_client, table_name):
    """Get the last sync time for a table"""
    try:
        response = supabase_client.table('sync_metadata').select('last_sync').eq('table_name', table_name).execute()
        if response.data:
            last_sync = response.data[0]['last_sync']
            logging.info(f"Last sync time: {last_sync}")
            return last_sync
        logging.info("No previous sync found, will sync all records")
        return None
    except Exception as e:
        logging.error(f"Error getting last sync time: {e}")
        return None

def setup_database(supabase_client):
    """Set up the database tables and schema"""
    try:
        # First, check if the table exists by trying to select from it
        try:
            supabase_client.table('weight_logs').select('*').limit(1).execute()
            logger.info("weight_logs table exists, proceeding with sync")
            return True
        except Exception as table_check_error:
            logger.warning(f"Could not access weight_logs table: {table_check_error}")
            logger.info("Please create the weight_logs table in the Supabase dashboard with the following SQL:")
            sql = """
            CREATE TABLE IF NOT EXISTS public.weight_logs (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                airtable_id TEXT UNIQUE,
                email TEXT,
                day_of_program TEXT,
                weight_recorded DECIMAL,
                food_item_introduced TEXT,
                tolerant_intolerant TEXT,
                tolerant_food_items TEXT,
                intolerant_food_items TEXT,
                supplement_introduced TEXT,
                last_synced TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_weight_logs_email ON public.weight_logs(email);
            
            ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
            
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
            
            DROP POLICY IF EXISTS "Service role can manage weight logs" ON public.weight_logs;
            CREATE POLICY "Service role can manage weight logs" 
            ON public.weight_logs 
            USING (auth.role() = 'service_role');
            """
            logger.info("\n" + sql)
            logger.info("\nPlease run this SQL in the Supabase dashboard and try again.")
            return False
            
    except Exception as e:
        logger.error(f"Error setting up database: {e}")
        raise e

def extract_unique_emails(all_records):
    """Extract unique emails from Airtable records"""
    unique_emails = set()
    for record in all_records:
        email = record['fields'].get('Email')  # Get from Airtable using 'Email' (uppercase from Airtable)
        if email:
            if isinstance(email, list):
                unique_emails.update(email)
            else:
                unique_emails.add(email)
    return unique_emails

def sync_airtable_to_supabase():
    """Main function to sync data from Airtable to Supabase"""
    try:
        # Initialize logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            name='airtable-supabase-sync'
        )
        logger = logging.getLogger('airtable-supabase-sync')

        # Log start time
        sync_time = datetime.now(timezone.utc).isoformat()
        logger.info(f"Starting sync at {sync_time}")

        # Initialize Supabase client first
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

        # Check database setup and structure
        if not setup_database(supabase_client):
            logger.error("Database setup required. Please follow the instructions above.")
            return
        
        # Get available columns
        available_columns = check_table_structure(supabase_client)
        if not available_columns:
            logger.error("Could not determine table structure")
            return

        # Check if user_mappings table exists
        check_user_mappings_table(supabase_client)

        # Get last sync time
        last_sync = get_last_sync_time(supabase_client, 'weight_logs')

        # Initialize Airtable client
        airtable = Table(AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME)

        # Get all records from Airtable
        all_records = airtable.all()
        logger.info(f"Found {len(all_records)} records to sync")

        # Extract unique emails - use a dedicated function
        unique_emails = extract_unique_emails(all_records)
        logger.info(f"Found {len(unique_emails)} unique emails in Airtable data\n")

        # Update email mappings
        update_email_mappings(supabase_client, unique_emails)

        # Process records in batches
        batch_size = 50
        for i in range(0, len(all_records), batch_size):
            batch = all_records[i:i + batch_size]
            transformed_records = []
            
            for record in batch:
                transformed_record = transform_airtable_record(record, available_columns)
                transformed_records.append(transformed_record)

            try:
                response = supabase_client.table('weight_logs').upsert(
                    transformed_records,
                    on_conflict='airtable_id'
                ).execute()
                logger.info(f"Successfully upserted {len(transformed_records)} records")
            except Exception as e:
                logger.error(f"Insert failed with error: {e}")
                raise e

        # Update sync metadata
        update_sync_metadata(supabase_client, 'weight_logs', sync_time)
        logger.info(f"Sync completed successfully at {datetime.now(timezone.utc).isoformat()}")
        
    except Exception as e:
        logger.error(f"Script failed: {e}")
        raise e

if __name__ == "__main__":
    sync_airtable_to_supabase() 