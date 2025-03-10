import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// Log environment variables (without exposing sensitive values)
console.log('Medical Conditions API - Environment check:', {
  hasToken: !!process.env.AIRTABLE_ACCESS_TOKEN,
  hasBaseId: !!process.env.AIRTABLE_BASE_ID,
  tableName: process.env.AIRTABLE_TABLE_NAME
});

const base = new Airtable({
  apiKey: process.env.AIRTABLE_ACCESS_TOKEN
}).base(process.env.AIRTABLE_BASE_ID!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  try {
    const email = searchParams.get('email');
    console.log('1. Email parameter:', email);

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('2. Attempting to fetch medical conditions for:', email);

    // Query Airtable for the medical conditions
    const records = await base(process.env.AIRTABLE_TABLE_NAME!)
      .select({
        filterByFormula: `{email} = '${email}'`,
        maxRecords: 1
      })
      .firstPage();

    console.log('3. Query completed, records found:', records?.length);

    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const record = records[0];
    const fields = record.fields;
    
    // Log all available fields and their values
    console.log('4. All available fields and values:', JSON.stringify(fields, null, 2));

    // Return all fields in response for debugging
    return NextResponse.json({
      fields: fields
    });

  } catch (error) {
    console.error('Error in medical conditions API:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      email: searchParams.get('email'),
      airtableConfig: {
        hasToken: !!process.env.AIRTABLE_ACCESS_TOKEN,
        hasBaseId: !!process.env.AIRTABLE_BASE_ID,
        tableName: process.env.AIRTABLE_TABLE_NAME
      }
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch medical conditions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 