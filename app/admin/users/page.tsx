'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Container, Alert, Paper, Divider, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import { deleteUserByEmail, deleteAllUsers } from '@/app/api/admin/clear-users/client';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * Admin page for managing users
 * This page is for development and testing purposes only
 */
export default function AdminUsersPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Load users on page load
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Load the list of users from Supabase
   */
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error('Error loading users:', error);
        return;
      }
      
      setUsers(data?.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  /**
   * Handle deleting a specific user by email
   */
  const handleDeleteUser = async () => {
    if (!email.trim()) {
      setResult({
        success: false,
        message: 'Please enter an email address'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await deleteUserByEmail(email);
      setResult(response);
      if (response.success) {
        setEmail(''); // Clear the email input on success
        loadUsers(); // Reload the user list
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle deleting all users
   */
  const handleDeleteAllUsers = async () => {
    // Confirmation
    if (!window.confirm('Are you sure you want to delete ALL users? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await deleteAllUsers();
      setResult(response);
      if (response.success) {
        loadUsers(); // Reload the user list
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        This page is for development and testing purposes only.
      </Typography>

      {result && (
        <Alert 
          severity={result.success ? 'success' : 'error'} 
          sx={{ mb: 3 }}
        >
          {result.message}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Delete User by Email
        </Typography>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{ mr: 2 }}
            disabled={isLoading}
          />
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDeleteUser}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Delete User'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Delete All Users
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Warning: This will permanently delete all user data from the database.
          Use this option only in development environments.
        </Typography>
        <Button 
          variant="contained" 
          color="error" 
          onClick={handleDeleteAllUsers}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Delete All Users'}
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Users {isLoadingUsers && <CircularProgress size={20} sx={{ ml: 1 }} />}
        </Typography>
        
        <Button 
          variant="outlined" 
          onClick={loadUsers} 
          sx={{ mb: 2 }}
          disabled={isLoadingUsers}
        >
          Refresh User List
        </Button>
        
        {users.length === 0 ? (
          <Typography variant="body1" sx={{ py: 2, textAlign: 'center' }}>
            No users found
          </Typography>
        ) : (
          <List>
            {users.map((user) => (
              <ListItem key={user.id} divider>
                <ListItemText
                  primary={user.email}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        ID: {user.id}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Created: {new Date(user.created_at).toLocaleString()}
                      </Typography>
                      {user.user_metadata && (
                        <>
                          <br />
                          <Typography component="span" variant="body2">
                            Name: {user.user_metadata.first_name} {user.user_metadata.last_name}
                          </Typography>
                        </>
                      )}
                    </>
                  }
                />
                <Button 
                  color="error" 
                  onClick={() => {
                    setEmail(user.email || '');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Delete
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
} 