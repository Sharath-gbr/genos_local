import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function GET() {
  try {
    // Log environment variables
    console.log('Environment variables:', {
      hasToken: !!process.env.AIRTABLE_ACCESS_TOKEN,
      hasBaseId: !!process.env.AIRTABLE_BASE_ID,
      tableName: process.env.AIRTABLE_TABLE_NAME
    });

    // Initialize Airtable
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_ACCESS_TOKEN
    }).base(process.env.AIRTABLE_BASE_ID!);

    // Try to fetch records
    const records = await base(process.env.AIRTABLE_TABLE_NAME!)
      .select({
        maxRecords: 1
      })
      .firstPage();

    // Return success response
    return NextResponse.json({
      success: true,
      recordCount: records.length,
      firstRecordFields: records[0] ? Object.keys(records[0].fields) : [],
      config: {
        hasToken: !!process.env.AIRTABLE_ACCESS_TOKEN,
        hasBaseId: !!process.env.AIRTABLE_BASE_ID,
        tableName: process.env.AIRTABLE_TABLE_NAME
      }
    });

  } catch (error) {
    // Return detailed error response
    return NextResponse.json({
      success: false,
      error: {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      config: {
        hasToken: !!process.env.AIRTABLE_ACCESS_TOKEN,
        hasBaseId: !!process.env.AIRTABLE_BASE_ID,
        tableName: process.env.AIRTABLE_TABLE_NAME
      }
    }, { status: 500 });
  }
} 