# Food and Sensitivity Hub Widget

This widget displays user-specific food sensitivity data from Supabase based on the user's authenticated email address.

## Setup Instructions

### Supabase Configuration

1. Ensure your `weight_logs` table exists in Supabase
2. The table should have an `Email` column (case-sensitive) to identify user data
3. Enable Row Level Security (RLS) on the table using:
   ```sql
   ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view their own weight logs" 
   ON public.weight_logs 
   FOR SELECT 
   USING (
     "Email" = auth.jwt() ->> 'email'
   );
   ```

### User Authentication

The widget requires Supabase authentication to be set up. Users must have:
- Email address stored in their authentication record
- First name and last name stored in their user metadata (for display purposes)

## How It Works

1. When a user logs in, the widget retrieves their email, first name, and last name from Supabase
2. The widget queries the `weight_logs` table directly using the Supabase client
3. Row Level Security automatically filters the results to only show data matching the user's email
4. The widget displays the data or shows appropriate error messages

## Error Handling

The widget handles the following error scenarios:

- User not logged in (authentication error)
- No data found for the user
- API failures or connection issues

## Extending the Widget

To add more features to the widget:

1. Update the `FoodSensitivityWidget.tsx` component to display additional UI elements
2. Add more columns to your `weight_logs` table in Supabase
3. Add additional queries or mutations as needed for more complex interactions
4. Consider adding filtering, sorting, or pagination for larger datasets 