import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { supabase } from './db';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

export async function sendVerificationEmail(email: string, userId: string) {
  const verificationToken = generateToken();
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify/${verificationToken}`;

  // Store token in database
  await storeVerificationToken(userId, verificationToken);

  // Send email
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your email for Genos',
    html: `
      <h1>Welcome to Genos!</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `
  });
}

export async function sendPasswordResetEmail(email: string, userId: string) {
  const resetToken = generateToken();
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;

  // Store token in database
  await storeResetToken(userId, resetToken);

  // Send email
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset your password for Genos',
    html: `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `
  });
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function storeVerificationToken(userId: string, token: string) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

  await supabase
    .from('verification_tokens')
    .insert([
      {
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString()
      }
    ]);
}

async function storeResetToken(userId: string, token: string) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

  await supabase
    .from('password_reset_tokens')
    .insert([
      {
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString()
      }
    ]);
} 