import { airtableBase } from '@/lib/airtable';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Please log in to access recipes' },
        { status: 401 }
      );
    }

    const records = await airtableBase('Recipes').select({
      fields: [
        'Recipe Name',
        'Dish Image',
        'Ingredients',
        'Instructions',
        'Calories',
        'Carbs',
        'Proteins',
        'Fats',
        'Diet Type',
        'Meal Type',
        'Phase',
        'Protein/Non-Protein Meal'
      ]
    }).all();
    
    const recipes = records.map(record => {
      // Log raw data for debugging
      console.log('Raw record data:', {
        name: record.fields['Recipe Name'],
        dietType: record.fields['Diet Type'],
        mealType: record.fields['Meal Type'],
        phase: {
          rawValue: record.fields['Phase'],
          type: typeof record.fields['Phase'],
          isArray: Array.isArray(record.fields['Phase'])
        },
        proteinMeal: record.fields['Protein/Non-Protein Meal'],
        type: typeof record.fields['Protein/Non-Protein Meal']
      });

      const imageField = record.fields['Dish Image'];
      let imageUrl = '';

      // Handle different possible formats of the image field
      if (Array.isArray(imageField) && imageField[0]?.url) {
        imageUrl = imageField[0].url;
      } else if (Array.isArray(imageField)) {
        imageUrl = imageField[0];
      } else if (typeof imageField === 'object' && imageField?.url) {
        imageUrl = imageField.url;
      } else if (typeof imageField === 'string') {
        imageUrl = imageField;
      }

      // Process phase field
      let phase = '';
      const phaseField = record.fields['Phase'];
      if (Array.isArray(phaseField)) {
        phase = phaseField[0] || '';
      } else if (typeof phaseField === 'string') {
        phase = phaseField;
      }

      // Process protein meal field
      let proteinMealType = '';
      const proteinMealField = record.fields['Protein/Non-Protein Meal'];
      if (Array.isArray(proteinMealField)) {
        proteinMealType = proteinMealField[0] || '';
      } else if (typeof proteinMealField === 'string') {
        proteinMealType = proteinMealField;
      }

      // Log processed data for debugging
      const processedRecipe = {
        id: record.id,
        name: record.fields['Recipe Name'] || '',
        image: imageUrl,
        ingredients: record.fields['Ingredients'] ? String(record.fields['Ingredients']).split('\n').map(i => i.trim().replace(/^[-–—]/, '').trim()).filter(i => i) : [],
        instructions: record.fields['Instructions'] || '',
        calories: record.fields['Calories'] || 0,
        carbs: record.fields['Carbs'] || 0,
        proteins: record.fields['Proteins'] || 0,
        fats: record.fields['Fats'] || 0,
        dietType: Array.isArray(record.fields['Diet Type']) ? record.fields['Diet Type'] : [record.fields['Diet Type'] || ''],
        mealType: Array.isArray(record.fields['Meal Type']) ? record.fields['Meal Type'][0] : (record.fields['Meal Type'] || ''),
        phase: phase,
        proteinMealType: proteinMealType
      };

      console.log('Processed recipe:', {
        name: processedRecipe.name,
        proteinMealType: processedRecipe.proteinMealType
      });

      return processedRecipe;
    });

    // Log the processed data
    console.log('First processed recipe:', recipes[0]);

    return NextResponse.json(recipes);

  } catch (error) {
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      data: error
    });
    return NextResponse.json(
      { error: 'Failed to fetch recipes. Please try again later.' },
      { status: 500 }
    );
  }
} 