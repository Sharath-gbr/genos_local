import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// Log environment variables (without exposing sensitive values)
console.log('Blood Report API - Environment check:', {
  hasToken: !!process.env.AIRTABLE_ACCESS_TOKEN,
  hasBaseId: !!process.env.AIRTABLE_BASE_ID,
  myClientsTable: process.env.AIRTABLE_MY_CLIENTS_TABLE,
  bloodReportsTable: process.env.AIRTABLE_BLOOD_REPORTS_TABLE
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

    // Query the doctors intake table
    const records = await base(process.env.AIRTABLE_TABLE_NAME!)
      .select({
        filterByFormula: `{email} = '${email}'`,
        maxRecords: 1
      })
      .firstPage();

    console.log('2. Records found:', records?.length);

    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const record = records[0];
    console.log('3. Available fields:', Object.keys(record.fields));
    
    const diabeticFindings = record.fields['Diabetic Markers'] || record.fields['Diabetic Markers Findings'] || '';
    console.log('4. Diabetic findings:', diabeticFindings);

    // Parse the findings into an array of objects
    const findings = diabeticFindings.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('•'))
      .map(line => {
        const match = line.substring(1).trim().match(/(.*?)\s*\((.*?)\)/);
        if (match) {
          return {
            finding: match[1].trim(),
            value: match[2].trim()
          };
        }
        return null;
      })
      .filter(Boolean);

    console.log('5. Parsed findings:', findings);

    return NextResponse.json({ diabeticFindings: findings });

  } catch (error) {
    console.error('Error in blood report API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blood report' },
      { status: 500 }
    );
  }
} 