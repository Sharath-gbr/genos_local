import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * This is an emergency bypass endpoint that fetches data without requiring authentication
 * It directly connects to Supabase using the service role key to bypass RLS policies
 */
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Get the email from the query parameter
  const email = req.nextUrl.searchParams.get('email');
  
  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter is required' },
      { status: 400 }
    );
  }
  
  try {
    // Direct connection with service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || ''
    );
    
    // Fetch weight logs data
    const { data: weightData, error: weightError } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('email', email)
      .order('day_of_program', { ascending: true });
      
    if (weightError) {
      console.error('Error fetching weight data:', weightError);
      return NextResponse.json(
        { error: 'Failed to fetch weight data', message: weightError.message },
        { status: 500 }
      );
    }
    
    // Process the data to create tolerance information
    const processed = {
      tolerant: {
        supplements: [] as string[],
        foods: [] as string[]
      },
      intolerant: {
        supplements: [] as string[],
        foods: [] as string[]
      }
    };
    
    // Process each row
    weightData?.forEach((row: any) => {
      const isTolerant = row.tolerant_intolerant?.toLowerCase() === 'tolerant';
      const category = isTolerant ? 'tolerant' : 'intolerant';

      // Process foods from all relevant columns
      const foodSources = [
        row.food_item_introduced,
        row.tolerant_food_items,
        row.intolerant_food_items
      ];

      foodSources.forEach(source => {
        if (source) {
          const foods = source
            .split(',')
            .map((item: string) => item.trim())
            .filter((item: string) => item);

          foods.forEach((food: string) => {
            if (!processed[category].foods.includes(food)) {
              processed[category].foods.push(food);
            }
          });
        }
      });

      // Process supplements
      if (row.supplement_introduced) {
        const supplements = row.supplement_introduced
          .split(',')
          .map((item: string) => item.trim())
          .filter((item: string) => item);

        supplements.forEach((supplement: string) => {
          if (!processed[category].supplements.includes(supplement)) {
            processed[category].supplements.push(supplement);
          }
        });
      }
    });
    
    // Sort all arrays
    processed.tolerant.supplements.sort();
    processed.tolerant.foods.sort();
    processed.intolerant.supplements.sort();
    processed.intolerant.foods.sort();
    
    return NextResponse.json({
      weightData,
      toleranceData: processed
    });
    
  } catch (error) {
    console.error('Data fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 