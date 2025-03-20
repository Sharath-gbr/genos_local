const { createClient } = require('@supabase/supabase-js');
const Airtable = require('airtable');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

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

async function migrateRecipes() {
  try {
    console.log('Starting recipe migration...');

    // Check if environment variables are set
    if (!process.env.AIRTABLE_ACCESS_TOKEN || !process.env.AIRTABLE_BASE_ID) {
      throw new Error('Missing required Airtable environment variables');
    }

    // Fetch all records from Airtable
    console.log('Fetching recipes from Airtable...');
    const records = await base('Recipes').select().all();
    console.log(`Found ${records.length} recipes in Airtable`);

    for (const record of records) {
      const fields = record.fields;
      console.log(`Processing recipe: ${fields['Recipe Name']}`);
      
      try {
        // Transform Airtable data to match Supabase schema
        const recipe = {
          name: fields['Recipe Name'],
          image_url: fields['Dish Image']?.[0]?.url || null,
          ingredients: fields['Ingredients'],
          instructions: fields['Instructions'],
          calories: parseInt(fields['Calories']) || null,
          carbs: parseInt(fields['Carbs']) || null,
          proteins: parseInt(fields['Proteins']) || null,
          fats: parseInt(fields['Fats']) || null,
          diet_type: Array.isArray(fields['Diet Type']) ? fields['Diet Type'] : [],
          meal_type: fields['Meal Type'],
          phase: fields['Phase'],
          created_at: new Date().toISOString()
        };

        // Insert into Supabase
        const { data, error } = await supabase
          .from('recipes')
          .insert([recipe]);

        if (error) {
          console.error(`Error migrating recipe ${recipe.name}:`, error.message);
          continue;
        }

        console.log(`Successfully migrated recipe: ${recipe.name}`);
      } catch (error) {
        console.error(`Unexpected error migrating recipe ${fields['Recipe Name']}:`, error);
      }
    }

    console.log('Recipe migration completed');
  } catch (error) {
    console.error('Recipe migration failed:', error);
    process.exit(1);
  }
}

migrateRecipes(); 