import { createClient } from '@/lib/supabase/client';
import { SignUpFormData } from '@/app/components/auth/SignUpForm';

/**
 * Auth service using Supabase for user authentication and management.
 * This service encapsulates all authentication-related functionality.
 */
export const AuthService = {
  /**
   * Register a new user with email, password, and profile information.
   * This creates an auth user but doesn't try to create a profile record in a custom users table.
   * 
   * @param {SignUpFormData} userData - User registration data
   * @returns {Promise<{success: boolean, error?: string}>} - Result object
   */
  async signUp({ email, password, firstName, lastName }: SignUpFormData): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();
      
      // For development: Skip email verification in local environment
      // In production, this should use proper email verification
      const emailConfirmation = process.env.NODE_ENV === 'development' ? false : true;
      
      // Get the app URL from environment variable, fallback to window.location.origin
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      
      // Register the user with Supabase Auth, including first and last name in user metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`
          },
          emailRedirectTo: `${appUrl}/auth/callback`,
          // For development, disable email confirmation
          emailConfirm: emailConfirmation
        },
      });

      if (error) {
        console.error('Auth signup error:', error);
        return { success: false, error: error.message };
      }

      // If we're in development mode, auto-confirm the user
      if (process.env.NODE_ENV === 'development' && data.user) {
        try {
          // Note: This only works with service role key which we'll set up in API route
          // Here we just return success and will handle confirmation separately
          console.log('Development mode: Email confirmation would be skipped in production');
        } catch (confirmError) {
          console.error('Error confirming user:', confirmError);
          // Still consider signup successful even if auto-confirmation fails
        }
      }

      // Skip creating a separate profile record - just store metadata in auth.users
      // This avoids issues with the users table not existing
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  /**
   * Sign in a user with email and password
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<{success: boolean, error?: string}>} - Result object
   */
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  /**
   * Sign out the current user
   * 
   * @returns {Promise<{success: boolean, error?: string}>} - Result object
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },
  
  /**
   * Get the current authenticated user
   * 
   * @returns {Promise<User | null>} - The current user or null
   */
  async getCurrentUser() {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
}; 