import Link from 'next/link';
import './globals.css';
import { menoBanner, gaMaamli, gibson, quicksand } from './fonts';

export const metadata = {
  title: 'Annabella Insurance DME Search',
  description: 'Search for Durable Medical Equipment providers in your area',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${menoBanner.variable} ${gaMaamli.variable} ${gibson.variable} ${quicksand.variable}`}>
        {children}
      </body>
    </html>
  );
}
