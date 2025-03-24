import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';
import { RootWrapper } from './rootStyles';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NEN - Nutrition & Wellness Portal",
  description: "Your personal nutrition and wellness journey",
};

/**
 * Root layout component that wraps the entire application
 * Provides global styles, fonts, and context providers
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <Providers>
          <RootWrapper>
            {children}
          </RootWrapper>
        </Providers>
      </body>
    </html>
  );
}
