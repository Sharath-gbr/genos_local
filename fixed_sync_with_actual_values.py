import logging
import os
import datetime
import time
from dotenv import load_dotenv
import requests
from supabase import create_client, Client
import json

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger('airtable-supabase-sync')

# Environment variables
AIRTABLE_API_KEY = os.getenv('AIRTABLE_API_KEY')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID')
AIRTABLE_TABLE_NAME = os.getenv('AIRTABLE_TABLE_NAME')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
SUPABASE_TABLE_NAME = os.getenv('SUPABASE_TABLE_NAME', 'weight_logs')

# Connect to Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_airtable_records():
    """Get records from Airtable with text values for linked fields"""
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"
    
    params = {
        "cellFormat": "string",  # Request string values instead of IDs for linked records
        "timeZone": "America/New_York",
        "userLocale": "en-us"
    }
    
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    all_records = []
    offset = None
    
    while True:
        if offset:
            params['offset'] = offset
            
        response = requests.get(url, params=params, headers=headers)
        
        if response.status_code != 200:
            logger.error(f"Error getting records from Airtable: {response.text}")
            raise Exception(f"Failed to get records from Airtable: {response.text}")
            
        data = response.json()
        all_records.extend(data.get('records', []))
        
        logger.info(f"Fetched {len(data.get('records', []))} records from Airtable")
        
        # Check if there are more records
        offset = data.get('offset')
        if not offset:
            break
            
    logger.info(f"Total records fetched from Airtable: {len(all_records)}")
    return all_records

def check_table_exists(table_name):
    """Check if the table exists in Supabase"""
    try:
        result = supabase.table(table_name).select("id").limit(1).execute()
        return True
    except Exception as e:
        logger.error(f"Error checking if table exists: {e}")
        return False

def get_column_names(table_name):
    """Get column names from the Supabase table"""
    try:
        # Try to get at least one record to see column names
        result = supabase.table(table_name).select("*").limit(1).execute()
        if result.data:
            return list(result.data[0].keys())
        
        # If no data, we need to manually specify the columns
        # First check if we have a setup_tables.sql file with table definitions
        logger.info("Table exists but no data yet. Using columns from setup_tables.sql")
        with open("setup_tables.sql", "r") as f:
            sql = f.read()
            
        # Extract column names from the CREATE TABLE statement for the given table
        import re
        pattern = f"CREATE TABLE.*?{table_name}\\s*\\(([^;]+)\\)"
        match = re.search(pattern, sql, re.DOTALL | re.IGNORECASE)
        
        if match:
            columns_text = match.group(1)
            # Extract column names - this is a simple approach
            columns = []
            for line in columns_text.split('\n'):
                line = line.strip()
                if line and not line.startswith('PRIMARY KEY') and not line.startswith('CONSTRAINT'):
                    column_name = line.split()[0].replace('"', '')
                    if column_name and column_name not in ['id']:  # Skip id column
                        columns.append(column_name)
            return columns
            
        # If we can't find the table definition, use a default set of columns
        return [
            "day_of_program", "deviation", "intolerant_food_items", "chest", 
            "food_item_introduced", "phase_of_program", "blood_sugar", "email", 
            "last_synced", "bp_systolic", "last_name", "tolerant_food_items", 
            "bp_diastolic", "symptoms_observed", "comments", "client_name", 
            "waist", "tolerant_intolerant", "supplement_introduced", "airtable_id", 
            "first_name", "reason_for_diagnosing_tolerant", "weight_recorded", 
            "hips", "body_physiology"
        ]
    except Exception as e:
        logger.error(f"Error getting column names: {e}")
        # Return a default set of columns
        return [
            "day_of_program", "deviation", "intolerant_food_items", "chest", 
            "food_item_introduced", "phase_of_program", "blood_sugar", "email", 
            "last_synced", "bp_systolic", "last_name", "tolerant_food_items", 
            "bp_diastolic", "symptoms_observed", "comments", "client_name", 
            "waist", "tolerant_intolerant", "supplement_introduced", "airtable_id", 
            "first_name", "reason_for_diagnosing_tolerant", "weight_recorded", 
            "hips", "body_physiology"
        ]

