import { NextResponse } from 'next/server';
import { initializeDb } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const db = await initializeDb();

    // Find user with verification token
    const user = await db.get(
      'SELECT * FROM users WHERE verification_token = ?',
      [token]
    );

    if (!user) {
      return new NextResponse('Invalid or expired verification token', {
        status: 400
      });
    }

    // Update user verification status
    await db.run(
      'UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?',
      [user.id]
    );

    // Redirect to login page with success message
    return new NextResponse(
      '<html><body><h1>Email verified successfully!</h1><p>You can now log in to your account.</p><script>setTimeout(() => window.location.href = "/", 3000)</script></body></html>',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html'
        }
      }
    );
  } catch (error: any) {
    console.error('Verification error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 