import { getAirtableRecords } from '@/lib/airtable';

export async function GET(request: Request) {
  try {
    const records = await getAirtableRecords({
      tableName: 'Recipes',
      view: 'Grid View',
    });

    return Response.json({ data: records });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return Response.json(
      { error: 'Failed to fetch recipes' }, 
      { status: 500 }
    );
  }
} 