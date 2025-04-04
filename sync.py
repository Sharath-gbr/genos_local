#!/usr/bin/env python3
# sync.py - Main script for syncing data from Airtable to Supabase

import os
import sys
import logging
from datetime import datetime
import time
from dotenv import load_dotenv
from pyairtable import Table
from supabase import create_client, Client

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
        # Table likely doesn't exist, let's try to create it via SQL
        # Note: This requires service role key permissions
        try:
            sql = """
            CREATE TABLE IF NOT EXISTS user_mappings (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                airtable_email TEXT NOT NULL,
                auth_email TEXT NOT NULL,
                auto_matched BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(airtable_email, auth_email)
            );
            """
            supabase.rpc("queries", {"query": sql}).execute()
            logger.info("Created user_mappings table")
            return True
        except Exception as create_err:
            logger.error(f"Failed to create user_mappings table: {create_err}")
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

def transform_airtable_record(record):
    """Transform an Airtable record to Supabase format"""
    fields = record["fields"]
    
    # Map fields appropriately
    supabase_record = {
        "airtable_id": record["id"],
        "Email": fields.get("Email"),
        "Day of the Program": fields.get("Day of the Program"),
        "Weight Recorded": fields.get("Weight"),
        "Food Item Introduced (Genos)": fields.get("Food Item"),
        "Tolerant/Intolerant": fields.get("Tolerance Status"),
        "Tolerant Food Items": fields.get("Tolerant Foods"),
        # Add any other fields that need to be synced
        "last_synced": datetime.now().isoformat()
    }
    
    return supabase_record

def update_email_mappings(supabase, airtable_emails):
    """Update the user_mappings table with any auto-matchable emails"""
    if not airtable_emails:
        logger.warning("No Airtable emails to process for mapping")
        return
    
    # Get list of existing mappings to avoid duplicates
    existing_mappings = {}
    try:
        result = supabase.table("user_mappings").select("airtable_email, auth_email").execute()
        if result.data:
            for mapping in result.data:
                existing_mappings[mapping['airtable_email']] = mapping['auth_email']
        logger.info(f"Found {len(existing_mappings)} existing email mappings")
    except Exception as e:
        logger.error(f"Error retrieving existing mappings: {e}")
    
    # Batch size for auth lookups to avoid rate limits
    BATCH_SIZE = 10
    processed = 0
    total_emails = len(airtable_emails)
    
    while processed < total_emails:
        batch = list(airtable_emails)[processed:processed+BATCH_SIZE]
        processed += len(batch)
        
        for airtable_email in batch:
            # Skip if we already have a mapping for this email
            if airtable_email in existing_mappings:
                continue
                
            try:
                # Check if this email exists as an auth account
                # Note: We're using a direct SQL query here as admin.list_users might not be accessible
                result = supabase.from_("users").select("id, email").eq("email", airtable_email).execute()
                
                if result.data and len(result.data) > 0:
                    auth_email = result.data[0]["email"]
                    # This email exists in both systems - create automatic mapping
                    supabase.table("user_mappings").upsert({
                        "airtable_email": airtable_email,
                        "auth_email": auth_email,
                        "auto_matched": True,
                        "created_at": datetime.now().isoformat()
                    }).execute()
                    logger.info(f"Created automatic mapping for email: {airtable_email}")
            except Exception as e:
                logger.warning(f"Error checking auth status for {airtable_email}: {e}")
        
        # Brief pause to avoid rate limits
        time.sleep(0.5)
    
    logger.info(f"Email mapping update completed, processed {total_emails} emails")

def sync_airtable_to_supabase():
    """Main function to sync data from Airtable to Supabase"""
    logger.info(f"Starting sync at {datetime.now().isoformat()}")
    
    start_time = time.time()
    
    try:
        # Initialize clients
        airtable = Table(AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME)
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Ensure mapping table exists
        if not ensure_mapping_table_exists(supabase):
            logger.error("Could not create or verify user_mappings table. Continuing with sync only.")
        
        # Get last sync time
        last_sync = get_last_sync_time(supabase)
        if last_sync:
            logger.info(f"Last sync time: {last_sync}")
        else:
            logger.info("No previous sync found, will sync all records")
        
        # Fetch records from Airtable
        # Note: Adjust the formula based on how Airtable tracks modifications
        if last_sync:
            # This is a simplified approach - adjust according to Airtable's API
            # You might need to use a different field for modification tracking
            formula = f"LAST_MODIFIED_TIME() > '{last_sync}'"
            try:
                records = airtable.all(formula=formula)
            except Exception as e:
                logger.error(f"Error with formula query: {e}")
                records = airtable.all()
        else:
            records = airtable.all()
        
        logger.info(f"Found {len(records)} records to sync")
        
        # Collect all Airtable emails for mapping
        airtable_emails = set()
        for record in records:
            email = record["fields"].get("Email")
            if email:
                # Handle case where email might be a list
                if isinstance(email, list):
                    for single_email in email:
                        if single_email and isinstance(single_email, str):
                            airtable_emails.add(single_email)
                elif isinstance(email, str):
                    airtable_emails.add(email)
        
        logger.info(f"Found {len(airtable_emails)} unique emails in Airtable data")
        
        # Update email mappings
        update_email_mappings(supabase, airtable_emails)
        
        # Transform Airtable records to Supabase format
        if not records:
            logger.info("No new records to sync")
            set_last_sync_time(supabase, datetime.now().isoformat())
            return
        
        # Process in batches to avoid API limits
        BATCH_SIZE = 100
        processed = 0
        total_records = len(records)
        
        while processed < total_records:
            batch = records[processed:processed+BATCH_SIZE]
            supabase_records = [transform_airtable_record(record) for record in batch]
            
            # Upsert records to Supabase - using airtable_id as the match key
            result = supabase.table("weight_logs").upsert(supabase_records).execute()
            
            logger.info(f"Upserted batch of {len(batch)} records to Supabase")
            processed += len(batch)
            
            # Brief pause to avoid rate limits
            time.sleep(0.5)
        
        # Update last sync time
        current_time = datetime.now().isoformat()
        set_last_sync_time(supabase, current_time)
        
        elapsed_time = time.time() - start_time
        logger.info(f"Sync completed at {datetime.now().isoformat()}. Total time: {elapsed_time:.2f} seconds")
        
    except Exception as e:
        logger.error(f"Sync failed: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    try:
        sync_airtable_to_supabase()
    except Exception as e:
        logger.error(f"Script failed: {e}")
        sys.exit(1) 