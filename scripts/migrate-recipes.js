import { createClient } from '@supabase/supabase-js';
import Airtable from 'airtable';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

// Initialize Airtable
const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_ACCESS_TOKEN
});

const base = airtable.base(process.env.AIRTABLE_BASE_ID);

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('recipes').select('count').limit(1);
    if (error) throw error;
    console.log('Successfully connected to Supabase');
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    throw error;
  }
}

async function migrateRecipes() {
  try {
    console.log('Starting recipe migration...');

    // Check if environment variables are set
    if (!process.env.AIRTABLE_ACCESS_TOKEN || !process.env.AIRTABLE_BASE_ID) {
      throw new Error('Missing required Airtable environment variables');
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required Supabase environment variables');
    }

    // Test Supabase connection before proceeding
    await testSupabaseConnection();

    // Fetch all records from Airtable
    console.log('Fetching recipes from Airtable...');
    const records = await base('Recipes').select().all();
    console.log(`Found ${records.length} recipes in Airtable`);

    let successCount = 0;
    let errorCount = 0;

    for (const record of records) {
      const fields = record.fields;
      console.log(`\nProcessing recipe: ${fields['Recipe Name']}`);
      
      try {
        // Validate required fields
        if (!fields['Recipe Name']) {
          console.error('Recipe name is required, skipping record');
          errorCount++;
          continue;
        }

        // Transform and validate diet type
        let dietType = [];
        if (fields['Diet Type']) {
          dietType = Array.isArray(fields['Diet Type']) 
            ? fields['Diet Type'] 
            : [fields['Diet Type']];
        }

        // Transform and validate meal type
        let mealType = null;
        if (fields['Meal Type']) {
          mealType = Array.isArray(fields['Meal Type']) 
            ? fields['Meal Type'][0] 
            : fields['Meal Type'];
        }

        // Handle ingredients - convert array to string
        let ingredients = '';
        if (fields['Ingredients']) {
          if (Array.isArray(fields['Ingredients'])) {
            ingredients = fields['Ingredients']
              .map(ingredient => {
                // Add a bullet point if not already there
                const trimmed = ingredient.trim();
                return trimmed.startsWith('-') ? trimmed : `- ${trimmed}`;
              })
              .join('\n');
          } else {
            // Split by any delimiter (commas, newlines) and format consistently
            ingredients = fields['Ingredients']
              .toString()
              .split(/[,\n]/)
              .map(ingredient => {
                const trimmed = ingredient.trim();
                if (!trimmed) return '';
                return trimmed.startsWith('-') ? trimmed : `- ${trimmed}`;
              })
              .filter(Boolean)
              .join('\n');
          }
        }

        // Handle instructions - convert array to string
        let instructions = '';
        if (fields['Instructions']) {
          if (Array.isArray(fields['Instructions'])) {
            instructions = fields['Instructions'].join('\n');
          } else {
            instructions = fields['Instructions'].toString();
          }
        }

        // Transform Airtable data to match Supabase schema
        const recipe = {
          name: fields['Recipe Name'].trim(),
          image_url: fields['Dish Image']?.[0]?.url || null,
          ingredients: ingredients,
          instructions: instructions,
          calories: fields['Calories'] ? parseInt(fields['Calories'].toString()) : null,
          carbs: fields['Carbs'] ? parseInt(fields['Carbs'].toString()) : null,
          proteins: fields['Proteins'] ? parseInt(fields['Proteins'].toString()) : null,
          fats: fields['Fats'] ? parseInt(fields['Fats'].toString()) : null,
          diet_type: dietType,
          meal_type: mealType,
          phase: fields['Phase'] || null,
          created_at: new Date().toISOString()
        };

        // Validate numeric fields are not NaN
        if (isNaN(recipe.calories)) recipe.calories = null;
        if (isNaN(recipe.carbs)) recipe.carbs = null;
        if (isNaN(recipe.proteins)) recipe.proteins = null;
        if (isNaN(recipe.fats)) recipe.fats = null;

        // Log the recipe data being sent to Supabase
        console.log(`Attempting to insert recipe: ${recipe.name}`);
        console.log('Recipe data:', JSON.stringify(recipe, null, 2));

        // Insert into Supabase
        console.log('Inserting recipe into Supabase...');
        const { data, error } = await supabase
          .from('recipes')
          .insert([recipe])
          .select();

        if (error) {
          console.error(`Error migrating recipe ${recipe.name}:`, {
            message: error.message || 'Unknown error',
            details: error.details || 'No details available',
            hint: error.hint || 'No hint available',
            code: error.code || 'No error code available',
            error: JSON.stringify(error)
          });
          errorCount++;
          continue;
        }

        if (!data || data.length === 0) {
          console.error(`No data returned after inserting recipe ${recipe.name}`);
          errorCount++;
          continue;
        }

        console.log(`Successfully migrated recipe: ${recipe.name}`);
        successCount++;
      } catch (error) {
        console.error(`Unexpected error migrating recipe ${fields['Recipe Name']}:`, {
          message: error.message || 'Unknown error',
          stack: error.stack || 'No stack trace available',
          error: JSON.stringify(error)
        });
        errorCount++;
      }
    }

    console.log('\nRecipe migration completed');
    console.log(`Successfully migrated: ${successCount} recipes`);
    console.log(`Failed to migrate: ${errorCount} recipes`);
    console.log(`Total recipes processed: ${records.length}`);

    if (errorCount > 0) {
      console.log('\nSome recipes failed to migrate. Please check the error logs above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Recipe migration failed:', {
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace available'
    });
    process.exit(1);
  }
}

migrateRecipes(); 