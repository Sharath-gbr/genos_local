import Airtable from 'airtable';

// Define types for Airtable records
interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
}

interface AirtableError {
  message: string;
  stack?: string;
}

// Environment variables validation
const apiKey = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_ACCESS_TOKEN;
const baseId = process.env.AIRTABLE_BASE_ID;
const tableName = process.env.AIRTABLE_TABLE_NAME;

if (!apiKey || !baseId) {
  throw new Error('Missing required Airtable configuration (API key or Base ID)');
}

// Configure Airtable
Airtable.configure({
  apiKey: apiKey
});

// Create base instance
export const airtableBase = new Airtable({ apiKey }).base(baseId);

// Create table instance if table name is provided
export const table = tableName ? airtableBase(tableName) : null;

// Function to fetch records for a specific patient ID
export async function getPatientRecords(patientId: string) {
  if (!table) {
    throw new Error('Table name not configured');
  }

  try {
    console.log('Fetching records for patient:', patientId);
    const records = await table.select({
      filterByFormula: `SEARCH("${patientId}", {ID})`
    }).all();
    console.log(`Successfully fetched ${records.length} records for patient ${patientId}`);
    
    // Map the records and include the name fields
    const mappedRecords = records.map((record: AirtableRecord) => {
      // Extract name from "GENOS ID + Name" field which is in format "GEN135 - Firstname Lastname"
      const fullNameField = record.fields['GENOS ID + Name'] || '';
      const namePart = fullNameField.split(' - ')[1] || '';
      
      return {
        id: record.id,
        fullName: namePart,
        ...record.fields
      };
    });

    return mappedRecords;
  } catch (error) {
    const err = error as AirtableError;
    console.error('Error fetching patient records:', {
      message: err.message,
      stack: err.stack,
      patientId
    });
    throw error;
  }
}

// Function to fetch all records from a table
export async function getAllRecords() {
  if (!table) {
    throw new Error('Table name not configured');
  }

  try {
    console.log('Fetching records from Airtable...');
    const records = await table.select().all();
    console.log(`Successfully fetched ${records.length} records`);
    return records.map((record: AirtableRecord) => ({
      id: record.id,
      ...record.fields
    }));
  } catch (error) {
    const err = error as AirtableError;
    console.error('Error fetching records:', {
      message: err.message,
      stack: err.stack
    });
    throw error;
  }
}

// Function to fetch a single record by ID
export async function getRecordById(id: string) {
  if (!table) {
    throw new Error('Table name not configured');
  }

  try {
    const record = await table.find(id);
    return {
      id: record.id,
      ...record.fields
    };
  } catch (error) {
    console.error('Error fetching record:', error);
    throw error;
  }
}

// Function to fetch records from a specific table and view
export async function getAirtableRecords({ 
  tableName, 
  view = 'Grid View',
  filterByFormula = ''
}: { 
  tableName: string; 
  view?: string;
  filterByFormula?: string;
}) {
  try {
    const table = airtableBase(tableName);
    const selectOptions: any = { view };
    
    if (filterByFormula) {
      selectOptions.filterByFormula = filterByFormula;
    }
    
    const records = await table.select(selectOptions).all();
    
    return records.map((record: AirtableRecord) => ({
      id: record.id,
      ...record.fields
    }));
  } catch (error) {
    console.error('Error fetching records:', error);
    throw error;
  }
} 