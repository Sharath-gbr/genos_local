import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_KEY = process.env.ADMIN_API_KEY || 'dev-admin-key';

/**
 * Admin-only API route to delete users from Supabase
 * This is useful for testing and development purposes
 * 
 * Can be used to:
 * 1. Delete a specific user by email
 * 2. Delete all users (when no email is provided)
 */
export async function DELETE(request: NextRequest) {
  // Get the admin key from the request header for authorization
  const adminKey = request.headers.get('x-admin-key');
  
  // Verify admin key
  if (adminKey !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore },
      { supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY }
    );
    
    // Get the email from search params (optional)
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    // If email is provided, delete that specific user
    if (email) {
      // First get the user by email from auth schema
      const { data: { users }, error: userError } = await supabase.auth.admin.listUsers({
        filters: {
          email: email
        }
      });
      
      if (userError || !users || users.length === 0) {
        return NextResponse.json({ 
          error: userError?.message || 'User not found with that email'
        }, { status: 404 });
      }
      
      // Delete the user from auth
      const userId = users[0].id;
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        return NextResponse.json({ 
          error: `Failed to delete user: ${deleteError.message}` 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        message: `User with email ${email} deleted successfully` 
      }, { status: 200 });
    } 
    // If no email is provided, delete all users (for development purposes only)
    else {
      // First list all users
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        return NextResponse.json({ 
          error: `Failed to list users: ${listError.message}` 
        }, { status: 500 });
      }
      
      if (!users || users.length === 0) {
        return NextResponse.json({ 
          message: 'No users found to delete' 
        }, { status: 200 });
      }
      
      // Keep track of deletion results
      const results = {
        success: 0,
        failed: 0,
        totalUsers: users.length
      };
      
      // Delete each user
      for (const user of users) {
        try {
          const { error } = await supabase.auth.admin.deleteUser(user.id);
          if (error) {
            console.error(`Failed to delete user ${user.id}:`, error);
            results.failed++;
          } else {
            results.success++;
          }
        } catch (error) {
          console.error(`Error deleting user ${user.id}:`, error);
          results.failed++;
        }
      }
      
      return NextResponse.json({ 
        message: `Deletion complete. Deleted ${results.success}/${results.totalUsers} users successfully.`,
        results
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error in clear-users API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 