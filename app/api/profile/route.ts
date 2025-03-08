import { NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({
  apiKey: process.env.AIRTABLE_ACCESS_TOKEN
}).base(process.env.AIRTABLE_BASE_ID!);

export async function GET(request: Request) {
  try {
    // Get email from the query parameter
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Query Airtable for the user profile
    const records = await base(process.env.AIRTABLE_TABLE_NAME!)
      .select({
        filterByFormula: `{Email} = '${email}'`,
        maxRecords: 1
      })
      .firstPage();

    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const record = records[0];
    const fields = record.fields;

    // Updated field mappings to match Airtable column names
    const profile: ClientProfile = {
      firstName: fields['Your First Name'] as string,
      lastName: fields['Your Last Name'] as string,
      gender: fields['Your Gender'] as string,
      age: Number(fields['Your Age']),
      height: Number(fields['Your Height in centimeters (cm)']),
      weight: Number(fields['Your Weight in kilograms (kg)']),
      weightLossTarget: fields['Weight Loss Target'] as string,
      healthObjective: fields['What is your Health Objective'] as string,
      dietPreference: fields['What is your Diet Preference'] as string,
      country: fields['Country'] as string,
      email: fields['Email'] as string,
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
} 