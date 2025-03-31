import type { Metadata } from 'next';
import { menoBanner, gibson } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Annabella Insurance Lookup Tool',
  description: 'Find insurance providers in your area',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${menoBanner.variable} ${gibson.variable}`}>
        {children}
      </body>
    </html>
  );
}
