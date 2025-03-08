const Airtable = require('airtable');

// Define types for Airtable records
interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
}

interface AirtableError {
  message: string;
  stack?: string;
}

// Configure Airtable
const airtableConfig = {
  apiKey: process.env.AIRTABLE_ACCESS_TOKEN,
  baseId: process.env.AIRTABLE_BASE_ID,
  tableName: process.env.AIRTABLE_TABLE_NAME
};

console.log('Airtable Config:', {
  baseId: airtableConfig.baseId,
  tableName: airtableConfig.tableName,
  hasApiKey: !!airtableConfig.apiKey
});

const base = new Airtable({
  apiKey: airtableConfig.apiKey
}).base(airtableConfig.baseId!);

export const table = base(airtableConfig.tableName!);

// Function to fetch records for a specific patient ID
export async function getPatientRecords(patientId: string) {
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

    console.log('First record data:', mappedRecords[0]); // Debug log to see the data structure
    return mappedRecords;
  } catch (error) {
    const err = error as AirtableError;
    console.error('Error fetching patient records:', {
      message: err.message,
      stack: err.stack,
      patientId,
      config: {
        baseId: airtableConfig.baseId,
        tableName: airtableConfig.tableName,
        hasApiKey: !!airtableConfig.apiKey
      }
    });
    throw error;
  }
}

// Function to fetch all records from a table
export async function getAllRecords() {
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
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      config: {
        baseId: airtableConfig.baseId,
        tableName: airtableConfig.tableName,
        hasApiKey: !!airtableConfig.apiKey
      }
    });
    throw error;
  }
}

// Function to fetch a single record by ID
export async function getRecordById(id: string) {
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