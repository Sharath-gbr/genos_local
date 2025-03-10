import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';
import { RootWrapper } from './rootStyles';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NEN - Nutrition & Wellness Portal",
  description: "Your personal nutrition and wellness journey",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <Providers session={session}>
          <RootWrapper>
            {children}
          </RootWrapper>
        </Providers>
      </body>
    </html>
  );
}