def create_or_update_email_mappings(records):
    """Create or update email mappings"""
    # Check if user_mappings table exists
    try:
        result = supabase.table("user_mappings").select("id").limit(1).execute()
        logging.getLogger().info("user_mappings table exists")
    except Exception as e:
        logger.error(f"user_mappings table doesn't exist: {e}")
        return
    
    # Get all email addresses from Airtable
    airtable_emails = []
    for record in records:
        email = record['fields'].get('Email')
        if email:
            airtable_emails.append(email)
    
    airtable_emails = list(set(airtable_emails))  # Get unique emails
    logger.info(f"Found {len(airtable_emails)} unique emails in Airtable data\n")
    
    # Get existing email mappings
    result = supabase.table("user_mappings").select("airtable_email,auth_email").execute()
    existing_mappings = {mapping["airtable_email"]: mapping["auth_email"] for mapping in result.data}
    logging.getLogger().info(f"Found {len(existing_mappings)} existing email mappings")
    
    # Add new emails to the mapping table
    new_mappings_count = 0
    for email in airtable_emails:
        if email not in existing_mappings:
            # Check if the user exists in the auth system
            user_result = supabase.table("users").select("id,email").eq("email", email).execute()
            if user_result.data:
                # User exists, create mapping
                supabase.table("user_mappings").insert({
                    "airtable_email": email,
                    "auth_email": email
                }).execute()
                new_mappings_count += 1
    
    logging.getLogger().info(f"Email mapping update completed, processed {len(airtable_emails)} emails")

def get_last_sync_time():
    """Get the last sync time for the given table"""
    try:
        result = supabase.table("sync_metadata").select("last_sync").eq("table_name", SUPABASE_TABLE_NAME).execute()
        if result.data:
            return result.data[0]["last_sync"]
        else:
            logging.getLogger().info("No previous sync found, will sync all records")
            return None
    except Exception as e:
        logger.error(f"Error getting last sync time: {e}")
        return None

def update_last_sync_time(sync_time):
    """Update the last sync time for the given table"""
    try:
        # Use upsert to handle both insert and update cases
        supabase.table("sync_metadata").upsert(
            {"table_name": SUPABASE_TABLE_NAME, "last_sync": sync_time.isoformat()},
            on_conflict="table_name"
        ).execute()
    except Exception as e:
        logger.error(f"Error updating last sync time: {e}")

def transform_to_snake_case(name):
    """Transform field name to snake_case"""
    # Convert spaces and dashes to underscores, make lowercase
    return name.lower().replace(' ', '_').replace('-', '_')

def sync_data():
    """Sync data from Airtable to Supabase"""
    logger.info(f"Starting sync at {datetime.datetime.now().isoformat()}")
    
    # Check if the table exists
    if not check_table_exists(SUPABASE_TABLE_NAME):
        logger.error(f"Table {SUPABASE_TABLE_NAME} does not exist in Supabase")
        return
    else:
        logger.info(f"{SUPABASE_TABLE_NAME} table exists, proceeding with sync")
    
    # Get column names
    column_names = get_column_names(SUPABASE_TABLE_NAME)
    
    # Get records from Airtable
    airtable_records = get_airtable_records()
    logger.info(f"Found {len(airtable_records)} records to sync")
    
    # Create or update email mappings
    create_or_update_email_mappings(airtable_records)
    
    # Get the last sync time
    last_sync = get_last_sync_time()
    
    # Transform and upsert records
    batch_size = 50
    record_batches = [airtable_records[i:i + batch_size] for i in range(0, len(airtable_records), batch_size)]
    
    for batch in record_batches:
        transformed_records = []
        for record in batch:
            transformed_record = {
                "airtable_id": record["id"],
                "last_synced": datetime.datetime.now().isoformat()
            }
            
            # Transform field names to snake_case for Supabase
            for field_name, value in record["fields"].items():
                snake_case_name = transform_to_snake_case(field_name)
                transformed_record[snake_case_name] = value
            
            transformed_records.append(transformed_record)
        
        # Upsert records
        if transformed_records:
            # Only include columns that exist in the table
            for record in transformed_records:
                for key in list(record.keys()):
                    if key not in column_names and key != "airtable_id" and key != "last_synced":
                        del record[key]
            
            try:
                result = supabase.table(SUPABASE_TABLE_NAME).upsert(
                    transformed_records, 
                    on_conflict="airtable_id"
                ).execute()
                logger.info(f"Successfully upserted {len(transformed_records)} records")
            except Exception as e:
                logger.error(f"Error upserting records: {e}")
    
    # Update the last sync time
    update_last_sync_time(datetime.datetime.now())
    logger.info(f"Sync completed successfully at {datetime.datetime.now().isoformat()}")

if __name__ == "__main__":
    sync_data() 