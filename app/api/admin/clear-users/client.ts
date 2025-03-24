/**
 * Client utility to delete users from the database
 * This is meant for development and testing purposes only
 */

// The admin key used for authorization (should match the server-side key)
const ADMIN_KEY = 'dev-admin-key';

/**
 * Delete a specific user by email
 * 
 * @param email The email of the user to delete
 * @returns Result object with success status and message
 */
export async function deleteUserByEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`/api/admin/clear-users?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: {
        'x-admin-key': ADMIN_KEY
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.error || `Failed to delete user with status ${response.status}`
      };
    }
    
    return {
      success: true,
      message: data.message || 'User deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while deleting the user'
    };
  }
}

/**
 * Delete all users from the database
 * Use with caution! This will permanently delete all user data.
 * 
 * @returns Result object with success status and message
 */
export async function deleteAllUsers(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/admin/clear-users', {
      method: 'DELETE',
      headers: {
        'x-admin-key': ADMIN_KEY
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.error || `Failed to delete users with status ${response.status}`
      };
    }
    
    return {
      success: true,
      message: data.message || 'All users deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting all users:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while deleting users'
    };
  }
} 