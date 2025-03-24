/**
 * Type definitions for Supabase database schema.
 * This provides TypeScript type safety when interacting with the database.
 * 
 * As the database schema evolves, update these types to match.
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          updated_at?: string;
        };
      };
      // Add other tables as needed
    };
    Views: {
      // Add views here if needed
    };
    Functions: {
      // Add functions here if needed
    };
    Enums: {
      // Add enums here if needed
    };
  };
}; 