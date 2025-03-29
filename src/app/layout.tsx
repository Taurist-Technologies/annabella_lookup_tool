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
        {/* <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="text-xl font-bold text-gray-800">
                    DME Search
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  href="/admin"
                  className="ml-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Admin Dashboard
                </Link>
              </div>
            </div>
          </div>
        </nav> */}
        {children}
      </body>
    </html>
  );
}
