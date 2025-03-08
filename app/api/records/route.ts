import { NextResponse } from 'next/server';
import { getAllRecords } from '@/lib/airtable';

export async function GET() {
  try {
    const records = await getAllRecords();
    return NextResponse.json(records);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
} 