import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function migrateUsers() {
  try {
    console.log('Starting user migration...');

    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required Supabase environment variables');
    }

    // Read users from the JSON file
    const usersFilePath = path.join(process.cwd(), 'users.json');
    console.log('Reading users from:', usersFilePath);

    if (!fs.existsSync(usersFilePath)) {
      throw new Error('users.json file not found');
    }

    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    console.log(`Found ${usersData.length} users to migrate`);

    for (const user of usersData) {
      console.log(`Processing user: ${user.email}`);

      try {
        // Create user in Supabase
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            created_at: user.createdAt
          }
        });

        if (error) {
          console.error(`Error migrating user ${user.email}:`, error.message);
          continue;
        }

        if (!data?.user?.id) {
          console.error(`Error migrating user ${user.email}: User ID not returned from Supabase`);
          continue;
        }

        console.log(`Successfully migrated user ${user.email} with ID: ${data.user.id}`);

        // Create profile for the user
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: data.user.id,
              email: user.email,
              created_at: user.createdAt || new Date().toISOString()
            }
          ], { onConflict: 'id' });

        if (profileError) {
          console.error(`Error creating profile for ${user.email}:`, profileError.message);
          continue;
        }

        console.log(`Successfully created profile for ${user.email}`);
      } catch (error) {
        console.error(`Unexpected error migrating user ${user.email}:`, error);
      }
    }

    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateUsers(); 