import type { Metadata } from 'next';
import { menoBanner, gibson } from './fonts';
import Script from 'next/script';
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
      <head>
        {/* GTM Head Script */}
        <Script
          id="gtm-head"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-W27FBLM');
            `,
          }}
        />
      </head>
      <body className={`${menoBanner.variable} ${gibson.variable}`}>
        {/* GTM Body Script (noscript fallback) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W27FBLM"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
