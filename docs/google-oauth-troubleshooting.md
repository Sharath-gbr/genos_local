# Google OAuth Troubleshooting Guide

## Common Issues

### Error 400: redirect_uri_mismatch

This error occurs when the redirect URI used in the authentication request doesn't match any of the authorized redirect URIs configured in your Google Cloud Console.

#### How to Fix:

1. **Check Your App Configuration**

   In your `.env.local` file, verify that `NEXTAUTH_URL` matches the port your application is running on:
   ```
   NEXTAUTH_URL=http://localhost:3002
   ```

   The app is configured to run on port 3002 in the `package.json`:
   ```json
   "scripts": {
     "dev": "next dev -p 3002",
     ...
   }
   ```

2. **Update Google Cloud Console Settings**

   1. Go to [Google Cloud Console](https://console.cloud.google.com/)
   2. Navigate to "APIs & Services" > "Credentials"
   3. Find and edit your OAuth 2.0 Client ID
   4. Under "Authorized redirect URIs", make sure you have:
      ```
      http://localhost:3002/api/auth/callback/google
      ```
   5. Under "Authorized JavaScript origins", make sure you have:
      ```
      http://localhost:3002
      ```
   6. Click "Save"

3. **Verify the NextAuth Configuration**

   In `lib/auth.ts`, the Google Provider should be configured without any custom redirect URI:
   ```typescript
   GoogleProvider({
     clientId: process.env.GOOGLE_CLIENT_ID!,
     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
   })
   ```

4. **Clear Browser Cache and Cookies**

   Sometimes old sessions or cache can cause authentication issues. Try:
   - Clearing your browser cache
   - Removing cookies related to your app domain
   - Using incognito/private browsing mode

## Production Deployment

When deploying to production:

1. Update `.env.production` with your production URL
   ```
   NEXTAUTH_URL=https://your-production-domain.com
   ```

2. Update Google Cloud Console with production URLs:
   - Authorized redirect URI: `https://your-production-domain.com/api/auth/callback/google`
   - Authorized JavaScript origin: `https://your-production-domain.com`

## Testing Tips

- When testing OAuth flows, use incognito/private browsing mode to avoid issues with existing sessions
- Enable debug mode in NextAuth to see detailed logs: `debug: true` in auth options
- Check browser console for any additional errors or warnings during the sign-in process

If you continue to experience issues, check the [NextAuth.js documentation](https://next-auth.js.org/configuration/providers/oauth) for more details on configuring OAuth providers. 