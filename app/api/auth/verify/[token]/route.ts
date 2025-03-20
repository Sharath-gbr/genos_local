import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/db';

interface VerifyResponse {
  success: boolean;
  message: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
): Promise<NextResponse<VerifyResponse>> {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find and verify token
    const { data: verificationToken, error: tokenError } = await supabase
      .from('verification_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !verificationToken || verificationToken.expires_at < new Date().toISOString()) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Update user verification status
    const { error: updateError } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('id', verificationToken.user_id);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: 'Failed to verify user' },
        { status: 500 }
      );
    }

    // Delete used token
    await supabase
      .from('verification_tokens')
      .delete()
      .eq('token', token);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to verify email' },
      { status: 500 }
    );
  }
} 