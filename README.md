# NEN Dashboard

A modern, secure dashboard application built with Next.js, NextAuth, and Material-UI.

## Features

- 🔐 Secure authentication with NextAuth
  - Google OAuth integration
  - Email/Password authentication
  - Password reset functionality
  - Session management
- 🎨 Modern UI with Material-UI
  - Responsive design
  - Dark theme
  - Custom styled components
- 📱 Responsive design
  - Mobile-first approach
  - Adaptive layouts
- 🚀 Fast performance with Next.js
  - Server-side rendering
  - API routes
  - TypeScript support
- 🔒 Protected routes
  - Role-based access control
  - Secure API endpoints
- 📧 Email integration
  - Password reset emails
  - Email verification

## Tech Stack

- Next.js 15.2.1
- NextAuth.js for authentication
- Material-UI for UI components
- TypeScript for type safety
- React for UI components
- Airtable for data storage

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Sharath-gbr/nen-dashboard.git
```

2. Install dependencies:
```bash
cd nen-dashboard
npm install
```

3. Set up environment variables:
- Copy `.env.example` to `.env.local`
- Update the variables with your credentials
- See `.env.example` for detailed setup instructions

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nen-dashboard/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # Reusable components
│   ├── dashboard/         # Dashboard pages
│   └── theme.ts           # Theme configuration
├── public/                # Static files
└── package.json          # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security

- All sensitive information is stored in environment variables
- OAuth credentials are properly secured
- API routes are protected
- Session management is handled securely

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Deployment Checklist

⚠️ **Important**: Do not reuse development tokens in production!

Before deploying to production, ensure you:

1. **Google OAuth Configuration**
   - Create new OAuth 2.0 Client credentials for production
   - Update authorized origins and redirect URIs
   - Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

2. **NextAuth Configuration**
   - Generate new `NEXTAUTH_SECRET` using `openssl rand -base64 32`
   - Update `NEXTAUTH_URL` to production URL

3. **Airtable Configuration**
   - Generate new access token for production
   - Verify base ID and table names
   - Update `AIRTABLE_ACCESS_TOKEN` and `AIRTABLE_BASE_ID`

4. **Email Configuration**
   - Create new Gmail App Password for production
   - Update email configuration settings

5. **Profile Picture Storage**
   - Set up cloud storage service (e.g., AWS S3, Google Cloud Storage)
   - Configure storage bucket and access permissions
   - Add storage service credentials to environment variables:
     ```
     STORAGE_BUCKET_NAME=your-bucket-name
     STORAGE_ACCESS_KEY=your-access-key
     STORAGE_SECRET_KEY=your-secret-key
     STORAGE_REGION=your-region
     ```
   - Update profile picture upload functionality to use cloud storage
   - Implement proper file size limits and type validation
   - Set up CDN (optional) for better performance

Remember to:
- Test all functionality with new production credentials
- Verify security headers and CORS settings
- Enable proper logging and monitoring
- Set up backup procedures for user data
