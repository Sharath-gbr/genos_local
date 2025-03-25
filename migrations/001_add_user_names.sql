-- Add first_name and last_name columns to auth.users
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text;

-- Create a function to sync user metadata to columns
CREATE OR REPLACE FUNCTION sync_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Update first_name and last_name from raw_user_meta_data
    NEW.first_name = (NEW.raw_user_meta_data->>'first_name')::text;
    NEW.last_name = (NEW.raw_user_meta_data->>'last_name')::text;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically sync metadata on insert or update
DROP TRIGGER IF EXISTS sync_user_metadata_trigger ON auth.users;
CREATE TRIGGER sync_user_metadata_trigger
    BEFORE INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_metadata();

-- Sync existing users
UPDATE auth.users
SET 
    first_name = (raw_user_meta_data->>'first_name')::text,
    last_name = (raw_user_meta_data->>'last_name')::text
WHERE raw_user_meta_data->>'first_name' IS NOT NULL
   OR raw_user_meta_data->>'last_name' IS NOT NULL; 